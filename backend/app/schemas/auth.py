"""Authentication & OTP schemas."""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import normalize_egyptian_phone


class LoginRequest(BaseModel):
    phone_number: str
    password: str

    @field_validator("phone_number")
    @classmethod
    def _normalize_phone(cls, v: str) -> str:
        return normalize_egyptian_phone(v)


class PhoneRequest(BaseModel):
    """Used to (re)send an OTP to a phone number."""

    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def _normalize_phone(cls, v: str) -> str:
        return normalize_egyptian_phone(v)


class VerifyOtpRequest(BaseModel):
    phone_number: str
    code: str = Field(..., min_length=4, max_length=8)

    @field_validator("phone_number")
    @classmethod
    def _normalize_phone(cls, v: str) -> str:
        return normalize_egyptian_phone(v)

    @field_validator("code")
    @classmethod
    def _digits_only(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("OTP code must be numeric.")
        return v


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """Generic success envelope for actions without a resource body."""

    message: str
    # Returned only in development so flows can be tested without a real SMS.
    debug_otp: str | None = None
