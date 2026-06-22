"""egypt policy fields: utilities, strict cancellation, gate-pass car plate,
user payout handles + passport, and the pending_approval booking status

Revision ID: 0005_egypt_policy
Revises: 0004_bookings_payments
Create Date: 2026-06-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_egypt_policy"
down_revision: Union[str, None] = "0004_bookings_payments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # New booking status value for the manual-verification escrow window.
    op.execute("ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending_approval'")

    # users: passport (foreign guests) + host payout handles.
    op.add_column("users", sa.Column("passport_image", sa.String(length=1000), nullable=True))
    op.add_column("users", sa.Column("instapay_handle", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("vodafone_cash_number", sa.String(length=20), nullable=True))

    # properties: utilities-paid-by-guest policy flag.
    op.add_column(
        "properties",
        sa.Column("utilities_paid_by_guest", sa.Boolean(), server_default=sa.text("true"), nullable=False),
    )

    # bookings: security gate car plate + strict cancellation accounting.
    op.add_column("bookings", sa.Column("guest_car_plate", sa.String(length=20), nullable=True))
    op.add_column(
        "bookings",
        sa.Column("cancellation_fee_applied", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "bookings",
        sa.Column("cancellation_fee_amount", sa.Numeric(10, 2), server_default=sa.text("0"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("bookings", "cancellation_fee_amount")
    op.drop_column("bookings", "cancellation_fee_applied")
    op.drop_column("bookings", "guest_car_plate")
    op.drop_column("properties", "utilities_paid_by_guest")
    op.drop_column("users", "vodafone_cash_number")
    op.drop_column("users", "instapay_handle")
    op.drop_column("users", "passport_image")
    # Note: the 'pending_approval' enum value is intentionally left in place
    # (PostgreSQL cannot easily drop an enum value).