"""FastAPI application entrypoint."""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import ical_feed
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.services import scheduler

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
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
