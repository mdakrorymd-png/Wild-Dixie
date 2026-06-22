"""leads / owner-estimator + area waitlist capture

Revision ID: 0007_leads
Revises: 0006_resort_gov
Create Date: 2026-06-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0007_leads"
down_revision: Union[str, None] = "0006_resort_gov"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("kind", sa.String(length=30), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("whatsapp", sa.String(length=30), nullable=True),
        sa.Column("area", sa.String(length=100), nullable=True),
        sa.Column("compound", sa.String(length=150), nullable=True),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("season", sa.String(length=30), nullable=True),
        sa.Column("has_pool", sa.Boolean(), nullable=True),
        sa.Column("estimated_gross", sa.Numeric(10, 2), nullable=True),
        sa.Column("estimated_net", sa.Numeric(10, 2), nullable=True),
        sa.Column("source", sa.Text(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_leads_kind", "leads", ["kind"])


def downgrade() -> None:
    op.drop_index("ix_leads_kind", table_name="leads")
    op.drop_table("leads")
