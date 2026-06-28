"""add listing_type to properties (self_list vs managed)

Revision ID: 0010_listing_type
Revises: 0009_wallet_provider
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0010_listing_type"
down_revision: Union[str, None] = "0009_wallet_provider"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Idempotent: the startup migration in main.py may have already applied this.
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
                CREATE TYPE listing_type AS ENUM ('self_list', 'managed');
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'properties' AND column_name = 'listing_type'
            ) THEN
                ALTER TABLE properties
                    ADD COLUMN listing_type listing_type NOT NULL DEFAULT 'self_list';
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.drop_column("properties", "listing_type")
    op.execute("DROP TYPE IF EXISTS listing_type")
