"""add wallet_provider to users (multi-wallet payout support)

Revision ID: 0009_wallet_provider
Revises: 0008_gate_compliance
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009_wallet_provider"
down_revision: Union[str, None] = "0008_gate_compliance"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("wallet_provider", sa.String(length=30), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "wallet_provider")
