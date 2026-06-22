"""Authentication endpoints: register, verify phone, login, refresh."""
from __future__ import annotations

from fastapi import APIRouter, status

from app.api.deps import DbSession
from app.core.config import settings
from app.schemas.auth import (
    AccessToken,
    LoginRequest,
    MessageResponse,
    PhoneRequest,
    RefreshRequest,
    TokenPair,
    VerifyOtpRequest,
)
from app.schemas.user import UserRead, UserRegister
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _maybe_debug_otp(code: str) -> str | None:
    """Surface the OTP in the response only outside production."""
    return None if settings.is_production else code


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: DbSession) -> MessageResponse:
    _user, code = await auth_service.register(db, payload)
    return MessageResponse(
        message="Account created. A verification code has been sent to your phone.",
        debug_otp=_maybe_debug_otp(code),
    )


@router.post("/verify-phone", response_model=TokenPair)
async def verify_phone(payload: VerifyOtpRequest, db: DbSession) -> TokenPair:
    _user, tokens = await auth_service.verify_phone(db, payload.phone_number, payload.code)
    return tokens


@router.post("/resend-otp", response_model=MessageResponse)
async def resend_otp(payload: PhoneRequest, db: DbSession) -> MessageResponse:
    code = await auth_service.resend_phone_verification(db, payload.phone_number)
    return MessageResponse(
        message="A new verification code has been sent.",
        debug_otp=_maybe_debug_otp(code),
    )


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: DbSession) -> TokenPair:
    _user, tokens = await auth_service.login(db, payload.phone_number, payload.password)
    return tokens


@router.post("/refresh", response_model=AccessToken)
async def refresh(payload: RefreshRequest, db: DbSession) -> AccessToken:
    access = await auth_service.refresh_access_token(db, payload.refresh_token)
    return AccessToken(access_token=access)
