"""Payment model — one payment attempt against a booking.

Supports card (mock auto-confirm) plus the Egyptian manual-verification flow:
InstaPay / Vodafone Cash, where the guest uploads a receipt screenshot and an
admin confirms the transfer.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import PaymentKind, PaymentMethod, PaymentStatus

_method_enum = pg_enum(PaymentMethod, "payment_method")
_kind_enum = pg_enum(PaymentKind, "payment_kind")
_status_enum = pg_enum(PaymentStatus, "payment_status")


class Payment(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "payments"

    booking_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), index=True, nullable=False
    )
    method: Mapped[PaymentMethod] = mapped_column(_method_enum, nullable=False)
    kind: Mapped[PaymentKind] = mapped_column(_kind_enum, nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(_status_enum, nullable=False, index=True)

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="EGP")

    # Manual-verification fields.
    receipt_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    sender_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Payment {self.id} {self.method.value} {self.status.value} {self.amount}>"
