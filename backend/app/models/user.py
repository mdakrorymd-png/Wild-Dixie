"""The User model — the single account that can be Guest, Host, and/or Admin."""
from __future__ import annotations

from sqlalchemy import ARRAY, Boolean, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import UserRole

# Reuse one Enum type definition; the DB type is created in the migration.
_user_role_enum = pg_enum(UserRole, "user_role")


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    # Phone is the primary local identity (verified via SMS OTP).
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # National ID (14 digits) — required for gated-community/security compliance,
    # captured during profile setup so it is nullable at registration time.
    national_id: Mapped[str | None] = mapped_column(String(14), unique=True, index=True, nullable=True)
    # Passport image URL for foreign guests (who have no Egyptian National ID).
    passport_image: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    # Host payout handles for receiving InstaPay / mobile-wallet transfers.
    instapay_handle: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vodafone_cash_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # Wallet provider for the number above (Vodafone Cash / Orange Cash / etc.).
    wallet_provider: Mapped[str | None] = mapped_column(String(30), nullable=True)

    roles: Mapped[list[UserRole]] = mapped_column(
        ARRAY(_user_role_enum),
        nullable=False,
        server_default=text("'{guest}'::user_role[]"),
    )

    is_phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    # ---- convenience helpers ----
    def has_role(self, role: UserRole) -> bool:
        return role in self.roles

    def add_role(self, role: UserRole) -> None:
        if role not in self.roles:
            # Reassign so SQLAlchemy detects the ARRAY mutation.
            self.roles = [*self.roles, role]

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.phone_number} roles={[r.value for r in self.roles]}>"
