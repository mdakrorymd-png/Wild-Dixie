"""Booking endpoints: quote, create, manage, pay, dispute."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession, require_role
from app.core.exceptions import PermissionError_
from app.models.enums import PaymentMethod, UserRole
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingRead,
    CancelRequest,
    GatePassRequest,
    QuoteRequest,
    QuoteResponse,
)
from app.schemas.common import Page
from app.schemas.finance import DisputeCreate, DisputeRead
from app.schemas.payment import PaymentInstructions, PaymentRead, PaymentSubmit
from app.services import booking_service, finance_service, payment_service

router = APIRouter(prefix="/bookings", tags=["bookings"])

HostUser = Annotated[User, Depends(require_role(UserRole.HOST))]


def _quote_response(property_id, check_in, check_out, q) -> QuoteResponse:
    return QuoteResponse(
        property_id=property_id,
        check_in=check_in,
        check_out=check_out,
        nights=q.nights,
        currency=q.currency,
        nightly_price=q.nightly_price,
        room_subtotal=q.room_subtotal,
        cleaning_fee=q.cleaning_fee,
        security_deposit=q.security_deposit,
        total_amount=q.total_amount,
        is_deposit=q.is_deposit,
        down_payment_percentage=q.down_payment_percentage,
        down_payment_amount=q.down_payment_amount,
        amount_due_now=q.amount_due_now,
        balance_due_later=q.balance_due_later,
    )


@router.post("/quote", response_model=QuoteResponse)
async def quote(payload: QuoteRequest, _user: CurrentUser, db: DbSession) -> QuoteResponse:
    _prop, q = await booking_service.quote(
        db, payload.property_id, payload.check_in, payload.check_out, payload.guests, payload.is_deposit
    )
    return _quote_response(payload.property_id, payload.check_in, payload.check_out, q)


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate, guest: CurrentUser, db: DbSession) -> BookingRead:
    booking = await booking_service.create_booking(
        db,
        guest,
        property_id=payload.property_id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        is_deposit=payload.is_deposit,
        car_plate=payload.car_plate,
    )
    return BookingRead.model_validate(booking)


@router.get("/mine", response_model=Page[BookingRead])
async def my_bookings(
    guest: CurrentUser,
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[BookingRead]:
    items, total = await booking_service.list_guest_bookings(db, guest, limit=limit, offset=offset)
    return Page(items=[BookingRead.model_validate(b) for b in items], total=total, limit=limit, offset=offset)


@router.get("/hosting", response_model=Page[BookingRead])
async def hosting_bookings(
    host: HostUser,
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[BookingRead]:
    items, total = await booking_service.list_host_bookings(db, host, limit=limit, offset=offset)
    return Page(items=[BookingRead.model_validate(b) for b in items], total=total, limit=limit, offset=offset)


@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(booking_id: uuid.UUID, user: CurrentUser, db: DbSession) -> BookingRead:
    booking = await booking_service.get_booking_for_user(db, booking_id, user)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/cancel", response_model=BookingRead)
async def cancel_booking(
    booking_id: uuid.UUID, payload: CancelRequest, user: CurrentUser, db: DbSession
) -> BookingRead:
    booking = await booking_service.get_booking_for_user(db, booking_id, user)
    booking = await booking_service.cancel_booking(db, booking, payload.reason)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/gate-pass", response_model=BookingRead)
async def set_gate_pass(
    booking_id: uuid.UUID, payload: GatePassRequest, user: CurrentUser, db: DbSession
) -> BookingRead:
    """Host (or admin) marks the resort gate pass issued for this booking."""
    booking = await booking_service.get_booking_for_user(db, booking_id, user)
    if booking.host_id != user.id and not user.has_role(UserRole.ADMIN):
        raise PermissionError_("Only the host can manage the gate pass.")
    booking.gate_pass_status = payload.status
    await db.flush()
    return BookingRead.model_validate(booking)


# --------------------------------------------------------------------------- #
# Payment
# --------------------------------------------------------------------------- #
@router.get("/{booking_id}/payment-instructions", response_model=PaymentInstructions)
async def payment_instructions(
    booking_id: uuid.UUID,
    method: Annotated[PaymentMethod, Query()],
    user: CurrentUser,
    db: DbSession,
) -> PaymentInstructions:
    booking = await booking_service.get_booking_for_user(db, booking_id, user)
    data = payment_service.get_instructions(method, booking)
    return PaymentInstructions(
        method=method,
        amount=booking.amount_due_now,
        currency=booking.currency,
        reference=str(booking.id),
        pay_to=data.get("pay_to"),
    )


@router.post("/{booking_id}/pay", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def pay(
    booking_id: uuid.UUID, payload: PaymentSubmit, guest: CurrentUser, db: DbSession
) -> PaymentRead:
    booking = await booking_service.get_booking_for_user(db, booking_id, guest)
    payment = await payment_service.submit_payment(
        db,
        guest,
        booking,
        method=payload.method,
        receipt_url=payload.receipt_url,
        sender_reference=payload.sender_reference,
    )
    return PaymentRead.model_validate(payment)


# --------------------------------------------------------------------------- #
# Dispute
# --------------------------------------------------------------------------- #
@router.post("/{booking_id}/dispute", response_model=DisputeRead, status_code=status.HTTP_201_CREATED)
async def open_dispute(
    booking_id: uuid.UUID, payload: DisputeCreate, user: CurrentUser, db: DbSession
) -> DisputeRead:
    booking = await booking_service.get_booking_for_user(db, booking_id, user)
    dispute = await finance_service.create_dispute(db, booking, user, payload.reason)
    return DisputeRead.model_validate(dispute)
