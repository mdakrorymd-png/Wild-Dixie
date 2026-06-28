"""Dynamic price calculation — Airbnb-style flexible pricing."""
from __future__ import annotations

import uuid
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError_
from app.models.pricing import PropertyPriceRule
from app.models.property import Property
from app.schemas.pricing import (
    NightBreakdown,
    PriceQuote,
    PriceRuleCreate,
    PriceRuleRead,
    PriceRuleUpdate,
)

# Egypt weekend: Thu(3)/Fri(4)/Sat(5)
_WEEKEND_DAYS = {3, 4, 5}


def _nightly_price(prop: Property, night: date) -> Decimal:
    """Price for one specific night, respecting seasonal rules then weekend rate."""
    for rule in prop.price_rules:  # already ordered by priority desc, start_date asc
        if rule.start_date <= night <= rule.end_date:
            return rule.price_per_night
    if prop.weekend_price_per_night and night.weekday() in _WEEKEND_DAYS:
        return prop.weekend_price_per_night
    return prop.base_price_per_night


def _length_discount(prop: Property, nights: int) -> int:
    """Best applicable length-of-stay discount percentage."""
    if nights >= 28 and prop.monthly_discount:
        return prop.monthly_discount
    if nights >= 7 and prop.weekly_discount:
        return prop.weekly_discount
    return 0


def _time_discount(prop: Property, check_in: date, today: date) -> int:
    """Early-bird or last-minute discount percentage."""
    days_until = (check_in - today).days
    if days_until >= prop.early_bird_days and prop.early_bird_discount:
        return prop.early_bird_discount
    if 0 <= days_until <= prop.last_minute_days and prop.last_minute_discount:
        return prop.last_minute_discount
    return 0


def calculate_quote(
    prop: Property,
    check_in: date,
    check_out: date,
    today: date | None = None,
) -> PriceQuote:
    if today is None:
        from datetime import date as _date
        today = _date.today()

    nights = (check_out - check_in).days
    if nights < 1:
        raise ValidationError_("تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول.")
    if prop.min_nights and nights < prop.min_nights:
        raise ValidationError_(f"الحد الأدنى للإقامة {prop.min_nights} ليالٍ.")
    if prop.max_nights and nights > prop.max_nights:
        raise ValidationError_(f"الحد الأقصى للإقامة {prop.max_nights} ليالٍ.")

    breakdown: list[NightBreakdown] = []
    subtotal = Decimal("0")
    for i in range(nights):
        night = check_in + timedelta(days=i)
        price = _nightly_price(prop, night)
        subtotal += price
        breakdown.append(NightBreakdown(date=night, price=price))

    length_pct = _length_discount(prop, nights)
    time_pct = _time_discount(prop, check_in, today)
    discount_pct = max(length_pct, time_pct)

    discount_amount = (subtotal * Decimal(discount_pct) / 100).quantize(Decimal("0.01"))
    discounted_subtotal = subtotal - discount_amount
    cleaning_fee = prop.cleaning_fee or Decimal("0")
    total = discounted_subtotal + cleaning_fee

    return PriceQuote(
        property_id=prop.id,
        check_in=check_in,
        check_out=check_out,
        nights=nights,
        nights_breakdown=breakdown,
        subtotal=subtotal,
        discount_percent=discount_pct,
        discount_amount=discount_amount,
        cleaning_fee=cleaning_fee,
        total=total,
        currency=prop.currency,
        instant_book=prop.instant_book,
    )


# --------------------------------------------------------------------------- #
# CRUD for price rules
# --------------------------------------------------------------------------- #

async def list_price_rules(
    db: AsyncSession, property_id: uuid.UUID
) -> list[PropertyPriceRule]:
    result = await db.execute(
        select(PropertyPriceRule)
        .where(PropertyPriceRule.property_id == property_id)
        .order_by(PropertyPriceRule.priority.desc(), PropertyPriceRule.start_date)
    )
    return list(result.scalars().all())


async def create_price_rule(
    db: AsyncSession,
    prop: Property,
    payload: PriceRuleCreate,
) -> PropertyPriceRule:
    if payload.end_date < payload.start_date:
        raise ValidationError_("تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية.")
    rule = PropertyPriceRule(
        property_id=prop.id,
        label=payload.label,
        start_date=payload.start_date,
        end_date=payload.end_date,
        price_per_night=payload.price_per_night,
        min_nights=payload.min_nights,
        priority=payload.priority,
    )
    db.add(rule)
    await db.flush()
    return rule


async def update_price_rule(
    db: AsyncSession,
    rule: PropertyPriceRule,
    payload: PriceRuleUpdate,
) -> PropertyPriceRule:
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(rule, field, value)
    if rule.end_date < rule.start_date:
        raise ValidationError_("تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية.")
    await db.flush()
    return rule


async def delete_price_rule(db: AsyncSession, rule: PropertyPriceRule) -> None:
    await db.delete(rule)
    await db.flush()


async def get_price_rule(
    db: AsyncSession, rule_id: uuid.UUID, property_id: uuid.UUID
) -> PropertyPriceRule:
    rule = await db.get(PropertyPriceRule, rule_id)
    if rule is None or rule.property_id != property_id:
        raise NotFoundError("قاعدة التسعير غير موجودة.")
    return rule
