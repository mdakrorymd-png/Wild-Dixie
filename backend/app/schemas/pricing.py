"""Schemas for flexible pricing rules and quote calculations."""
from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PriceRuleCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=100)
    start_date: date
    end_date: date
    price_per_night: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
    min_nights: int | None = Field(None, ge=1, le=365)
    priority: int = Field(0, ge=0, le=100)


class PriceRuleUpdate(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=100)
    start_date: date | None = None
    end_date: date | None = None
    price_per_night: Decimal | None = Field(None, gt=0, max_digits=10, decimal_places=2)
    min_nights: int | None = Field(None, ge=1, le=365)
    priority: int | None = Field(None, ge=0, le=100)


class PriceRuleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    property_id: uuid.UUID
    label: str
    start_date: date
    end_date: date
    price_per_night: Decimal
    min_nights: int | None
    priority: int


class NightBreakdown(BaseModel):
    date: date
    price: Decimal


class PriceQuote(BaseModel):
    property_id: uuid.UUID
    check_in: date
    check_out: date
    nights: int
    nights_breakdown: list[NightBreakdown]
    subtotal: Decimal
    discount_percent: int
    discount_amount: Decimal
    cleaning_fee: Decimal
    total: Decimal
    currency: str
    instant_book: bool


class PricingSettingsUpdate(BaseModel):
    """Bulk-update all pricing knobs on a property."""

    base_price_per_night: Decimal | None = Field(None, gt=0, max_digits=10, decimal_places=2)
    weekend_price_per_night: Decimal | None = Field(None, gt=0, max_digits=10, decimal_places=2)
    cleaning_fee: Decimal | None = Field(None, ge=0, max_digits=10, decimal_places=2)
    security_deposit: Decimal | None = Field(None, ge=0, max_digits=10, decimal_places=2)
    weekly_discount: int | None = Field(None, ge=0, le=100)
    monthly_discount: int | None = Field(None, ge=0, le=100)
    early_bird_discount: int | None = Field(None, ge=0, le=100)
    early_bird_days: int | None = Field(None, ge=1, le=365)
    last_minute_discount: int | None = Field(None, ge=0, le=100)
    last_minute_days: int | None = Field(None, ge=1, le=30)
    instant_book: bool | None = None
    min_nights: int | None = Field(None, ge=1, le=365)
    max_nights: int | None = Field(None, ge=1, le=365)
    down_payment_percentage: int | None = Field(None, ge=0, le=100)


class PricingSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    base_price_per_night: Decimal
    weekend_price_per_night: Decimal | None
    cleaning_fee: Decimal
    security_deposit: Decimal
    weekly_discount: int
    monthly_discount: int
    early_bird_discount: int
    early_bird_days: int
    last_minute_discount: int
    last_minute_days: int
    instant_book: bool
    min_nights: int
    max_nights: int | None
    down_payment_percentage: int
    currency: str
    price_rules: list[PriceRuleRead] = []
