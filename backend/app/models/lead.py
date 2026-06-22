"""Owner leads & area waitlist captured from the marketing site (estimator, forms)."""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Lead(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "leads"

    # "owner_estimate" (earnings estimator/owner signup) | "waitlist" (area coming soon)
    kind: Mapped[str] = mapped_column(String(30), nullable=False, default="owner_estimate", index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(30), nullable=True)
    area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    compound: Mapped[str | None] = mapped_column(String(150), nullable=True)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    season: Mapped[str | None] = mapped_column(String(30), nullable=True)
    has_pool: Mapped[bool | None] = mapped_column(nullable=True)
    estimated_gross: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    estimated_net: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    # Marketing attribution (utm_source/medium/campaign...) captured from the URL.
    source: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Lead {self.kind} {self.full_name} {self.area}>"
