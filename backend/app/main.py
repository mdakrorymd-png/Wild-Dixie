"""FastAPI application entrypoint."""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import ical_feed
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import register_exception_handlers
from app.services import scheduler

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

_MIGRATION_0011 = """
DO $$
BEGIN
    -- Dynamic pricing columns on properties
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='weekend_price_per_night') THEN
        ALTER TABLE properties
            ADD COLUMN weekend_price_per_night NUMERIC(10,2),
            ADD COLUMN weekly_discount INT NOT NULL DEFAULT 0,
            ADD COLUMN monthly_discount INT NOT NULL DEFAULT 0,
            ADD COLUMN early_bird_discount INT NOT NULL DEFAULT 0,
            ADD COLUMN early_bird_days INT NOT NULL DEFAULT 30,
            ADD COLUMN last_minute_discount INT NOT NULL DEFAULT 0,
            ADD COLUMN last_minute_days INT NOT NULL DEFAULT 7,
            ADD COLUMN instant_book BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    -- Seasonal / custom price rules table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='property_price_rules') THEN
        CREATE TABLE property_price_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            label VARCHAR(100) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            price_per_night NUMERIC(10,2) NOT NULL,
            min_nights INT,
            priority INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_ppr_property ON property_price_rules(property_id);
    END IF;
END $$;
"""

_MIGRATION_0010 = """
DO $$
BEGIN
    -- Create the enum type if it doesn't exist yet.
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM ('self_list', 'managed');
    END IF;
    -- Add the column if it doesn't exist yet.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'properties' AND column_name = 'listing_type'
    ) THEN
        ALTER TABLE properties
            ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'self_list';
        -- Mark in alembic_version so the file-based migration is skipped later.
        UPDATE alembic_version SET version_num = '0010_listing_type'
        WHERE version_num = '0009_wallet_provider';
    END IF;
END $$;
"""


async def _apply_pending_migrations() -> None:
    """Idempotent startup migrations — safe to run on every cold start."""
    try:
        import sqlalchemy as _sa
        async with engine.begin() as conn:
            await conn.execute(_sa.text(_MIGRATION_0010))
            await conn.execute(_sa.text(_MIGRATION_0011))
        log.info("Startup migrations applied (or already up to date).")
    except Exception as exc:
        log.warning("Startup migration error (continuing): %s", exc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await _apply_pending_migrations()
    scheduler_tasks: list[asyncio.Task] = []
    scheduler.start(scheduler_tasks)
    try:
        yield
    finally:
        await scheduler.stop(scheduler_tasks)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    lifespan=lifespan,
)

# CORS — tighten the origins per environment before production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not settings.is_production else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
# Public iCal export feed is mounted at the root (stable URL for Airbnb).
app.include_router(ical_feed.router)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.ENVIRONMENT}
