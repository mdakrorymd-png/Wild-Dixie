"""Public, token-protected iCal export feed (mounted at the app root)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Response

from app.api.deps import DbSession
from app.services import calendar_service

router = APIRouter(tags=["ical"])


@router.get("/ical/{property_id}/{token}.ics")
async def export_calendar(
    property_id: uuid.UUID, token: str, db: DbSession
) -> Response:
    """Serve the property's blocked/booked nights as an .ics feed.

    The unguessable token (not auth) protects the feed, so external services
    like Airbnb can poll it without credentials.
    """
    prop = await calendar_service.get_property_by_export_token(db, property_id, token)
    ics = await calendar_service.build_export_ics(db, prop)
    return Response(
        content=ics,
        media_type="text/calendar",
        headers={"Content-Disposition": f'inline; filename="{property_id}.ics"'},
    )
