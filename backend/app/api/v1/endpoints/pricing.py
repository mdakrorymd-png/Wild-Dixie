"""Flexible pricing endpoints — per-property settings, rules, and quotes."""
from __future__ import annotations

import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.pricing import (
    PriceQuote,
    PriceRuleCreate,
    PriceRuleRead,
    PriceRuleUpdate,
    PricingSettingsRead,
    PricingSettingsUpdate,
)
from app.services import pricing_service, property_service

router = APIRouter(prefix="/properties", tags=["pricing"])

HostUser = Annotated[User, Depends(require_role(UserRole.HOST))]


# --------------------------------------------------------------------------- #
# Public: price quote
# --------------------------------------------------------------------------- #

@router.get("/{property_id}/quote", response_model=PriceQuote)
async def get_price_quote(
    property_id: uuid.UUID,
    check_in: Annotated[date, Query()],
    check_out: Annotated[date, Query()],
    db: DbSession,
) -> PriceQuote:
    """Return a full price breakdown for a stay — used by the booking modal."""
    prop = await property_service.get_public_property(db, property_id)
    return pricing_service.calculate_quote(prop, check_in, check_out)


# --------------------------------------------------------------------------- #
# Host: pricing settings
# --------------------------------------------------------------------------- #

@router.get("/{property_id}/pricing", response_model=PricingSettingsRead)
async def get_pricing_settings(
    property_id: uuid.UUID,
    host: HostUser,
    db: DbSession,
) -> PricingSettingsRead:
    prop = await property_service.get_owned_property(db, property_id, host)
    return PricingSettingsRead.model_validate(prop)


@router.patch("/{property_id}/pricing", response_model=PricingSettingsRead)
async def update_pricing_settings(
    property_id: uuid.UUID,
    payload: PricingSettingsUpdate,
    host: HostUser,
    db: DbSession,
) -> PricingSettingsRead:
    prop = await property_service.get_owned_property(db, property_id, host)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(prop, field, value)
    await db.flush()
    return PricingSettingsRead.model_validate(prop)


# --------------------------------------------------------------------------- #
# Host: price rules (seasonal / custom date ranges)
# --------------------------------------------------------------------------- #

@router.get("/{property_id}/price-rules", response_model=list[PriceRuleRead])
async def list_price_rules(
    property_id: uuid.UUID,
    host: HostUser,
    db: DbSession,
) -> list[PriceRuleRead]:
    await property_service.get_owned_property(db, property_id, host)
    rules = await pricing_service.list_price_rules(db, property_id)
    return [PriceRuleRead.model_validate(r) for r in rules]


@router.post(
    "/{property_id}/price-rules",
    response_model=PriceRuleRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_price_rule(
    property_id: uuid.UUID,
    payload: PriceRuleCreate,
    host: HostUser,
    db: DbSession,
) -> PriceRuleRead:
    prop = await property_service.get_owned_property(db, property_id, host)
    rule = await pricing_service.create_price_rule(db, prop, payload)
    return PriceRuleRead.model_validate(rule)


@router.patch("/{property_id}/price-rules/{rule_id}", response_model=PriceRuleRead)
async def update_price_rule(
    property_id: uuid.UUID,
    rule_id: uuid.UUID,
    payload: PriceRuleUpdate,
    host: HostUser,
    db: DbSession,
) -> PriceRuleRead:
    await property_service.get_owned_property(db, property_id, host)
    rule = await pricing_service.get_price_rule(db, rule_id, property_id)
    rule = await pricing_service.update_price_rule(db, rule, payload)
    return PriceRuleRead.model_validate(rule)


@router.delete(
    "/{property_id}/price-rules/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_price_rule(
    property_id: uuid.UUID,
    rule_id: uuid.UUID,
    host: HostUser,
    db: DbSession,
):
    await property_service.get_owned_property(db, property_id, host)
    rule = await pricing_service.get_price_rule(db, rule_id, property_id)
    await pricing_service.delete_price_rule(db, rule)
