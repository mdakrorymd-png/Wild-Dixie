"""Business logic for property listings: CRUD, moderation, and search."""
from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, PermissionError_, ValidationError_
from app.models.amenity import Amenity
from app.models.enums import PropertyStatus
from app.models.property import Property, PropertyImage
from app.models.resort import Resort
from app.models.user import User
from app.schemas.property import (
    PropertyCreate,
    PropertyImageIn,
    PropertyUpdate,
)

# Statuses a host is allowed to edit (a live listing must be re-reviewed).
_EDITABLE_STATUSES = {PropertyStatus.DRAFT, PropertyStatus.REJECTED}


async def _load_amenities(db: AsyncSession, amenity_ids: list[uuid.UUID]) -> list[Amenity]:
    if not amenity_ids:
        return []
    result = await db.execute(select(Amenity).where(Amenity.id.in_(amenity_ids)))
    amenities = list(result.scalars().all())
    found = {a.id for a in amenities}
    missing = set(amenity_ids) - found
    if missing:
        raise ValidationError_(f"Unknown amenity ids: {', '.join(str(m) for m in missing)}")
    return amenities


async def _validate_resort(db: AsyncSession, resort_id: uuid.UUID | None) -> None:
    if resort_id is None:
        return
    if await db.get(Resort, resort_id) is None:
        raise ValidationError_("Unknown resort_id.")


def _build_images(images: list[PropertyImageIn]) -> list[PropertyImage]:
    out: list[PropertyImage] = []
    has_cover = False
    for idx, img in enumerate(images):
        is_cover = img.is_cover and not has_cover
        has_cover = has_cover or is_cover
        out.append(
            PropertyImage(url=str(img.url), position=img.position or idx, is_cover=is_cover)
        )
    # Guarantee exactly one cover when images exist.
    if out and not has_cover:
        out[0].is_cover = True
    return out


# --------------------------------------------------------------------------- #
# Create / read / update / delete
# --------------------------------------------------------------------------- #
async def create_property(db: AsyncSession, host: User, payload: PropertyCreate) -> Property:
    await _validate_resort(db, payload.resort_id)
    amenities = await _load_amenities(db, payload.amenity_ids)

    data = payload.model_dump(exclude={"amenity_ids", "images"})
    prop = Property(host_id=host.id, status=PropertyStatus.DRAFT, **data)
    prop.amenities = amenities
    prop.images = _build_images(payload.images)

    db.add(prop)
    await db.flush()
    return prop


async def get_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await db.get(Property, property_id)
    if prop is None:
        raise NotFoundError("Property not found.")
    return prop


async def get_public_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await get_property(db, property_id)
    if prop.status != PropertyStatus.PUBLISHED:
        raise NotFoundError("Property not found.")
    return prop


async def get_owned_property(
    db: AsyncSession, property_id: uuid.UUID, host: User
) -> Property:
    prop = await get_property(db, property_id)
    if prop.host_id != host.id:
        raise PermissionError_("You do not own this property.")
    return prop


async def update_property(
    db: AsyncSession, prop: Property, payload: PropertyUpdate
) -> Property:
    if prop.status not in _EDITABLE_STATUSES:
        raise ValidationError_(
            "Only draft or rejected listings can be edited. Contact support to change a live listing."
        )

    data = payload.model_dump(exclude_unset=True, exclude={"amenity_ids", "images"})
    if "resort_id" in data:
        await _validate_resort(db, data["resort_id"])
    for key, value in data.items():
        setattr(prop, key, value)

    if payload.amenity_ids is not None:
        prop.amenities = await _load_amenities(db, payload.amenity_ids)
    if payload.images is not None:
        prop.images = _build_images(payload.images)

    await db.flush()
    return prop


async def delete_property(db: AsyncSession, prop: Property) -> None:
    await db.delete(prop)


async def submit_for_review(db: AsyncSession, prop: Property) -> Property:
    if prop.status not in _EDITABLE_STATUSES:
        raise ValidationError_("Only draft or rejected listings can be submitted for review.")
    if not prop.images:
        raise ValidationError_("Add at least one image before submitting for review.")
    prop.status = PropertyStatus.PENDING_REVIEW
    prop.rejection_reason = None
    await db.flush()
    return prop


# --------------------------------------------------------------------------- #
# Host listing
# --------------------------------------------------------------------------- #
async def list_host_properties(
    db: AsyncSession, host: User, *, limit: int, offset: int
) -> tuple[list[Property], int]:
    base = select(Property).where(Property.host_id == host.id)
    total = await db.scalar(
        select(func.count()).select_from(base.subquery())
    )
    result = await db.execute(
        base.order_by(Property.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all()), int(total or 0)


# --------------------------------------------------------------------------- #
# Public search (hyper-local)
# --------------------------------------------------------------------------- #
async def search_properties(
    db: AsyncSession,
    *,
    q: str | None = None,
    area: str | None = None,
    resort_id: uuid.UUID | None = None,
    property_type: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    guests: int | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Property], int]:
    # Only published listings are publicly searchable.
    stmt = select(Property).outerjoin(Resort, Property.resort_id == Resort.id)
    stmt = stmt.where(Property.status == PropertyStatus.PUBLISHED)

    if q:
        like = f"%{q.strip()}%"
        # Hyper-local: match the listing title OR the resort/village name.
        stmt = stmt.where(or_(Property.title.ilike(like), Resort.name.ilike(like)))
    if area:
        stmt = stmt.where(Property.area.ilike(f"%{area.strip()}%"))
    if resort_id:
        stmt = stmt.where(Property.resort_id == resort_id)
    if property_type:
        stmt = stmt.where(Property.property_type == property_type)
    if min_price is not None:
        stmt = stmt.where(Property.base_price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Property.base_price_per_night <= max_price)
    if guests is not None:
        stmt = stmt.where(Property.max_guests >= guests)

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    result = await db.execute(
        stmt.order_by(Property.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all()), int(total or 0)


# --------------------------------------------------------------------------- #
# Admin moderation
# --------------------------------------------------------------------------- #
async def list_pending(
    db: AsyncSession, *, limit: int, offset: int
) -> tuple[list[Property], int]:
    base = select(Property).where(Property.status == PropertyStatus.PENDING_REVIEW)
    total = await db.scalar(select(func.count()).select_from(base.subquery()))
    result = await db.execute(
        base.order_by(Property.created_at.asc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all()), int(total or 0)


async def approve_property(db: AsyncSession, property_id: uuid.UUID) -> Property:
    prop = await get_property(db, property_id)
    if prop.status != PropertyStatus.PENDING_REVIEW:
        raise ValidationError_("Only listings pending review can be approved.")
    prop.status = PropertyStatus.PUBLISHED
    prop.rejection_reason = None
    await db.flush()
    return prop


async def reject_property(db: AsyncSession, property_id: uuid.UUID, reason: str) -> Property:
    prop = await get_property(db, property_id)
    if prop.status != PropertyStatus.PENDING_REVIEW:
        raise ValidationError_("Only listings pending review can be rejected.")
    prop.status = PropertyStatus.REJECTED
    prop.rejection_reason = reason
    await db.flush()
    return prop
