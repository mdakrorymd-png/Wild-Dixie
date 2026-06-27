"""Read schemas for the resort & amenity catalogs (used by the listing wizard)."""
from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ResortCreate(BaseModel):
    """A host adding a compound/village that isn't in the catalog yet."""

    name: str = Field(..., min_length=2, max_length=120)
    area: str = Field("Ain Sokhna", max_length=100)


class AmenityCreate(BaseModel):
    """A host adding a custom amenity not in the catalog."""

    name: str = Field(..., min_length=2, max_length=100)


class ResortRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    name_ar: str | None = None
    area: str
    governorate: str | None = None
    city: str | None
    latitude: float | None
    longitude: float | None
    rental_allowed: bool = True
    gate_app: str | None = None
    beach_code_required: bool = False
    pass_fee: Decimal = Decimal("0")


class DestinationRead(BaseModel):
    """A browsable destination grouping (e.g. North Coast) with counts."""

    area: str
    governorate: str | None = None
    resort_count: int


class AmenityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: str
    icon: str | None
