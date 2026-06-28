"""Property request/response schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.models.enums import ListingSource, ListingType, PropertyStatus, PropertyType
from app.schemas.catalog import AmenityRead, ResortRead


class PropertyImageIn(BaseModel):
    url: HttpUrl
    position: int = 0
    is_cover: bool = False


class PropertyImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    position: int
    is_cover: bool


class _PropertyBase(BaseModel):
    title: str = Field(..., min_length=4, max_length=255)
    description: str = Field("", max_length=10_000)
    property_type: PropertyType
    house_rules: str | None = Field(None, max_length=5_000)
    check_in_time: str | None = Field(None, max_length=20)
    check_out_time: str | None = Field(None, max_length=20)

    area: str = Field(..., min_length=2, max_length=100)
    resort_id: uuid.UUID | None = None
    address_line: str | None = Field(None, max_length=255)
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)

    max_guests: int = Field(1, ge=1, le=100)
    bedrooms: int = Field(0, ge=0, le=50)
    beds: int = Field(1, ge=0, le=100)
    bathrooms: int = Field(1, ge=0, le=50)

    base_price_per_night: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
    cleaning_fee: Decimal = Field(Decimal("0"), ge=0, max_digits=10, decimal_places=2)
    security_deposit: Decimal = Field(Decimal("0"), ge=0, max_digits=10, decimal_places=2)
    down_payment_percentage: int = Field(0, ge=0, le=100)

    min_nights: int = Field(1, ge=1, le=365)
    max_nights: int | None = Field(None, ge=1, le=365)

    listing_type: ListingType = ListingType.SELF_LIST  # nullable DB col; defaults to self_list

    # Egypt: utilities are paid separately by the guest (kept true by policy).
    utilities_paid_by_guest: bool = True

    @field_validator("max_nights")
    @classmethod
    def _max_ge_min(cls, v: int | None, info) -> int | None:
        min_nights = info.data.get("min_nights", 1)
        if v is not None and v < min_nights:
            raise ValueError("max_nights cannot be less than min_nights.")
        return v


class PropertyCreate(_PropertyBase):
    amenity_ids: list[uuid.UUID] = Field(default_factory=list)
    images: list[PropertyImageIn] = Field(default_factory=list)


class PropertyUpdate(BaseModel):
    """All fields optional — partial update of a draft / rejected listing."""

    title: str | None = Field(None, min_length=4, max_length=255)
    description: str | None = Field(None, max_length=10_000)
    property_type: PropertyType | None = None
    house_rules: str | None = Field(None, max_length=5_000)
    check_in_time: str | None = None
    check_out_time: str | None = None

    area: str | None = Field(None, min_length=2, max_length=100)
    resort_id: uuid.UUID | None = None
    address_line: str | None = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)

    max_guests: int | None = Field(None, ge=1, le=100)
    bedrooms: int | None = Field(None, ge=0, le=50)
    beds: int | None = Field(None, ge=0, le=100)
    bathrooms: int | None = Field(None, ge=0, le=50)

    base_price_per_night: Decimal | None = Field(None, gt=0, max_digits=10, decimal_places=2)
    cleaning_fee: Decimal | None = Field(None, ge=0, max_digits=10, decimal_places=2)
    security_deposit: Decimal | None = Field(None, ge=0, max_digits=10, decimal_places=2)
    down_payment_percentage: int | None = Field(None, ge=0, le=100)

    min_nights: int | None = Field(None, ge=1, le=365)
    max_nights: int | None = Field(None, ge=1, le=365)
    utilities_paid_by_guest: bool | None = None

    amenity_ids: list[uuid.UUID] | None = None
    images: list[PropertyImageIn] | None = None


class PropertyRead(_PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    host_id: uuid.UUID
    currency: str
    status: PropertyStatus
    source: ListingSource
    listing_type: ListingType = ListingType.SELF_LIST
    source_url: str | None
    rejection_reason: str | None
    created_at: datetime
    amenities: list[AmenityRead]
    images: list[PropertyImageRead]
    resort: ResortRead | None = None


class PropertyListItem(BaseModel):
    """Lightweight item for search results."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    property_type: PropertyType
    area: str
    base_price_per_night: Decimal
    currency: str
    max_guests: int
    bedrooms: int
    status: PropertyStatus
    listing_type: ListingType = ListingType.SELF_LIST


class RejectRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=1000)
