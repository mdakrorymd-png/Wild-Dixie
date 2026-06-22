"""Calendar availability: sparse per-night blocks + external iCal sources.

Availability is stored *sparsely*: a row exists only for a night that is
blocked or booked. A date with no row is available. This keeps the table small
while still answering "is night X free?" — and a unique ``(property_id, date)``
constraint is the backbone of double-booking prevention in the booking module.
"""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import BlockSource, DayStatus

_day_status_enum = pg_enum(DayStatus, "day_status")
_block_source_enum = pg_enum(BlockSource, "block_source")


class CalendarDay(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "calendar_days"
    __table_args__ = (
        UniqueConstraint("property_id", "date", name="uq_calendar_property_date"),
    )

    property_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    status: Mapped[DayStatus] = mapped_column(_day_status_enum, nullable=False)
    source: Mapped[BlockSource] = mapped_column(_block_source_enum, nullable=False)

    # Set when the block came from an external feed, so a re-sync can replace it.
    ical_source_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("ical_sources.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    external_uid: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Set when this night is held by an internal booking, so a cancel/expire
    # can release exactly those nights.
    booking_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<CalendarDay {self.property_id} {self.date} {self.status.value}>"


class IcalSource(UUIDMixin, TimestampMixin, Base):
    """An external iCal feed (e.g. the property's Airbnb export URL)."""

    __tablename__ = "ical_sources"

    property_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False, default="Airbnb")
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_status: Mapped[str | None] = mapped_column(String(20), nullable=True)  # ok | error
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<IcalSource {self.name} property={self.property_id}>"
