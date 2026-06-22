"""Escrow/payout ledger and dispute logic."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, PermissionError_, ValidationError_
from app.models.booking import Booking
from app.models.enums import DisputeStatus, PayoutStatus, UserRole
from app.models.finance import Dispute, Payout
from app.models.user import User
from app.services.pricing import money


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def create_payout_for_booking(db: AsyncSession, booking: Booking) -> Payout:
    """Create the host payout (idempotent per booking) when a booking confirms.

    Commission is taken on the stay cost (room + cleaning); the refundable
    security deposit is not platform/host revenue.
    """
    existing = await db.scalar(select(Payout).where(Payout.booking_id == booking.id))
    if existing is not None:
        return existing

    gross = money(booking.room_subtotal + booking.cleaning_fee)
    pct = Decimal(str(settings.PLATFORM_COMMISSION_PERCENT))
    commission = money(gross * pct / Decimal(100))
    net = money(gross - commission)

    payout = Payout(
        booking_id=booking.id,
        host_id=booking.host_id,
        gross_amount=gross,
        commission_percentage=pct,
        commission_amount=commission,
        net_amount=net,
        status=PayoutStatus.PENDING,
    )
    db.add(payout)
    await db.flush()
    return payout


async def list_host_payouts(db: AsyncSession, host: User) -> tuple[list[Payout], dict[str, Decimal]]:
    result = await db.execute(
        select(Payout).where(Payout.host_id == host.id).order_by(Payout.created_at.desc())
    )
    payouts = list(result.scalars().all())
    totals = {
        "pending": money(sum((p.net_amount for p in payouts if p.status == PayoutStatus.PENDING), Decimal(0))),
        "paid": money(sum((p.net_amount for p in payouts if p.status == PayoutStatus.PAID), Decimal(0))),
    }
    return payouts, totals


async def owner_statement(db: AsyncSession, host: User) -> dict:
    """Aggregate the host's payouts into a transparent monthly statement."""
    result = await db.execute(
        select(Payout).where(Payout.host_id == host.id).order_by(Payout.created_at.desc())
    )
    payouts = list(result.scalars().all())

    months: dict[str, dict] = {}
    for p in payouts:
        key = p.created_at.strftime("%Y-%m")
        m = months.setdefault(
            key,
            {"month": key, "bookings": 0, "gross": Decimal(0), "commission": Decimal(0),
             "net": Decimal(0), "paid": Decimal(0), "pending": Decimal(0)},
        )
        m["bookings"] += 1
        m["gross"] += p.gross_amount
        m["commission"] += p.commission_amount
        m["net"] += p.net_amount
        if p.status == PayoutStatus.PAID:
            m["paid"] += p.net_amount
        else:
            m["pending"] += p.net_amount

    month_list = []
    for m in months.values():
        month_list.append({k: (money(v) if isinstance(v, Decimal) else v) for k, v in m.items()})

    return {
        "total_bookings": len(payouts),
        "total_gross": money(sum((p.gross_amount for p in payouts), Decimal(0))),
        "total_commission": money(sum((p.commission_amount for p in payouts), Decimal(0))),
        "total_net": money(sum((p.net_amount for p in payouts), Decimal(0))),
        "total_paid": money(sum((p.net_amount for p in payouts if p.status == PayoutStatus.PAID), Decimal(0))),
        "total_pending": money(sum((p.net_amount for p in payouts if p.status == PayoutStatus.PENDING), Decimal(0))),
        "months": month_list,
    }


async def list_all_payouts(db: AsyncSession, status: PayoutStatus | None) -> list[Payout]:
    stmt = select(Payout)
    if status is not None:
        stmt = stmt.where(Payout.status == status)
    result = await db.execute(stmt.order_by(Payout.created_at.desc()))
    return list(result.scalars().all())


async def mark_payout_paid(db: AsyncSession, payout_id: uuid.UUID) -> Payout:
    payout = await db.get(Payout, payout_id)
    if payout is None:
        raise NotFoundError("Payout not found.")
    if payout.status == PayoutStatus.PAID:
        raise ValidationError_("Payout is already paid.")
    payout.status = PayoutStatus.PAID
    payout.paid_at = _now()
    await db.flush()
    return payout


# --------------------------------------------------------------------------- #
# Disputes
# --------------------------------------------------------------------------- #
async def create_dispute(db: AsyncSession, booking: Booking, user: User, reason: str) -> Dispute:
    if booking.guest_id != user.id and booking.host_id != user.id:
        raise PermissionError_("Only the guest or host of this booking can open a dispute.")
    dispute = Dispute(booking_id=booking.id, raised_by=user.id, reason=reason, status=DisputeStatus.OPEN)
    db.add(dispute)
    await db.flush()
    return dispute


async def list_disputes(db: AsyncSession, status: DisputeStatus | None) -> list[Dispute]:
    stmt = select(Dispute)
    if status is not None:
        stmt = stmt.where(Dispute.status == status)
    result = await db.execute(stmt.order_by(Dispute.created_at.desc()))
    return list(result.scalars().all())


async def resolve_dispute(
    db: AsyncSession, dispute_id: uuid.UUID, admin: User, status: DisputeStatus, resolution: str
) -> Dispute:
    if status not in (DisputeStatus.RESOLVED, DisputeStatus.REJECTED):
        raise ValidationError_("Resolution status must be resolved or rejected.")
    dispute = await db.get(Dispute, dispute_id)
    if dispute is None:
        raise NotFoundError("Dispute not found.")
    dispute.status = status
    dispute.resolution = resolution
    dispute.resolved_by = admin.id
    dispute.resolved_at = _now()
    await db.flush()
    return dispute
