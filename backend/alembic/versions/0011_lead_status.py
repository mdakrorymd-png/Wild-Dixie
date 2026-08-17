"""add status (pipeline stage) to leads

Revision ID: 0011_lead_status
Revises: 0010_listing_type
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0011_lead_status"
down_revision: Union[str, None] = "0010_listing_type"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Idempotent, matching 0010's style: safe to re-run against a DB where the
    # startup migration already applied it.
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'leads' AND column_name = 'status'
            ) THEN
                ALTER TABLE leads
                    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'new';
                CREATE INDEX ix_leads_status ON leads (status);
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.drop_index("ix_leads_status", table_name="leads")
    op.drop_column("leads", "status")
