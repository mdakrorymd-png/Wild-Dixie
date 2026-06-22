"""Payout & dispute schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DisputeStatus, PayoutStatus


class PayoutRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    booking_id: uuid.UUID
    host_id: uuid.UUID
    currency: str
    gross_amount: Decimal
    commission_percentage: Decimal
    commission_amount: Decimal
    net_amount: Decimal
    status: PayoutStatus
    paid_at: datetime | None
    created_at: datetime


class HostPayoutSummary(BaseModel):
    items: list[PayoutRead]
    total_pending: Decimal
    total_paid: Decimal


class MonthStatement(BaseModel):
    month: str  # "YYYY-MM"
    bookings: int
    gross: Decimal
    commission: Decimal
    net: Decimal
    paid: Decimal
    pending: Decimal


class OwnerStatement(BaseModel):
    """Transparent earnings breakdown for an owner — the trust differentiator."""

    currency: str = "EGP"
    total_bookings: int
    total_gross: Decimal
    total_commission: Decimal
    total_net: Decimal
    total_paid: Decimal
    total_pending: Decimal
    months: list[MonthStatement]


class DisputeCreate(BaseModel):
    reason: str = Field(..., min_length=5, max_length=2000)


class DisputeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    booking_id: uuid.UUID
    raised_by: uuid.UUID
    reason: str
    status: DisputeStatus
    resolution: str | None
    resolved_at: datetime | None
    created_at: datetime


class DisputeResolve(BaseModel):
    status: DisputeStatus
    resolution: str = Field(..., min_length=3, max_length=2000)
