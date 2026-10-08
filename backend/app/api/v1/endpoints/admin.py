"""Admin endpoints (require the ADMIN role): moderation, payments, payouts, disputes."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi import status as http_status
from pydantic import BaseModel

from app.api.deps import DbSession, require_role
from app.core.config import settings
from app.models.enums import DisputeStatus, PayoutStatus, UserRole
from app.models.user import User
from app.schemas.common import Page
from app.schemas.finance import DisputeRead, DisputeResolve, PayoutRead
from app.schemas.payment import PaymentRead, RejectPaymentRequest
from sqlalchemy import delete, not_
from sqlalchemy import text as sa_text

from app.schemas.property import PropertyImageIn, PropertyRead, RejectRequest
from app.services import finance_service, payment_service, property_service

router = APIRouter(prefix="/admin", tags=["admin"])

AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


# --------------------------------------------------------------------------- #
# One-time admin bootstrap (disabled unless ADMIN_BOOTSTRAP_SECRET is set)
# --------------------------------------------------------------------------- #
class BootstrapAdminRequest(BaseModel):
    phone_number: str
    secret: str


@router.post("/bootstrap-admin", summary="One-time: promote a user to admin (requires secret)")
async def bootstrap_admin(payload: BootstrapAdminRequest, db: DbSession) -> dict:
    if not settings.ADMIN_BOOTSTRAP_SECRET or payload.secret != settings.ADMIN_BOOTSTRAP_SECRET:
        raise HTTPException(http_status.HTTP_403_FORBIDDEN, "Invalid or disabled bootstrap secret")
    result = await db.execute(
        sa_text(
            "UPDATE users SET roles = array_append(roles, 'admin') "
            "WHERE phone_number = :phone AND NOT ('admin' = ANY(roles)) "
            "RETURNING id"
        ),
        {"phone": payload.phone_number},
    )
    row = result.fetchone()
    await db.commit()
    return {"promoted": row is not None}


# --------------------------------------------------------------------------- #
# User management
# --------------------------------------------------------------------------- #
@router.delete("/users/non-admin", summary="Delete all non-admin users (dev/reset)")
async def delete_non_admin_users(_admin: AdminUser, db: DbSession) -> dict:
    result = await db.execute(
        delete(User).where(sa_text("NOT 'admin' = ANY(roles)")).returning(User.id)
    )
    deleted = len(result.fetchall())
    await db.commit()
    return {"deleted": deleted}


# --------------------------------------------------------------------------- #
# Listing moderation
# --------------------------------------------------------------------------- #
@router.get("/properties/pending", response_model=Page[PropertyRead])
async def pending_properties(
    _admin: AdminUser,
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[PropertyRead]:
    items, total = await property_service.list_pending(db, limit=limit, offset=offset)
    return Page(items=[PropertyRead.model_validate(p) for p in items], total=total, limit=limit, offset=offset)


@router.post("/properties/{property_id}/approve", response_model=PropertyRead)
async def approve_property(property_id: uuid.UUID, _admin: AdminUser, db: DbSession) -> PropertyRead:
    prop = await property_service.approve_property(db, property_id)
    return PropertyRead.model_validate(prop)


@router.post("/properties/{property_id}/reject", response_model=PropertyRead)
async def reject_property(
    property_id: uuid.UUID, payload: RejectRequest, _admin: AdminUser, db: DbSession
) -> PropertyRead:
    prop = await property_service.reject_property(db, property_id, payload.reason)
    return PropertyRead.model_validate(prop)


class AdminSetImagesRequest(BaseModel):
    images: list[PropertyImageIn]


@router.put("/properties/{property_id}/images", response_model=PropertyRead)
async def admin_set_property_images(
    property_id: uuid.UUID, payload: AdminSetImagesRequest, _admin: AdminUser, db: DbSession
) -> PropertyRead:
    """Replace a listing's photos regardless of status (published listings can't
    be self-edited by the host — this lets moderation fix bad photos directly)."""
    prop = await property_service.get_property(db, property_id)
    prop.images = property_service._build_images(payload.images)
    await db.flush()
    return PropertyRead.model_validate(prop)


# --------------------------------------------------------------------------- #
# Payment verification (InstaPay / wallet)
# --------------------------------------------------------------------------- #
@router.get("/payments/pending", response_model=Page[PaymentRead])
async def pending_payments(
    _admin: AdminUser,
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[PaymentRead]:
    items, total = await payment_service.list_pending_payments(db, limit=limit, offset=offset)
    return Page(items=[PaymentRead.model_validate(p) for p in items], total=total, limit=limit, offset=offset)


@router.post("/payments/{payment_id}/approve", response_model=PaymentRead)
async def approve_payment(payment_id: uuid.UUID, admin: AdminUser, db: DbSession) -> PaymentRead:
    payment = await payment_service.approve_payment(db, admin, payment_id)
    return PaymentRead.model_validate(payment)


@router.post("/payments/{payment_id}/reject", response_model=PaymentRead)
async def reject_payment(
    payment_id: uuid.UUID, payload: RejectPaymentRequest, admin: AdminUser, db: DbSession
) -> PaymentRead:
    payment = await payment_service.reject_payment(db, admin, payment_id, payload.notes)
    return PaymentRead.model_validate(payment)


# --------------------------------------------------------------------------- #
# Payout ledger
# --------------------------------------------------------------------------- #
@router.get("/payouts", response_model=list[PayoutRead])
async def list_payouts(
    _admin: AdminUser,
    db: DbSession,
    status: Annotated[PayoutStatus | None, Query()] = None,
) -> list[PayoutRead]:
    payouts = await finance_service.list_all_payouts(db, status)
    return [PayoutRead.model_validate(p) for p in payouts]


@router.post("/payouts/{payout_id}/mark-paid", response_model=PayoutRead)
async def mark_payout_paid(payout_id: uuid.UUID, _admin: AdminUser, db: DbSession) -> PayoutRead:
    payout = await finance_service.mark_payout_paid(db, payout_id)
    return PayoutRead.model_validate(payout)


# --------------------------------------------------------------------------- #
# Disputes
# --------------------------------------------------------------------------- #
@router.get("/disputes", response_model=list[DisputeRead])
async def list_disputes(
    _admin: AdminUser,
    db: DbSession,
    status: Annotated[DisputeStatus | None, Query()] = None,
) -> list[DisputeRead]:
    disputes = await finance_service.list_disputes(db, status)
    return [DisputeRead.model_validate(d) for d in disputes]


@router.post("/disputes/{dispute_id}/resolve", response_model=DisputeRead)
async def resolve_dispute(
    dispute_id: uuid.UUID, payload: DisputeResolve, admin: AdminUser, db: DbSession
) -> DisputeRead:
    dispute = await finance_service.resolve_dispute(db, dispute_id, admin, payload.status, payload.resolution)
    return DisputeRead.model_validate(dispute)
