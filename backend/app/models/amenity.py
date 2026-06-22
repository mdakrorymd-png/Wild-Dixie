"""Amenities catalog + the property<->amenity association table."""
from __future__ import annotations

import uuid

from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

# Many-to-many: a property has many amenities, an amenity belongs to many.
property_amenities = Table(
    "property_amenities",
    Base.metadata,
    Column(
        "property_id",
        PGUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "amenity_id",
        PGUUID(as_uuid=True),
        ForeignKey("amenities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Amenity(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "amenities"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    # e.g. "essentials", "outdoor", "kitchen", "safety"
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="general")
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Amenity {self.name}>"
