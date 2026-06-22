"""Escrow/payout ledger and dispute records."""
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
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import DisputeStatus, PayoutStatus

_payout_status_enum = pg_enum(PayoutStatus, "payout_status")
_dispute_status_enum = pg_enum(DisputeStatus, "dispute_status")


class Payout(UUIDMixin, TimestampMixin, Base):
    """Net amount owed to a host for a confirmed booking, after commission."""

    __tablename__ = "payouts"

    booking_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    host_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="EGP")
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    commission_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    commission_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    status: Mapped[PayoutStatus] = mapped_column(
        _payout_status_enum, nullable=False, server_default=text("'pending'"), index=True
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Payout booking={self.booking_id} net={self.net_amount} {self.status.value}>"


class Dispute(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "disputes"

    booking_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), index=True, nullable=False
    )
    raised_by: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[DisputeStatus] = mapped_column(
        _dispute_status_enum, nullable=False, server_default=text("'open'"), index=True
    )
    resolution: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Dispute booking={self.booking_id} {self.status.value}>"
