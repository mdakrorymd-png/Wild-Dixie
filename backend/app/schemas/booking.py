"""Booking & quote schemas."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BookingStatus


class QuoteRequest(BaseModel):
    property_id: uuid.UUID
    check_in: date
    check_out: date
    guests: int = Field(1, ge=1, le=100)
    is_deposit: bool = False


class QuoteResponse(BaseModel):
    property_id: uuid.UUID
    check_in: date
    check_out: date
    nights: int
    currency: str
    nightly_price: Decimal
    room_subtotal: Decimal
    cleaning_fee: Decimal
    security_deposit: Decimal
    total_amount: Decimal
    is_deposit: bool
    down_payment_percentage: int
    down_payment_amount: Decimal
    amount_due_now: Decimal
    balance_due_later: Decimal


class BookingCreate(BaseModel):
    property_id: uuid.UUID
    check_in: date
    check_out: date
    guests: int = Field(1, ge=1, le=100)
    is_deposit: bool = False
    # Collected for the resort security gate pass.
    car_plate: str | None = Field(None, max_length=20)


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    property_id: uuid.UUID
    guest_id: uuid.UUID
    host_id: uuid.UUID
    check_in: date
    check_out: date
    nights: int
    guests_count: int
    guest_national_id: str | None
    guest_car_plate: str | None
    gate_pass_status: str
    status: BookingStatus
    currency: str
    nightly_price: Decimal
    room_subtotal: Decimal
    cleaning_fee: Decimal
    security_deposit: Decimal
    total_amount: Decimal
    is_deposit: bool
    down_payment_percentage: int
    amount_due_now: Decimal
    amount_paid: Decimal
    cancellation_fee_applied: bool
    cancellation_fee_amount: Decimal
    expires_at: datetime | None
    confirmed_at: datetime | None
    created_at: datetime


class CancelRequest(BaseModel):
    reason: str | None = Field(None, max_length=500)


class GatePassRequest(BaseModel):
    status: str = Field("issued", pattern="^(pending|issued)$")
