"""Payment flows: card (mock) + the Egyptian manual-verification path."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationError_
from app.models.booking import Booking
from app.models.enums import (
    BookingStatus,
    PaymentKind,
    PaymentMethod,
    PaymentStatus,
)
from app.models.payment import Payment
from app.models.user import User
from app.services import booking_service, finance_service


def _now() -> datetime:
    return datetime.now(timezone.utc)


def get_instructions(method: PaymentMethod, booking: Booking) -> dict[str, str]:
    """Platform payment details shown to the guest for a manual transfer."""
    base = {
        "amount": str(booking.amount_due_now),
        "currency": booking.currency,
        "reference": str(booking.id),
    }
    if method == PaymentMethod.INSTAPAY:
        return {**base, "method": "instapay", "pay_to": settings.PLATFORM_INSTAPAY_ADDRESS}
    if method == PaymentMethod.VODAFONE_CASH:
        return {**base, "method": "vodafone_cash", "pay_to": settings.PLATFORM_WALLET_NUMBER}
    return {**base, "method": "card"}


async def _confirm(db: AsyncSession, booking: Booking, payment: Payment) -> None:
    """Shared post-confirmation: confirm booking + open the host payout."""
    await booking_service.mark_confirmed(db, booking, payment.amount)
    await finance_service.create_payout_for_booking(db, booking)


async def submit_payment(
    db: AsyncSession,
    guest: User,
    booking: Booking,
    *,
    method: PaymentMethod,
    receipt_url: str | None,
    sender_reference: str | None,
) -> Payment:
    if booking.guest_id != guest.id:
        raise ValidationError_("You can only pay for your own booking.")
    if booking.status != BookingStatus.PENDING_PAYMENT:
        raise ValidationError_(f"Booking is {booking.status.value}; it cannot be paid.")

    kind = PaymentKind.DOWN_PAYMENT if booking.is_deposit else PaymentKind.FULL
    payment = Payment(
        booking_id=booking.id,
        method=method,
        kind=kind,
        amount=booking.amount_due_now,
        currency=booking.currency,
        receipt_url=receipt_url,
        sender_reference=sender_reference,
    )

    if method == PaymentMethod.CARD:
        # Mock gateway: instant success. Swap for a real PSP later.
        payment.status = PaymentStatus.CONFIRMED
        payment.reviewed_at = _now()
        db.add(payment)
        await db.flush()
        await _confirm(db, booking, payment)
        return payment

    # InstaPay / Vodafone Cash: require a receipt and await admin verification.
    # The booking moves to PENDING_APPROVAL and keeps its hold window.
    if not receipt_url:
        raise ValidationError_("A payment receipt screenshot is required for this method.")
    payment.status = PaymentStatus.AWAITING_REVIEW
    db.add(payment)
    booking.status = BookingStatus.PENDING_APPROVAL
    await db.flush()
    return payment


# --------------------------------------------------------------------------- #
# Admin verification
# --------------------------------------------------------------------------- #
async def list_pending_payments(
    db: AsyncSession, *, limit: int, offset: int
) -> tuple[list[Payment], int]:
    base = select(Payment).where(Payment.status == PaymentStatus.AWAITING_REVIEW)
    total = await db.scalar(select(func.count()).select_from(base.subquery()))
    result = await db.execute(base.order_by(Payment.created_at.asc()).limit(limit).offset(offset))
    return list(result.scalars().all()), int(total or 0)


async def _get_payment(db: AsyncSession, payment_id: uuid.UUID) -> Payment:
    payment = await db.get(Payment, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found.")
    return payment


async def approve_payment(db: AsyncSession, admin: User, payment_id: uuid.UUID) -> Payment:
    payment = await _get_payment(db, payment_id)
    if payment.status != PaymentStatus.AWAITING_REVIEW:
        raise ValidationError_("Only payments awaiting review can be approved.")

    booking = await db.get(Booking, payment.booking_id)
    if booking is None:
        raise NotFoundError("Booking not found.")
    if booking.status not in (BookingStatus.PENDING_APPROVAL, BookingStatus.PENDING_PAYMENT):
        raise ValidationError_(f"Booking is {booking.status.value}; cannot confirm.")

    payment.status = PaymentStatus.CONFIRMED
    payment.reviewed_by = admin.id
    payment.reviewed_at = _now()
    await _confirm(db, booking, payment)
    await db.flush()
    return payment


async def reject_payment(
    db: AsyncSession, admin: User, payment_id: uuid.UUID, notes: str
) -> Payment:
    payment = await _get_payment(db, payment_id)
    if payment.status != PaymentStatus.AWAITING_REVIEW:
        raise ValidationError_("Only payments awaiting review can be rejected.")

    payment.status = PaymentStatus.REJECTED
    payment.reviewed_by = admin.id
    payment.reviewed_at = _now()
    payment.review_notes = notes

    # Release the held nights so the dates free up again.
    booking = await db.get(Booking, payment.booking_id)
    if booking is not None and booking.status in (BookingStatus.PENDING_APPROVAL, BookingStatus.PENDING_PAYMENT):
        await booking_service.cancel_booking(db, booking, reason=f"Payment rejected: {notes}")
    await db.flush()
    return payment
