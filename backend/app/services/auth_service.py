"""Account lifecycle: registration, login, phone verification, role upgrades."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthError, ConflictError, NotFoundError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_secret,
    verify_secret,
)
from app.models.enums import OtpPurpose, UserRole
from app.models.user import User
from app.schemas.auth import TokenPair
from app.schemas.user import UserRegister
from app.services import otp_service


async def get_user_by_phone(db: AsyncSession, phone_number: str) -> User | None:
    result = await db.execute(select(User).where(User.phone_number == phone_number))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await db.get(User, user_id)


def _issue_token_pair(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


async def register(db: AsyncSession, payload: UserRegister) -> tuple[User, str]:
    """Create an unverified account and issue a phone-verification OTP.

    Returns the user and the plain OTP code (for dev surfacing only).
    """
    if await get_user_by_phone(db, payload.phone_number) is not None:
        raise ConflictError("An account with this phone number already exists.")

    if payload.email is not None:
        existing_email = await db.execute(select(User.id).where(User.email == payload.email))
        if existing_email.first() is not None:
            raise ConflictError("An account with this email already exists.")

    user = User(
        phone_number=payload.phone_number,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_secret(payload.password),
        roles=[UserRole.GUEST],
    )
    db.add(user)
    await db.flush()  # assigns user.id

    code = await otp_service.issue_otp(
        db,
        user_id=user.id,
        phone_number=user.phone_number,
        purpose=OtpPurpose.PHONE_VERIFICATION,
    )
    return user, code


async def resend_phone_verification(db: AsyncSession, phone_number: str) -> str:
    user = await get_user_by_phone(db, phone_number)
    if user is None:
        raise NotFoundError("No account found for this phone number.")
    if user.is_phone_verified:
        raise ConflictError("Phone number is already verified.")
    return await otp_service.issue_otp(
        db,
        user_id=user.id,
        phone_number=user.phone_number,
        purpose=OtpPurpose.PHONE_VERIFICATION,
    )


async def verify_phone(db: AsyncSession, phone_number: str, code: str) -> tuple[User, TokenPair]:
    user = await get_user_by_phone(db, phone_number)
    if user is None:
        raise NotFoundError("No account found for this phone number.")

    await otp_service.verify_otp(
        db, user_id=user.id, purpose=OtpPurpose.PHONE_VERIFICATION, code=code
    )
    user.is_phone_verified = True
    return user, _issue_token_pair(user)


async def login(db: AsyncSession, phone_number: str, password: str) -> tuple[User, TokenPair]:
    user = await get_user_by_phone(db, phone_number)
    # Uniform error to avoid leaking which phones are registered.
    if user is None or not verify_secret(password, user.hashed_password):
        raise AuthError("Invalid phone number or password.")
    if not user.is_active:
        raise AuthError("This account is disabled.")
    if not user.is_phone_verified:
        raise AuthError("Phone number is not verified yet.")
    return user, _issue_token_pair(user)


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> str:
    try:
        payload = decode_token(refresh_token, expected_type="refresh")
    except Exception as exc:  # jwt.PyJWTError and friends
        raise AuthError("Invalid or expired refresh token.") from exc

    user = await get_user_by_id(db, uuid.UUID(payload["sub"]))
    if user is None or not user.is_active:
        raise AuthError("Invalid refresh token.")
    return create_access_token(user.id)


async def become_host(db: AsyncSession, user: User) -> User:
    """Add the HOST role so a guest can start listing properties."""
    user.add_role(UserRole.HOST)
    return user
