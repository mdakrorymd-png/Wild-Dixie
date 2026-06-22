"""add name_ar + governorate to resorts (all-governorates coverage)

Revision ID: 0006_resort_gov
Revises: 0005_egypt_policy
Create Date: 2026-06-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006_resort_gov"
down_revision: Union[str, None] = "0005_egypt_policy"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("resorts", sa.Column("name_ar", sa.String(length=150), nullable=True))
    op.add_column("resorts", sa.Column("governorate", sa.String(length=100), nullable=True))
    op.create_index("ix_resorts_governorate", "resorts", ["governorate"])


def downgrade() -> None:
    op.drop_index("ix_resorts_governorate", table_name="resorts")
    op.drop_column("resorts", "governorate")
    op.drop_column("resorts", "name_ar")
