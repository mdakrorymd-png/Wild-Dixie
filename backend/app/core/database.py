"""Async SQLAlchemy engine, session factory, and the declarative Base."""
import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

_engine_kwargs: dict = {
    "echo": settings.ENVIRONMENT == "development",
    "future": True,
    "connect_args": settings.db_connect_args,
}
# On serverless (Vercel), don't keep a connection pool across invocations — each
# cold instance would otherwise hold idle Postgres connections and exhaust the
# (small) free-tier limit. NullPool opens/closes per request instead.
if os.getenv("VERCEL"):
    _engine_kwargs["poolclass"] = NullPool
else:
    _engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Declarative base shared by every ORM model."""


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a transactional session.

    Commits on a clean exit, rolls back on any raised exception, and always
    closes the session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
