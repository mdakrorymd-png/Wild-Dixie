"""availability calendar + iCal sources + property export token

Revision ID: 0003_calendar
Revises: 0002_properties
Create Date: 2026-06-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_calendar"
down_revision: Union[str, None] = "0002_properties"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    day_status = postgresql.ENUM("available", "blocked", "booked", name="day_status")
    block_source = postgresql.ENUM(
        "host_manual", "external_ical", "internal_booking", name="block_source"
    )
    day_status.create(bind, checkfirst=True)
    block_source.create(bind, checkfirst=True)

    status_ref = postgresql.ENUM(name="day_status", create_type=False)
    source_ref = postgresql.ENUM(name="block_source", create_type=False)

    # Per-property export token for the public iCal feed.
    op.add_column("properties", sa.Column("ical_export_token", sa.String(length=64), nullable=True))
    op.create_unique_constraint("uq_properties_ical_token", "properties", ["ical_export_token"])
    op.create_index("ix_properties_ical_token", "properties", ["ical_export_token"])

    # ---- ical_sources (created first: calendar_days references it) ----
    op.create_table(
        "ical_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_status", sa.String(length=20), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_ical_sources_property_id", "ical_sources", ["property_id"])

    # ---- calendar_days (sparse availability) ----
    op.create_table(
        "calendar_days",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("status", status_ref, nullable=False),
        sa.Column("source", source_ref, nullable=False),
        sa.Column("ical_source_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("external_uid", sa.String(length=255), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ical_source_id"], ["ical_sources.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("property_id", "date", name="uq_calendar_property_date"),
    )
    op.create_index("ix_calendar_days_property_id", "calendar_days", ["property_id"])
    op.create_index("ix_calendar_days_date", "calendar_days", ["date"])
    op.create_index("ix_calendar_days_ical_source_id", "calendar_days", ["ical_source_id"])


def downgrade() -> None:
    op.drop_index("ix_calendar_days_ical_source_id", table_name="calendar_days")
    op.drop_index("ix_calendar_days_date", table_name="calendar_days")
    op.drop_index("ix_calendar_days_property_id", table_name="calendar_days")
    op.drop_table("calendar_days")

    op.drop_index("ix_ical_sources_property_id", table_name="ical_sources")
    op.drop_table("ical_sources")

    op.drop_index("ix_properties_ical_token", table_name="properties")
    op.drop_constraint("uq_properties_ical_token", "properties", type_="unique")
    op.drop_column("properties", "ical_export_token")

    bind = op.get_bind()
    postgresql.ENUM(name="block_source").drop(bind, checkfirst=True)
    postgresql.ENUM(name="day_status").drop(bind, checkfirst=True)
