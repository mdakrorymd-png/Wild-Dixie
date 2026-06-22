"""Resort / village lookup — powers hyper-local search (Marassi, Telal, …)."""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Boolean, Float, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Resort(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "resorts"

    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    name_ar: Mapped[str | None] = mapped_column(String(150), nullable=True)
    # Broad area / destination, e.g. "North Coast", "Ain Sokhna", "Red Sea".
    area: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    # Egyptian governorate, e.g. "Matrouh", "Suez", "Red Sea".
    governorate: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ---- gated-compound compliance (Egypt) ----
    rental_allowed: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    gate_app: Mapped[str | None] = mapped_column(String(120), nullable=True)  # compound gate/access app
    beach_code_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    pass_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Resort {self.name} ({self.area})>"
