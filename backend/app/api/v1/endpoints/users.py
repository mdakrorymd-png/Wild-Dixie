"""User profile endpoints: read self, set National ID, upgrade to host."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.core.exceptions import ConflictError
from app.models.user import User
from app.schemas.user import NationalIdUpdate, ProfileUpdate, UserRead
from app.services import auth_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def read_me(current_user: CurrentUser) -> User:
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_profile(payload: ProfileUpdate, current_user: CurrentUser, db: DbSession) -> User:
    """Update payout handles (InstaPay / Vodafone Cash) and passport image."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    return current_user


@router.patch("/me/national-id", response_model=UserRead)
async def set_national_id(
    payload: NationalIdUpdate, current_user: CurrentUser, db: DbSession
) -> User:
    # Ensure no other account already claims this National ID.
    existing = await db.execute(
        User.__table__.select().where(User.national_id == payload.national_id)
    )
    row = existing.first()
    if row is not None and row.id != current_user.id:
        raise ConflictError("This National ID is already registered to another account.")

    current_user.national_id = payload.national_id
    return current_user


@router.post("/me/become-host", response_model=UserRead)
async def become_host(current_user: CurrentUser, db: DbSession) -> User:
    return await auth_service.become_host(db, current_user)
