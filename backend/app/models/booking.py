"""Booking model — a guest's reservation of a property for a date range."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import BookingStatus

_booking_status_enum = pg_enum(BookingStatus, "booking_status")


class Booking(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "bookings"

    property_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), index=True, nullable=False
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    host_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    guests_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Captured for gated-resort security gate passes (Egypt).
    guest_national_id: Mapped[str | None] = mapped_column(String(14), nullable=True)
    guest_car_plate: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # Gate-pass workflow: "pending" -> "issued" (host issues the compound pass).
    gate_pass_status: Mapped[str] = mapped_column(String(20), nullable=False, server_default=text("'pending'"))

    status: Mapped[BookingStatus] = mapped_column(
        _booking_status_enum, nullable=False, server_default=text("'pending_payment'"), index=True
    )

    # ---- price snapshot (immutable copy at booking time, EGP) ----
    currency: Mapped[str] = mapped_column(String(3), nullable=False, server_default=text("'EGP'"))
    nightly_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    room_subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cleaning_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    security_deposit: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    is_deposit: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    down_payment_percentage: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    amount_due_now: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))

    # ---- lifecycle timestamps ----
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Strict Egyptian cancellation policy: < 7 days before check-in forfeits 100%.
    cancellation_fee_applied: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    cancellation_fee_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Booking {self.id} {self.status.value} {self.check_in}->{self.check_out}>"
