"""property listings, resorts, amenities + seed catalog data

Revision ID: 0002_properties
Revises: 0001_initial_auth
Create Date: 2026-06-20
"""
import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_properties"
down_revision: Union[str, None] = "0001_initial_auth"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    property_type = postgresql.ENUM(
        "chalet", "villa", "apartment", "studio", "cabin", "room",
        name="property_type",
    )
    property_status = postgresql.ENUM(
        "draft", "pending_review", "published", "rejected", "suspended",
        name="property_status",
    )
    listing_source = postgresql.ENUM(
        "manual", "airbnb_import", name="listing_source",
    )
    for enum_type in (property_type, property_status, listing_source):
        enum_type.create(bind, checkfirst=True)

    type_ref = postgresql.ENUM(name="property_type", create_type=False)
    status_ref = postgresql.ENUM(name="property_status", create_type=False)
    source_ref = postgresql.ENUM(name="listing_source", create_type=False)

    # ---- resorts ----
    resorts = op.create_table(
        "resorts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("area", sa.String(length=100), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_unique_constraint("uq_resorts_name", "resorts", ["name"])
    op.create_index("ix_resorts_name", "resorts", ["name"])
    op.create_index("ix_resorts_area", "resorts", ["area"])

    # ---- amenities ----
    amenities = op.create_table(
        "amenities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False, server_default=sa.text("'general'")),
        sa.Column("icon", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_unique_constraint("uq_amenities_name", "amenities", ["name"])
    op.create_index("ix_amenities_name", "amenities", ["name"])

    # ---- properties ----
    op.create_table(
        "properties",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("host_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("property_type", type_ref, nullable=False),
        sa.Column("house_rules", sa.Text(), nullable=True),
        sa.Column("check_in_time", sa.String(length=20), nullable=True),
        sa.Column("check_out_time", sa.String(length=20), nullable=True),
        sa.Column("area", sa.String(length=100), nullable=False),
        sa.Column("resort_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("address_line", sa.String(length=255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("max_guests", sa.Integer(), nullable=False),
        sa.Column("bedrooms", sa.Integer(), nullable=False),
        sa.Column("beds", sa.Integer(), nullable=False),
        sa.Column("bathrooms", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default=sa.text("'EGP'"), nullable=False),
        sa.Column("base_price_per_night", sa.Numeric(10, 2), nullable=False),
        sa.Column("cleaning_fee", sa.Numeric(10, 2), server_default=sa.text("0"), nullable=False),
        sa.Column("security_deposit", sa.Numeric(10, 2), server_default=sa.text("0"), nullable=False),
        sa.Column("down_payment_percentage", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("min_nights", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("max_nights", sa.Integer(), nullable=True),
        sa.Column("status", status_ref, server_default=sa.text("'draft'"), nullable=False),
        sa.Column("source", source_ref, server_default=sa.text("'manual'"), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resort_id"], ["resorts.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_properties_host_id", "properties", ["host_id"])
    op.create_index("ix_properties_resort_id", "properties", ["resort_id"])
    op.create_index("ix_properties_area", "properties", ["area"])
    op.create_index("ix_properties_status", "properties", ["status"])

    # ---- property_images ----
    op.create_table(
        "property_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_cover", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_property_images_property_id", "property_images", ["property_id"])

    # ---- property_amenities (M2M) ----
    op.create_table(
        "property_amenities",
        sa.Column("property_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("amenity_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["amenity_id"], ["amenities.id"], ondelete="CASCADE"),
    )

    # ---- seed: amenities ----
    seed_amenities = [
        ("WiFi", "essentials", "wifi"),
        ("Air conditioning", "essentials", "ac"),
        ("Kitchen", "essentials", "kitchen"),
        ("TV", "essentials", "tv"),
        ("Washer", "essentials", "washer"),
        ("Heating", "essentials", "heating"),
        ("Free parking", "facilities", "parking"),
        ("Pool", "outdoor", "pool"),
        ("Beach access", "outdoor", "beach"),
        ("Sea view", "outdoor", "view"),
        ("Balcony", "outdoor", "balcony"),
        ("BBQ grill", "outdoor", "bbq"),
        ("Gym", "facilities", "gym"),
        ("Elevator", "facilities", "elevator"),
        ("Security gate", "safety", "gate"),
    ]
    op.bulk_insert(
        amenities,
        [{"id": uuid.uuid4(), "name": n, "category": c, "icon": i} for n, c, i in seed_amenities],
    )

    # ---- seed: well-known Egyptian resorts ----
    seed_resorts = [
        ("Marassi", "North Coast", "Sidi Abdel Rahman"),
        ("Hacienda Bay", "North Coast", "Sidi Abdel Rahman"),
        ("Marina", "North Coast", "El Alamein"),
        ("Telal", "Ain Sokhna", "Ain Sokhna"),
        ("Porto Sokhna", "Ain Sokhna", "Ain Sokhna"),
        ("La Vista", "Ain Sokhna", "Ain Sokhna"),
        ("El Gouna", "Gouna", "Hurghada"),
        ("Mountain View", "North Coast", "Ras El Hekma"),
    ]
    op.bulk_insert(
        resorts,
        [{"id": uuid.uuid4(), "name": n, "area": a, "city": c} for n, a, c in seed_resorts],
    )


def downgrade() -> None:
    op.drop_table("property_amenities")
    op.drop_index("ix_property_images_property_id", table_name="property_images")
    op.drop_table("property_images")
    for idx in ("ix_properties_status", "ix_properties_area", "ix_properties_resort_id", "ix_properties_host_id"):
        op.drop_index(idx, table_name="properties")
    op.drop_table("properties")
    op.drop_index("ix_amenities_name", table_name="amenities")
    op.drop_table("amenities")
    op.drop_index("ix_resorts_area", table_name="resorts")
    op.drop_index("ix_resorts_name", table_name="resorts")
    op.drop_table("resorts")

    bind = op.get_bind()
    for name in ("listing_source", "property_status", "property_type"):
        postgresql.ENUM(name=name).drop(bind, checkfirst=True)
