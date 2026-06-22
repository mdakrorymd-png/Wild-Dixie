"""Property endpoints: public search/detail + host management + Airbnb import."""
from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession, require_role
from app.models.enums import PropertyType, UserRole
from app.models.user import User
from app.schemas.airbnb import AirbnbImportRequest, ImportedListing
from app.schemas.common import Page
from app.schemas.property import (
    PropertyCreate,
    PropertyListItem,
    PropertyRead,
    PropertyUpdate,
)
from app.services import airbnb_importer, property_service

router = APIRouter(prefix="/properties", tags=["properties"])

HostUser = Annotated[User, Depends(require_role(UserRole.HOST))]


# --------------------------------------------------------------------------- #
# Public
# --------------------------------------------------------------------------- #
@router.get("", response_model=Page[PropertyListItem])
async def search(
    db: DbSession,
    q: Annotated[str | None, Query(description="Free text on title or resort name")] = None,
    area: Annotated[str | None, Query()] = None,
    resort_id: Annotated[uuid.UUID | None, Query()] = None,
    property_type: Annotated[PropertyType | None, Query()] = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    guests: Annotated[int | None, Query(ge=1)] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[PropertyListItem]:
    items, total = await property_service.search_properties(
        db,
        q=q,
        area=area,
        resort_id=resort_id,
        property_type=property_type.value if property_type else None,
        min_price=min_price,
        max_price=max_price,
        guests=guests,
        limit=limit,
        offset=offset,
    )
    return Page(
        items=[PropertyListItem.model_validate(p) for p in items],
        total=total,
        limit=limit,
        offset=offset,
    )


# --------------------------------------------------------------------------- #
# Host management (more specific routes before /{property_id})
# --------------------------------------------------------------------------- #
@router.get("/mine", response_model=Page[PropertyRead])
async def my_properties(
    host: HostUser,
    db: DbSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[PropertyRead]:
    items, total = await property_service.list_host_properties(
        db, host, limit=limit, offset=offset
    )
    return Page(
        items=[PropertyRead.model_validate(p) for p in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=PropertyRead, status_code=status.HTTP_201_CREATED)
async def create_property(payload: PropertyCreate, host: HostUser, db: DbSession) -> PropertyRead:
    prop = await property_service.create_property(db, host, payload)
    return PropertyRead.model_validate(prop)


@router.post("/import", response_model=ImportedListing)
async def import_from_airbnb(
    payload: AirbnbImportRequest, _host: HostUser
) -> ImportedListing:
    """Scrape an Airbnb URL and return structured data to prefill the wizard.

    This does NOT create a listing — the host reviews & submits afterwards.
    """
    return await airbnb_importer.import_from_airbnb(payload.url)


@router.get("/{property_id}", response_model=PropertyRead)
async def get_property(property_id: uuid.UUID, db: DbSession) -> PropertyRead:
    prop = await property_service.get_public_property(db, property_id)
    return PropertyRead.model_validate(prop)


@router.patch("/{property_id}", response_model=PropertyRead)
async def update_property(
    property_id: uuid.UUID, payload: PropertyUpdate, host: HostUser, db: DbSession
) -> PropertyRead:
    prop = await property_service.get_owned_property(db, property_id, host)
    prop = await property_service.update_property(db, prop, payload)
    return PropertyRead.model_validate(prop)


@router.post("/{property_id}/submit", response_model=PropertyRead)
async def submit_for_review(
    property_id: uuid.UUID, host: HostUser, db: DbSession
) -> PropertyRead:
    prop = await property_service.get_owned_property(db, property_id, host)
    prop = await property_service.submit_for_review(db, prop)
    return PropertyRead.model_validate(prop)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(property_id: uuid.UUID, host: HostUser, db: DbSession):
    prop = await property_service.get_owned_property(db, property_id, host)
    await property_service.delete_property(db, prop)
