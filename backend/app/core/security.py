"""Password hashing, OTP hashing, and JWT creation / verification."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
import jwt

from app.core.config import settings

TokenType = Literal["access", "refresh"]

# bcrypt operates on at most 72 bytes; longer inputs must be truncated.
_BCRYPT_MAX_BYTES = 72


# --------------------------------------------------------------------------- #
# Passwords & OTP codes (both hashed with bcrypt)
# --------------------------------------------------------------------------- #
def hash_secret(secret: str) -> str:
    """Hash a password or an OTP code with bcrypt."""
    digest = bcrypt.hashpw(secret.encode("utf-8")[:_BCRYPT_MAX_BYTES], bcrypt.gensalt())
    return digest.decode("utf-8")


def verify_secret(secret: str, hashed: str) -> bool:
    """Constant-time verification of a password / OTP against its hash."""
    try:
        return bcrypt.checkpw(secret.encode("utf-8")[:_BCRYPT_MAX_BYTES], hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# --------------------------------------------------------------------------- #
# JWT
# --------------------------------------------------------------------------- #
def _create_token(subject: str | uuid.UUID, token_type: TokenType, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: str | uuid.UUID) -> str:
    return _create_token(
        subject, "access", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )


def create_refresh_token(subject: str | uuid.UUID) -> str:
    return _create_token(
        subject, "refresh", timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )


def decode_token(token: str, expected_type: TokenType | None = None) -> dict[str, Any]:
    """Decode and validate a JWT. Raises ``jwt.PyJWTError`` on any problem."""
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    if expected_type is not None and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"Expected a {expected_type} token")
    return payload
