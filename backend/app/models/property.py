"""Property listing + its images."""
from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.amenity import Amenity, property_amenities
from app.models.base import TimestampMixin, UUIDMixin, pg_enum
from app.models.enums import ListingSource, ListingType, PropertyStatus, PropertyType
from app.models.pricing import PropertyPriceRule
from app.models.resort import Resort

_property_type_enum = pg_enum(PropertyType, "property_type")
_property_status_enum = pg_enum(PropertyStatus, "property_status")
_listing_source_enum = pg_enum(ListingSource, "listing_source")
_listing_type_enum = pg_enum(ListingType, "listing_type")


class Property(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "properties"

    host_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # ---- content ----
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    property_type: Mapped[PropertyType] = mapped_column(_property_type_enum, nullable=False)
    house_rules: Mapped[str | None] = mapped_column(Text, nullable=True)
    check_in_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    check_out_time: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # ---- location (hyper-local) ----
    area: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    resort_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("resorts.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    address_line: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # ---- capacity ----
    max_guests: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    beds: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # ---- pricing (EGP) ----
    currency: Mapped[str] = mapped_column(String(3), nullable=False, server_default=text("'EGP'"))
    base_price_per_night: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    cleaning_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    security_deposit: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default=text("0"))
    # عربون: percentage (0-100) accepted as a down-payment. 0 => full payment only.
    down_payment_percentage: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))

    min_nights: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("1"))
    max_nights: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Egypt policy: electricity & water are paid separately by the guest at the
    # property (prepaid card top-up or deducted from the damage deposit).
    utilities_paid_by_guest: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    # ---- dynamic pricing ----
    # Weekend premium (Thu/Fri/Sat in Egypt). NULL = same as base_price.
    weekend_price_per_night: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    # Length-of-stay discounts (0-100 %).
    weekly_discount: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    monthly_discount: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    # Time-based discounts.
    early_bird_discount: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    early_bird_days: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("30"))
    last_minute_discount: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    last_minute_days: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("7"))
    # Booking flow.
    instant_book: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))

    # ---- workflow / provenance ----
    status: Mapped[PropertyStatus] = mapped_column(
        _property_status_enum, nullable=False, server_default=text("'draft'")
    )
    source: Mapped[ListingSource] = mapped_column(
        _listing_source_enum, nullable=False, server_default=text("'manual'")
    )
    listing_type: Mapped[ListingType | None] = mapped_column(
        _listing_type_enum, nullable=True, server_default=text("'self_list'")
    )
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Unguessable token for the public iCal export feed (lazily generated).
    ical_export_token: Mapped[str | None] = mapped_column(
        String(64), unique=True, index=True, nullable=True
    )

    # ---- relationships ----
    price_rules: Mapped[list["PropertyPriceRule"]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyPriceRule.start_date",
        lazy="selectin",
    )
    images: Mapped[list["PropertyImage"]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyImage.position",
        lazy="selectin",
    )
    amenities: Mapped[list[Amenity]] = relationship(
        secondary=property_amenities,
        lazy="selectin",
    )
    resort: Mapped[Resort | None] = relationship(lazy="selectin")

    @property
    def is_publicly_visible(self) -> bool:
        return self.status == PropertyStatus.PUBLISHED

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Property {self.title!r} status={self.status.value}>"


class PropertyImage(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "property_images"

    property_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))

    property: Mapped[Property] = relationship(back_populates="images")
