"""One-time-password codes issued for phone verification, login, and resets."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import OtpPurpose

_otp_purpose_enum = pg_enum(OtpPurpose, "otp_purpose")


class OtpCode(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "otp_codes"

    user_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    purpose: Mapped[OtpPurpose] = mapped_column(_otp_purpose_enum, nullable=False)

    # The code itself is never stored in plain text.
    hashed_code: Mapped[str] = mapped_column(String(255), nullable=False)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<OtpCode user={self.user_id} purpose={self.purpose.value}>"
