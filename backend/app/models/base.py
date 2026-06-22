"""Reusable mapped-column mixins: UUID primary key + created/updated timestamps."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column


def pg_enum(enum_cls: type[enum.Enum], name: str) -> SAEnum:
    """Build a Postgres ENUM column type that stores member *values*.

    SQLAlchemy defaults to storing member *names* (e.g. ``GUEST``); our DB enum
    types are defined with the lowercase values (``guest``). ``values_callable``
    bridges the two. ``create_type=False`` because the migrations own the types.
    """
    return SAEnum(
        enum_cls,
        name=name,
        create_type=False,
        values_callable=lambda e: [m.value for m in e],
    )


class UUIDMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
