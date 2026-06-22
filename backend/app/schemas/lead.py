"""Lead capture schemas (owner earnings estimator + area waitlist)."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class LeadCreate(BaseModel):
    kind: str = Field("owner_estimate", max_length=30)
    full_name: str | None = Field(None, max_length=255)
    whatsapp: str | None = Field(None, max_length=30)
    area: str | None = Field(None, max_length=100)
    compound: str | None = Field(None, max_length=150)
    bedrooms: int | None = Field(None, ge=0, le=20)
    season: str | None = Field(None, max_length=30)
    has_pool: bool | None = None
    estimated_gross: Decimal | None = None
    estimated_net: Decimal | None = None
    source: str | None = Field(None, max_length=2000)
    note: str | None = Field(None, max_length=2000)


class LeadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kind: str
    full_name: str | None
    whatsapp: str | None
    area: str | None
    compound: str | None
    bedrooms: int | None
    season: str | None
    estimated_gross: Decimal | None
    estimated_net: Decimal | None
    created_at: datetime
