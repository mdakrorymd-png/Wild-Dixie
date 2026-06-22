"""Calendar availability, manual blocks, iCal import/export, and sync."""
from __future__ import annotations

import logging
import secrets
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ExternalServiceError, NotFoundError
from app.models.calendar import CalendarDay, IcalSource
from app.models.enums import BlockSource, DayStatus
from app.models.property import Property
from app.services import ical

logger = logging.getLogger("app.calendar")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _date_range_inclusive(start: date, end: date) -> list[date]:
    days: list[date] = []
    cur = start
    while cur <= end:
        days.append(cur)
        cur += timedelta(days=1)
    return days


# --------------------------------------------------------------------------- #
# Availability (read)
# --------------------------------------------------------------------------- #
async def get_availability(
    db: AsyncSession, property_id: uuid.UUID, start: date, end: date
) -> list[tuple[date, DayStatus]]:
    """Return ``(date, status)`` for every night in [start, end]; missing = available."""
    result = await db.execute(
        select(CalendarDay.date, CalendarDay.status).where(
            CalendarDay.property_id == property_id,
            CalendarDay.date >= start,
            CalendarDay.date <= end,
        )
    )
    stored = {row.date: row.status for row in result}
    return [(d, stored.get(d, DayStatus.AVAILABLE)) for d in _date_range_inclusive(start, end)]


async def is_range_available(
    db: AsyncSession, property_id: uuid.UUID, start: date, end: date
) -> bool:
    """True if no night in [start, end] is blocked or booked."""
    result = await db.execute(
        select(CalendarDay.id)
        .where(
            CalendarDay.property_id == property_id,
            CalendarDay.date >= start,
            CalendarDay.date <= end,
        )
        .limit(1)
    )
    return result.first() is None


# --------------------------------------------------------------------------- #
# Manual host blocks (write)
# --------------------------------------------------------------------------- #
async def block_dates(
    db: AsyncSession,
    prop: Property,
    start: date,
    end: date,
    note: str | None = None,
) -> int:
    existing_result = await db.execute(
        select(CalendarDay).where(
            CalendarDay.property_id == prop.id,
            CalendarDay.date >= start,
            CalendarDay.date <= end,
        )
    )
    existing = {row.date: row for row in existing_result.scalars()}

    changed = 0
    for d in _date_range_inclusive(start, end):
        row = existing.get(d)
        if row is None:
            db.add(
                CalendarDay(
                    property_id=prop.id,
                    date=d,
                    status=DayStatus.BLOCKED,
                    source=BlockSource.HOST_MANUAL,
                    note=note,
                )
            )
            changed += 1
        elif row.status != DayStatus.BOOKED:
            # Never silently turn a real booking into a manual block.
            row.status = DayStatus.BLOCKED
            row.source = BlockSource.HOST_MANUAL
            row.ical_source_id = None
            row.external_uid = None
            row.note = note
            changed += 1

    await db.flush()
    return changed


async def unblock_dates(db: AsyncSession, prop: Property, start: date, end: date) -> int:
    """Remove only host-created manual blocks in the range (bookings untouched)."""
    result = await db.execute(
        delete(CalendarDay).where(
            CalendarDay.property_id == prop.id,
            CalendarDay.date >= start,
            CalendarDay.date <= end,
            CalendarDay.source == BlockSource.HOST_MANUAL,
        )
    )
    await db.flush()
    return result.rowcount or 0


# --------------------------------------------------------------------------- #
# External iCal sources
# --------------------------------------------------------------------------- #
async def add_ical_source(
    db: AsyncSession, prop: Property, url: str, name: str
) -> IcalSource:
    source = IcalSource(property_id=prop.id, url=url, name=name)
    db.add(source)
    await db.flush()
    return source


async def list_ical_sources(db: AsyncSession, property_id: uuid.UUID) -> list[IcalSource]:
    result = await db.execute(
        select(IcalSource).where(IcalSource.property_id == property_id).order_by(IcalSource.created_at)
    )
    return list(result.scalars().all())


async def get_ical_source(
    db: AsyncSession, property_id: uuid.UUID, source_id: uuid.UUID
) -> IcalSource:
    source = await db.get(IcalSource, source_id)
    if source is None or source.property_id != property_id:
        raise NotFoundError("iCal source not found.")
    return source


async def delete_ical_source(db: AsyncSession, source: IcalSource) -> None:
    # Cascade removes its external CalendarDay rows.
    await db.delete(source)
    await db.flush()


async def _fetch_ical_text(url: str) -> str:
    if url.lower().startswith("webcal://"):
        url = "https://" + url[len("webcal://"):]
    try:
        import httpx
    except ImportError as exc:  # pragma: no cover
        raise ExternalServiceError(
            "iCal sync requires httpx. Install it with `pip install httpx`."
        ) from exc

    async with httpx.AsyncClient(timeout=settings.ICAL_FETCH_TIMEOUT_SECONDS, follow_redirects=True) as client:
        resp = await client.get(url, headers={"User-Agent": "EgyptRentals-Calendar/1.0"})
        resp.raise_for_status()
        return resp.text


async def sync_source(db: AsyncSession, source: IcalSource) -> tuple[bool, int]:
    """Fetch one external feed and replace its blocks. Never raises — records
    the outcome on the source row and returns ``(ok, nights_blocked)``."""
    try:
        text = await _fetch_ical_text(source.url)
        events = ical.parse_ical(text)
    except Exception as exc:  # noqa: BLE001
        logger.warning("iCal sync failed for %s: %s", source.url, exc)
        source.last_status = "error"
        source.last_error = str(exc)[:500]
        source.last_synced_at = _now()
        await db.flush()
        return False, 0

    # nights this feed currently blocks (later events win on UID for a date)
    nights: dict[date, str] = {}
    for ev in events:
        for night in ev.nights():
            nights[night] = ev.uid

    # Replace this source's previously-imported rows.
    await db.execute(delete(CalendarDay).where(CalendarDay.ical_source_id == source.id))
    await db.flush()

    # Dates already occupied by host blocks / bookings / other feeds.
    occupied_result = await db.execute(
        select(CalendarDay.date).where(CalendarDay.property_id == source.property_id)
    )
    occupied = set(occupied_result.scalars())

    count = 0
    for night, uid in nights.items():
        if night in occupied:
            continue
        db.add(
            CalendarDay(
                property_id=source.property_id,
                date=night,
                status=DayStatus.BLOCKED,
                source=BlockSource.EXTERNAL_ICAL,
                ical_source_id=source.id,
                external_uid=uid,
            )
        )
        occupied.add(night)
        count += 1

    source.last_status = "ok"
    source.last_error = None
    source.last_synced_at = _now()
    await db.flush()
    return True, count


async def sync_property(db: AsyncSession, prop: Property) -> tuple[int, int, int]:
    """Sync every external feed of a property. Returns (ok, failed, nights)."""
    sources = await list_ical_sources(db, prop.id)
    ok = failed = nights = 0
    for source in sources:
        success, count = await sync_source(db, source)
        if success:
            ok += 1
            nights += count
        else:
            failed += 1
    return ok, failed, nights


async def sync_all_sources(db: AsyncSession) -> int:
    """Sync every feed in the system (used by the background scheduler)."""
    result = await db.execute(select(IcalSource))
    sources = list(result.scalars().all())
    total = 0
    for source in sources:
        success, count = await sync_source(db, source)
        if success:
            total += count
    return total


# --------------------------------------------------------------------------- #
# iCal export (our calendar -> Airbnb)
# --------------------------------------------------------------------------- #
async def ensure_export_token(db: AsyncSession, prop: Property) -> str:
    if not prop.ical_export_token:
        prop.ical_export_token = secrets.token_urlsafe(24)
        await db.flush()
    return prop.ical_export_token


async def get_property_by_export_token(
    db: AsyncSession, property_id: uuid.UUID, token: str
) -> Property:
    prop = await db.get(Property, property_id)
    if prop is None or not prop.ical_export_token or not secrets.compare_digest(
        prop.ical_export_token, token
    ):
        raise NotFoundError("Calendar feed not found.")
    return prop


async def build_export_ics(db: AsyncSession, prop: Property) -> str:
    """Generate the .ics feed of unavailable future nights for Airbnb to pull."""
    today = _now().date()
    result = await db.execute(
        select(CalendarDay.date).where(
            CalendarDay.property_id == prop.id,
            CalendarDay.date >= today,
            CalendarDay.status.in_([DayStatus.BLOCKED, DayStatus.BOOKED]),
        )
    )
    blocked = list(result.scalars())
    return ical.generate_ical(
        calendar_name=prop.title,
        blocked_days=blocked,
        uid_namespace=str(prop.id),
    )
