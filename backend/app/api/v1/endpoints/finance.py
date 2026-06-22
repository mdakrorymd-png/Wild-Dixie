"""Host-facing finance endpoints (payouts)."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import DbSession, require_role
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.finance import HostPayoutSummary, OwnerStatement, PayoutRead
from app.services import finance_service

router = APIRouter(prefix="/payouts", tags=["finance"])

HostUser = Annotated[User, Depends(require_role(UserRole.HOST))]


@router.get("/mine", response_model=HostPayoutSummary)
async def my_payouts(host: HostUser, db: DbSession) -> HostPayoutSummary:
    payouts, totals = await finance_service.list_host_payouts(db, host)
    return HostPayoutSummary(
        items=[PayoutRead.model_validate(p) for p in payouts],
        total_pending=totals["pending"],
        total_paid=totals["paid"],
    )


@router.get("/statement", response_model=OwnerStatement)
async def my_statement(host: HostUser, db: DbSession) -> OwnerStatement:
    """Transparent monthly earnings statement — the owner-trust differentiator."""
    data = await finance_service.owner_statement(db, host)
    return OwnerStatement(**data)
