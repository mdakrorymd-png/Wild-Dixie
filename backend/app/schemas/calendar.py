"""Calendar, availability, and iCal-source schemas."""
from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.enums import DayStatus

# Guard against absurd ranges in a single request.
_MAX_RANGE_DAYS = 730


class AvailabilityDay(BaseModel):
    date: date
    status: DayStatus


class AvailabilityResponse(BaseModel):
    property_id: uuid.UUID
    start: date
    end: date
    days: list[AvailabilityDay]


class _DateRange(BaseModel):
    start_date: date
    end_date: date  # inclusive

    @model_validator(mode="after")
    def _check_range(self) -> "_DateRange":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date.")
        if (self.end_date - self.start_date).days > _MAX_RANGE_DAYS:
            raise ValueError(f"Date range cannot exceed {_MAX_RANGE_DAYS} days.")
        return self


class BlockRequest(_DateRange):
    """Block a range of nights (both endpoints inclusive)."""

    note: str | None = Field(None, max_length=500)


class UnblockRequest(_DateRange):
    pass


class IcalSourceCreate(BaseModel):
    url: str = Field(..., max_length=1000)
    name: str = Field("Airbnb", max_length=100)

    @field_validator("url")
    @classmethod
    def _check_url(cls, v: str) -> str:
        v = v.strip()
        if not v.lower().startswith(("http://", "https://", "webcal://")):
            raise ValueError("iCal URL must start with http://, https:// or webcal://")
        return v


class IcalSourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    name: str
    last_synced_at: datetime | None
    last_status: str | None
    last_error: str | None


class SyncResult(BaseModel):
    property_id: uuid.UUID
    sources_synced: int
    sources_failed: int
    blocked_nights: int


class ExportLink(BaseModel):
    token: str
    path: str
    url: str
