"""Booking lifecycle + the double-booking-safe reservation path."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    NotFoundError,
    PermissionError_,
    ValidationError_,
)
from app.models.booking import Booking
from app.models.calendar import CalendarDay
from app.models.enums import BlockSource, BookingStatus, DayStatus, PropertyStatus
from app.models.property import Property
from app.models.user import User
from app.services import pricing


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _nights(check_in: date, check_out: date) -> list[date]:
    days: list[date] = []
    cur = check_in
    while cur < check_out:
        days.append(cur)
        cur += timedelta(days=1)
    return days


async def _load_published_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await db.get(Property, property_id)
    if prop is None or prop.status != PropertyStatus.PUBLISHED:
        raise NotFoundError("Property not found.")
    return prop


def _validate_dates(prop: Property, check_in: date, check_out: date) -> None:
    if check_out <= check_in:
        raise ValidationError_("check_out must be after check_in.")
    if check_in < date.today():
        raise ValidationError_("check_in cannot be in the past.")
    nights = (check_out - check_in).days
    if nights < prop.min_nights:
        raise ValidationError_(f"Minimum stay is {prop.min_nights} night(s).")
    if prop.max_nights is not None and nights > prop.max_nights:
        raise ValidationError_(f"Maximum stay is {prop.max_nights} night(s).")


def _quote_for(prop: Property, check_in: date, check_out: date, is_deposit: bool) -> pricing.Quote:
    return pricing.compute_quote(
        check_in=check_in,
        check_out=check_out,
        nightly_price=prop.base_price_per_night,
        cleaning_fee=prop.cleaning_fee,
        security_deposit=prop.security_deposit,
        down_payment_percentage=prop.down_payment_percentage,
        is_deposit=is_deposit,
    )


async def quote(
    db: AsyncSession,
    property_id: uuid.UUID,
    check_in: date,
    check_out: date,
    guests: int,
    is_deposit: bool,
) -> tuple[Property, pricing.Quote]:
    prop = await _load_published_property(db, property_id)
    _validate_dates(prop, check_in, check_out)
    if guests > prop.max_guests:
        raise ValidationError_(f"This property hosts up to {prop.max_guests} guests.")
    return prop, _quote_for(prop, check_in, check_out, is_deposit)


async def create_booking(
    db: AsyncSession,
    guest: User,
    *,
    property_id: uuid.UUID,
    check_in: date,
    check_out: date,
    guests: int,
    is_deposit: bool,
    car_plate: str | None = None,
) -> Booking:
    prop, q = await quote(db, property_id, check_in, check_out, guests, is_deposit)

    if prop.host_id == guest.id:
        raise ValidationError_("You cannot book your own property.")
    # National ID is mandatory for the security-gate guest list.
    if not guest.national_id:
        raise ValidationError_("Please add your National ID before booking.")

    booking = Booking(
        property_id=prop.id,
        guest_id=guest.id,
        host_id=prop.host_id,
        check_in=check_in,
        check_out=check_out,
        nights=q.nights,
        guests_count=guests,
        guest_national_id=guest.national_id,
        guest_car_plate=car_plate,
        status=BookingStatus.PENDING_PAYMENT,
        nightly_price=q.nightly_price,
        room_subtotal=q.room_subtotal,
        cleaning_fee=q.cleaning_fee,
        security_deposit=q.security_deposit,
        total_amount=q.total_amount,
        is_deposit=q.is_deposit,
        down_payment_percentage=q.down_payment_percentage,
        amount_due_now=q.amount_due_now,
        expires_at=_now() + timedelta(minutes=settings.BOOKING_HOLD_MINUTES),
    )

    # Atomic hold: insert one BOOKED night per date inside a savepoint. The
    # unique (property_id, date) constraint is what makes two simultaneous
    # "Book Now" clicks for the same dates impossible — the loser hits an
    # IntegrityError and is rejected cleanly.
    try:
        async with db.begin_nested():
            db.add(booking)
            await db.flush()
            for night in _nights(check_in, check_out):
                db.add(
                    CalendarDay(
                        property_id=prop.id,
                        date=night,
                        status=DayStatus.BOOKED,
                        source=BlockSource.INTERNAL_BOOKING,
                        booking_id=booking.id,
                    )
                )
            await db.flush()
    except IntegrityError as exc:
        raise ConflictError("Sorry, those dates were just taken. Please pick another range.") from exc

    return booking


# --------------------------------------------------------------------------- #
# Reads & authorization
# --------------------------------------------------------------------------- #
async def get_booking_for_user(db: AsyncSession, booking_id: uuid.UUID, user: User) -> Booking:
    booking = await db.get(Booking, booking_id)
    if booking is None:
        raise NotFoundError("Booking not found.")
    from app.models.enums import UserRole

    if (
        booking.guest_id != user.id
        and booking.host_id != user.id
        and not user.has_role(UserRole.ADMIN)
    ):
        raise PermissionError_("You cannot view this booking.")
    return booking


async def list_guest_bookings(
    db: AsyncSession, guest: User, *, limit: int, offset: int
) -> tuple[list[Booking], int]:
    return await _list(db, Booking.guest_id == guest.id, limit, offset)


async def list_host_bookings(
    db: AsyncSession, host: User, *, limit: int, offset: int
) -> tuple[list[Booking], int]:
    return await _list(db, Booking.host_id == host.id, limit, offset)


async def _list(db: AsyncSession, where, limit: int, offset: int) -> tuple[list[Booking], int]:
    from sqlalchemy import func

    base = select(Booking).where(where)
    total = await db.scalar(select(func.count()).select_from(base.subquery()))
    result = await db.execute(base.order_by(Booking.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), int(total or 0)


# --------------------------------------------------------------------------- #
# State transitions
# --------------------------------------------------------------------------- #
async def _release_nights(db: AsyncSession, booking: Booking) -> None:
    await db.execute(delete(CalendarDay).where(CalendarDay.booking_id == booking.id))


async def cancel_booking(db: AsyncSession, booking: Booking, reason: str | None) -> Booking:
    """Cancel a booking, applying the strict Egyptian cancellation policy.

    Cancelling a *confirmed* booking within ``CANCELLATION_WINDOW_DAYS`` of
    check-in forfeits ``CANCELLATION_FEE_PERCENT``% of the amount already paid.
    Unpaid holds cancel with no fee. Dates are always released.
    """
    if booking.status in (BookingStatus.CANCELLED, BookingStatus.EXPIRED, BookingStatus.COMPLETED):
        raise ValidationError_(f"Booking is already {booking.status.value}.")

    fee = pricing.money(0)
    applied = False
    if booking.status == BookingStatus.CONFIRMED and booking.amount_paid > 0:
        days_to_check_in = (booking.check_in - date.today()).days
        if days_to_check_in < settings.CANCELLATION_WINDOW_DAYS:
            fee = pricing.money(booking.amount_paid * Decimal(settings.CANCELLATION_FEE_PERCENT) / Decimal(100))
            applied = True

    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = _now()
    booking.cancellation_reason = reason
    booking.cancellation_fee_applied = applied
    booking.cancellation_fee_amount = fee
    await _release_nights(db, booking)
    await db.flush()
    return booking


async def mark_confirmed(db: AsyncSession, booking: Booking, amount_paid) -> Booking:
    booking.status = BookingStatus.CONFIRMED
    booking.confirmed_at = _now()
    booking.expires_at = None
    booking.amount_paid = amount_paid
    await db.flush()
    return booking


async def expire_stale_bookings(db: AsyncSession) -> int:
    """Release holds whose payment window elapsed (called by the scheduler)."""
    result = await db.execute(
        select(Booking).where(
            Booking.status.in_([BookingStatus.PENDING_PAYMENT, BookingStatus.PENDING_APPROVAL]),
            Booking.expires_at.is_not(None),
            Booking.expires_at < _now(),
        )
    )
    stale = list(result.scalars().all())
    for booking in stale:
        booking.status = BookingStatus.EXPIRED
        await _release_nights(db, booking)
    await db.flush()
    return len(stale)
