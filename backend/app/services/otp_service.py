"""Issue, deliver, and verify one-time passwords.

Codes are stored hashed (never plain), expire after a configurable window,
enforce a resend cooldown, and lock after too many failed attempts.
"""
from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuthError, RateLimitError
from app.core.security import hash_secret, verify_secret
from app.models.enums import OtpPurpose
from app.models.otp import OtpCode
from app.services.sms import get_sms_provider


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _generate_code() -> str:
    upper = 10 ** settings.OTP_LENGTH
    return str(secrets.randbelow(upper)).zfill(settings.OTP_LENGTH)


async def _latest_active_code(
    db: AsyncSession, user_id: uuid.UUID, purpose: OtpPurpose
) -> OtpCode | None:
    result = await db.execute(
        select(OtpCode)
        .where(
            OtpCode.user_id == user_id,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .order_by(OtpCode.created_at.desc())
    )
    return result.scalars().first()


async def issue_otp(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    phone_number: str,
    purpose: OtpPurpose,
) -> str:
    """Create a fresh OTP, deliver it via SMS, and return the plain code.

    The returned plain code is for delivery/observability only; callers must not
    leak it to clients outside development.
    """
    # Enforce a resend cooldown against the most recent code.
    latest = await _latest_active_code(db, user_id, purpose)
    if latest is not None:
        age = (_now() - latest.created_at).total_seconds()
        if age < settings.OTP_RESEND_COOLDOWN_SECONDS:
            wait = int(settings.OTP_RESEND_COOLDOWN_SECONDS - age)
            raise RateLimitError(f"Please wait {wait}s before requesting another code.")
        # Invalidate the previous outstanding code.
        latest.consumed_at = _now()

    code = _generate_code()
    otp = OtpCode(
        user_id=user_id,
        purpose=purpose,
        hashed_code=hash_secret(code),
        expires_at=_now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
    )
    db.add(otp)
    await db.flush()

    body = f"Your verification code is {code}. It expires in {settings.OTP_EXPIRE_MINUTES} minutes."
    await get_sms_provider().send_sms(phone_number, body)
    return code


async def verify_otp(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    purpose: OtpPurpose,
    code: str,
) -> None:
    """Validate a submitted code. Raises ``AuthError`` if it is wrong/expired.

    On success the code is marked consumed so it cannot be replayed.
    """
    otp = await _latest_active_code(db, user_id, purpose)
    if otp is None:
        raise AuthError("No active verification code. Please request a new one.")

    if otp.expires_at <= _now():
        otp.consumed_at = _now()
        raise AuthError("Verification code has expired. Please request a new one.")

    if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp.consumed_at = _now()
        raise RateLimitError("Too many incorrect attempts. Please request a new code.")

    if not verify_secret(code, otp.hashed_code):
        otp.attempts += 1
        raise AuthError("Incorrect verification code.")

    otp.consumed_at = _now()
