"""Payment schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import PaymentKind, PaymentMethod, PaymentStatus


class PaymentInstructions(BaseModel):
    method: PaymentMethod
    amount: Decimal
    currency: str
    reference: str
    # Present for manual methods (InstaPay address / wallet number).
    pay_to: str | None = None


class PaymentSubmit(BaseModel):
    method: PaymentMethod
    receipt_url: str | None = Field(None, max_length=1000)
    sender_reference: str | None = Field(None, max_length=255)


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    booking_id: uuid.UUID
    method: PaymentMethod
    kind: PaymentKind
    status: PaymentStatus
    amount: Decimal
    currency: str
    receipt_url: str | None
    sender_reference: str | None
    reviewed_at: datetime | None
    review_notes: str | None
    created_at: datetime


class RejectPaymentRequest(BaseModel):
    notes: str = Field(..., min_length=3, max_length=500)
