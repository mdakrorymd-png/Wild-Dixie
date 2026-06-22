"""gated-compound compliance on resorts + gate_pass_status on bookings

Revision ID: 0008_gate_compliance
Revises: 0007_leads
Create Date: 2026-06-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0008_gate_compliance"
down_revision: Union[str, None] = "0007_leads"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("resorts", sa.Column("rental_allowed", sa.Boolean(), server_default=sa.text("true"), nullable=False))
    op.add_column("resorts", sa.Column("gate_app", sa.String(length=120), nullable=True))
    op.add_column("resorts", sa.Column("beach_code_required", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("resorts", sa.Column("pass_fee", sa.Numeric(10, 2), server_default=sa.text("0"), nullable=False))
    op.add_column("bookings", sa.Column("gate_pass_status", sa.String(length=20), server_default=sa.text("'pending'"), nullable=False))


def downgrade() -> None:
    op.drop_column("bookings", "gate_pass_status")
    op.drop_column("resorts", "pass_fee")
    op.drop_column("resorts", "beach_code_required")
    op.drop_column("resorts", "gate_app")
    op.drop_column("resorts", "rental_allowed")
