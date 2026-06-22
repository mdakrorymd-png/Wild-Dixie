"""Public catalog endpoints feeding the listing wizard & search filters."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.api.deps import DbSession
from app.models.amenity import Amenity
from app.models.resort import Resort
from app.schemas.catalog import AmenityRead, DestinationRead, ResortRead

router = APIRouter(prefix="/catalog", tags=["catalog"])


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
    q: Annotated[str | None, Query(description="Search resort name")] = None,
) -> list[Resort]:
    stmt = select(Resort)
    if area:
        stmt = stmt.where(Resort.area.ilike(f"%{area}%"))
    if q:
        stmt = stmt.where(Resort.name.ilike(f"%{q}%"))
    result = await db.execute(stmt.order_by(Resort.area, Resort.name))
    return list(result.scalars().all())


@router.get("/amenities", response_model=list[AmenityRead])
async def list_amenities(db: DbSession) -> list[Amenity]:
    result = await db.execute(select(Amenity).order_by(Amenity.category, Amenity.name))
    return list(result.scalars().all())
