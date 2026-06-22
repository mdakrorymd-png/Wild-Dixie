"""Calendar endpoints: public availability + host blocks / iCal sync / export."""
from __future__ import annotations

import uuid
from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DbSession, require_role
from app.core.config import settings
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.calendar import (
    AvailabilityDay,
    AvailabilityResponse,
    BlockRequest,
    ExportLink,
    IcalSourceCreate,
    IcalSourceRead,
    SyncResult,
    UnblockRequest,
)
from app.services import calendar_service, property_service

router = APIRouter(prefix="/properties", tags=["calendar"])

HostUser = Annotated[User, Depends(require_role(UserRole.HOST))]

_DEFAULT_WINDOW_DAYS = 90


def _resolve_window(start: date | None, end: date | None) -> tuple[date, date]:
    start = start or date.today()
    end = end or (start + timedelta(days=_DEFAULT_WINDOW_DAYS))
    return start, end


async def _availability_payload(
    db, property_id: uuid.UUID, start: date | None, end: date | None
) -> AvailabilityResponse:
    start, end = _resolve_window(start, end)
    pairs = await calendar_service.get_availability(db, property_id, start, end)
    return AvailabilityResponse(
        property_id=property_id,
        start=start,
        end=end,
        days=[AvailabilityDay(date=d, status=s) for d, s in pairs],
    )


# --------------------------------------------------------------------------- #
# Public availability
# --------------------------------------------------------------------------- #
@router.get("/{property_id}/availability", response_model=AvailabilityResponse)
async def get_availability(
    property_id: uuid.UUID,
    db: DbSession,
    start: Annotated[date | None, Query()] = None,
    end: Annotated[date | None, Query()] = None,
) -> AvailabilityResponse:
    # 404 unless the listing is published.
    await property_service.get_public_property(db, property_id)
    return await _availability_payload(db, property_id, start, end)


# --------------------------------------------------------------------------- #
# Host calendar management (ownership enforced)
# --------------------------------------------------------------------------- #
@router.get("/{property_id}/calendar", response_model=AvailabilityResponse)
async def host_calendar(
    property_id: uuid.UUID,
    host: HostUser,
    db: DbSession,
    start: Annotated[date | None, Query()] = None,
    end: Annotated[date | None, Query()] = None,
) -> AvailabilityResponse:
    await property_service.get_owned_property(db, property_id, host)
    return await _availability_payload(db, property_id, start, end)


@router.post("/{property_id}/calendar/block", response_model=AvailabilityResponse)
async def block_dates(
    property_id: uuid.UUID, payload: BlockRequest, host: HostUser, db: DbSession
) -> AvailabilityResponse:
    prop = await property_service.get_owned_property(db, property_id, host)
    await calendar_service.block_dates(db, prop, payload.start_date, payload.end_date, payload.note)
    return await _availability_payload(db, property_id, payload.start_date, payload.end_date)


@router.post("/{property_id}/calendar/unblock", response_model=AvailabilityResponse)
async def unblock_dates(
    property_id: uuid.UUID, payload: UnblockRequest, host: HostUser, db: DbSession
) -> AvailabilityResponse:
    prop = await property_service.get_owned_property(db, property_id, host)
    await calendar_service.unblock_dates(db, prop, payload.start_date, payload.end_date)
    return await _availability_payload(db, property_id, payload.start_date, payload.end_date)


# --------------------------------------------------------------------------- #
# External iCal sources
# --------------------------------------------------------------------------- #
@router.get("/{property_id}/calendar/ical-sources", response_model=list[IcalSourceRead])
async def list_sources(
    property_id: uuid.UUID, host: HostUser, db: DbSession
) -> list[IcalSourceRead]:
    await property_service.get_owned_property(db, property_id, host)
    sources = await calendar_service.list_ical_sources(db, property_id)
    return [IcalSourceRead.model_validate(s) for s in sources]


@router.post(
    "/{property_id}/calendar/ical-sources",
    response_model=IcalSourceRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_source(
    property_id: uuid.UUID, payload: IcalSourceCreate, host: HostUser, db: DbSession
) -> IcalSourceRead:
    prop = await property_service.get_owned_property(db, property_id, host)
    source = await calendar_service.add_ical_source(db, prop, payload.url, payload.name)
    return IcalSourceRead.model_validate(source)


@router.delete(
    "/{property_id}/calendar/ical-sources/{source_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_source(
    property_id: uuid.UUID, source_id: uuid.UUID, host: HostUser, db: DbSession
):
    await property_service.get_owned_property(db, property_id, host)
    source = await calendar_service.get_ical_source(db, property_id, source_id)
    await calendar_service.delete_ical_source(db, source)


@router.post("/{property_id}/calendar/sync", response_model=SyncResult)
async def sync_now(
    property_id: uuid.UUID, host: HostUser, db: DbSession
) -> SyncResult:
    prop = await property_service.get_owned_property(db, property_id, host)
    ok, failed, nights = await calendar_service.sync_property(db, prop)
    return SyncResult(
        property_id=property_id,
        sources_synced=ok,
        sources_failed=failed,
        blocked_nights=nights,
    )


# --------------------------------------------------------------------------- #
# Export link (for Airbnb to pull our bookings)
# --------------------------------------------------------------------------- #
@router.get("/{property_id}/calendar/export-link", response_model=ExportLink)
async def export_link(
    property_id: uuid.UUID, host: HostUser, db: DbSession
) -> ExportLink:
    prop = await property_service.get_owned_property(db, property_id, host)
    token = await calendar_service.ensure_export_token(db, prop)
    path = f"/ical/{property_id}/{token}.ics"
    return ExportLink(token=token, path=path, url=f"{settings.PUBLIC_BASE_URL}{path}")
