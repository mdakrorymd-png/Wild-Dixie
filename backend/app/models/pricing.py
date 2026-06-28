"""Per-property dynamic pricing rules (seasonal, holiday, custom ranges)."""
from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class PropertyPriceRule(UUIDMixin, TimestampMixin, Base):
    """Date-range price override — higher priority wins when ranges overlap."""

    __tablename__ = "property_price_rules"

    property_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    price_per_night: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    min_nights: Mapped[int | None] = mapped_column(Integer, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    property: Mapped["Property"] = relationship(back_populates="price_rules")  # type: ignore[name-defined]

    def __repr__(self) -> str:  # pragma: no cover
        return f"<PriceRule {self.label} {self.start_date}–{self.end_date} {self.price_per_night}>"
