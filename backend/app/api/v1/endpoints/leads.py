"""Public lead capture (owner estimator + waitlist) and admin listing."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select

from app.api.deps import DbSession, require_role
from app.models.enums import UserRole
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadRead, LeadStatusUpdate

router = APIRouter(prefix="/leads", tags=["leads"])

AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


@router.post("", response_model=LeadRead, status_code=status.HTTP_201_CREATED)
async def create_lead(payload: LeadCreate, db: DbSession) -> Lead:
    """Capture an owner earnings-estimate lead or an area waitlist signup."""
    lead = Lead(**payload.model_dump())
    db.add(lead)
    await db.flush()
    return lead


@router.get("", response_model=list[LeadRead])
async def list_leads(
    _admin: AdminUser,
    db: DbSession,
    kind: Annotated[str | None, Query()] = None,
    lead_status: Annotated[str | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[Lead]:
    stmt = select(Lead)
    if kind:
        stmt = stmt.where(Lead.kind == kind)
    if lead_status:
        stmt = stmt.where(Lead.status == lead_status)
    result = await db.execute(stmt.order_by(Lead.created_at.desc()).limit(limit))
    return list(result.scalars().all())


@router.patch("/{lead_id}/status", response_model=LeadRead)
async def update_lead_status(
    lead_id: uuid.UUID,
    payload: LeadStatusUpdate,
    _admin: AdminUser,
    db: DbSession,
) -> Lead:
    """Move a lead through the pipeline (new -> contacted -> qualified -> won/lost)."""
    lead = await db.get(Lead, lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    lead.status = payload.status
    await db.flush()
    return lead
