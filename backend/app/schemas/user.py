"""User-facing request/response schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import UserRole
from app.utils.validators import normalize_egyptian_phone, validate_national_id


class UserRegister(BaseModel):
    """Payload for creating a new account."""

    phone_number: str = Field(..., examples=["01012345678"])
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    email: EmailStr | None = None

    @field_validator("phone_number")
    @classmethod
    def _normalize_phone(cls, v: str) -> str:
        return normalize_egyptian_phone(v)

    @field_validator("full_name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name is too short.")
        return v


class UserRead(BaseModel):
    """Public representation of a user."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    phone_number: str
    email: EmailStr | None
    full_name: str
    national_id: str | None
    passport_image: str | None
    instapay_handle: str | None
    vodafone_cash_number: str | None
    roles: list[UserRole]
    is_phone_verified: bool
    is_active: bool
    created_at: datetime


class NationalIdUpdate(BaseModel):
    national_id: str = Field(..., examples=["29001011234567"])

    @field_validator("national_id")
    @classmethod
    def _validate_nid(cls, v: str) -> str:
        return validate_national_id(v)


class ProfileUpdate(BaseModel):
    """Optional profile fields: payout handles + passport (foreign guests)."""

    passport_image: str | None = Field(None, max_length=1000)
    instapay_handle: str | None = Field(None, max_length=100)
    vodafone_cash_number: str | None = Field(None, max_length=20)
