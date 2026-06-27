"""Public catalog endpoints feeding the listing wizard & search filters."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select

from app.api.deps import DbSession, require_role
from app.models.amenity import Amenity
from app.models.enums import UserRole
from app.models.resort import Resort
from app.models.user import User
from app.schemas.catalog import (
    AmenityCreate,
    AmenityRead,
    DestinationRead,
    ResortCreate,
    ResortRead,
)

router = APIRouter(prefix="/catalog", tags=["catalog"])

HostUser = Annotated[User, Depends(require_role(UserRole.HOST))]


@router.get("/destinations", response_model=list[DestinationRead])
async def list_destinations(db: DbSession) -> list[DestinationRead]:
    """Browsable destination groupings (area) with resort counts, busiest first."""
    result = await db.execute(
        select(
            Resort.area,
            func.min(Resort.governorate).label("governorate"),
            func.count(Resort.id).label("resort_count"),
        )
        .group_by(Resort.area)
        .order_by(func.count(Resort.id).desc())
    )
    return [
        DestinationRead(area=row.area, governorate=row.governorate, resort_count=int(row.resort_count))
        for row in result
    ]


@router.get("/resorts", response_model=list[ResortRead])
async def list_resorts(
    db: DbSession,
    area: Annotated[str | None, Query()] = None,
    governorate: Annotated[str | None, Query()] = None,
    q: Annotated[str | None, Query(description="Search resort name")] = None,
) -> list[Resort]:
    stmt = select(Resort)
    if area:
        stmt = stmt.where(Resort.area.ilike(f"%{area}%"))
    if governorate:
        stmt = stmt.where(Resort.governorate.ilike(f"%{governorate}%"))
    if q:
        stmt = stmt.where(Resort.name.ilike(f"%{q}%"))
    # Alphabetical by the Arabic name (falls back to the English name).
    result = await db.execute(stmt.order_by(func.coalesce(Resort.name_ar, Resort.name)))
    return list(result.scalars().all())


@router.post("/resorts", response_model=ResortRead, status_code=status.HTTP_201_CREATED)
async def create_resort(payload: ResortCreate, _host: HostUser, db: DbSession) -> Resort:
    """Let a host add a compound that isn't in the catalog (reuses an existing
    one with the same name to avoid duplicates)."""
    name = payload.name.strip()
    existing = await db.scalar(select(Resort).where(func.lower(Resort.name) == name.lower()))
    if existing is not None:
        return existing
    resort = Resort(name=name, name_ar=name, area=payload.area, governorate="Suez")
    db.add(resort)
    await db.flush()
    return resort


@router.post("/amenities", response_model=AmenityRead, status_code=status.HTTP_201_CREATED)
async def create_amenity(payload: AmenityCreate, _host: HostUser, db: DbSession) -> Amenity:
    """Let a host add a custom amenity not in the catalog (deduped by name)."""
    name = payload.name.strip()
    existing = await db.scalar(select(Amenity).where(func.lower(Amenity.name) == name.lower()))
    if existing is not None:
        return existing
    amenity = Amenity(name=name, category="custom")
    db.add(amenity)
    await db.flush()
    return amenity


@router.get("/amenities", response_model=list[AmenityRead])
async def list_amenities(db: DbSession) -> list[Amenity]:
    result = await db.execute(select(Amenity).order_by(Amenity.category, Amenity.name))
    return list(result.scalars().all())
