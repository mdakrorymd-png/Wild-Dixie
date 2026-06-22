"""Lightweight in-process scheduler that syncs every iCal feed periodically.

This is the simplest thing that works for a single worker. For multi-worker
production, move ``sync_all_sources`` to a Celery beat task (Redis broker) so it
runs exactly once per interval instead of once per worker.
"""
from __future__ import annotations

import asyncio
import logging

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.services import booking_service, calendar_service

logger = logging.getLogger("app.scheduler")


async def _run_loop() -> None:
    interval = max(1, settings.ICAL_SYNC_INTERVAL_MINUTES) * 60
    logger.info("iCal scheduler started (every %s min).", settings.ICAL_SYNC_INTERVAL_MINUTES)
    while True:
        try:
            await asyncio.sleep(interval)
            async with AsyncSessionLocal() as db:
                expired = await booking_service.expire_stale_bookings(db)
                blocked = await calendar_service.sync_all_sources(db)
                await db.commit()
            logger.info(
                "Sync cycle: %s nights blocked, %s stale holds expired.", blocked, expired
            )
        except asyncio.CancelledError:
            logger.info("iCal scheduler stopping.")
            raise
        except Exception:  # noqa: BLE001 - keep the loop alive across failures
            logger.exception("iCal sync cycle failed; will retry next interval.")


def start(loop_task_holder: list[asyncio.Task]) -> None:
    if not settings.ENABLE_ICAL_SCHEDULER:
        logger.info("iCal scheduler disabled via settings.")
        return
    loop_task_holder.append(asyncio.create_task(_run_loop(), name="ical-scheduler"))


async def stop(loop_task_holder: list[asyncio.Task]) -> None:
    for task in loop_task_holder:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    loop_task_holder.clear()
