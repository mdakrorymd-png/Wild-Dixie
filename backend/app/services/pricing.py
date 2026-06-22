"""Pure booking-price computation (no DB) — easy to unit test."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import ROUND_HALF_UP, Decimal


def money(value: Decimal | int | float | str) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class Quote:
    nights: int
    nightly_price: Decimal
    room_subtotal: Decimal
    cleaning_fee: Decimal
    security_deposit: Decimal
    total_amount: Decimal
    is_deposit: bool
    down_payment_percentage: int
    down_payment_amount: Decimal
    amount_due_now: Decimal
    balance_due_later: Decimal
    currency: str = "EGP"


def compute_quote(
    *,
    check_in: date,
    check_out: date,
    nightly_price: Decimal,
    cleaning_fee: Decimal,
    security_deposit: Decimal,
    down_payment_percentage: int,
    is_deposit: bool,
) -> Quote:
    nights = (check_out - check_in).days
    if nights < 1:
        raise ValueError("check_out must be at least one night after check_in.")

    nightly = money(nightly_price)
    room_subtotal = money(nightly * nights)
    cleaning = money(cleaning_fee)
    deposit_refundable = money(security_deposit)
    total = money(room_subtotal + cleaning + deposit_refundable)

    # عربون applies to the stay cost (room + cleaning), not the refundable deposit.
    can_deposit = is_deposit and down_payment_percentage > 0
    if can_deposit:
        stay_cost = money(room_subtotal + cleaning)
        down_payment = money(stay_cost * Decimal(down_payment_percentage) / Decimal(100))
        amount_due_now = down_payment
    else:
        down_payment = total
        amount_due_now = total

    balance = money(total - amount_due_now)

    return Quote(
        nights=nights,
        nightly_price=nightly,
        room_subtotal=room_subtotal,
        cleaning_fee=cleaning,
        security_deposit=deposit_refundable,
        total_amount=total,
        is_deposit=can_deposit,
        down_payment_percentage=down_payment_percentage if can_deposit else 0,
        down_payment_amount=down_payment,
        amount_due_now=amount_due_now,
        balance_due_later=balance,
    )
