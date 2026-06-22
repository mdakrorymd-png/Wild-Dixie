"""bookings, payments, payouts, disputes + calendar_days.booking_id

Revision ID: 0004_bookings_payments
Revises: 0003_calendar
Create Date: 2026-06-20
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0004_bookings_payments"
down_revision: Union[str, None] = "0003_calendar"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    booking_status = postgresql.ENUM(
        "pending_payment", "confirmed", "cancelled", "expired", "completed", name="booking_status"
    )
    payment_method = postgresql.ENUM("card", "instapay", "vodafone_cash", name="payment_method")
    payment_kind = postgresql.ENUM("full", "down_payment", "balance", name="payment_kind")
    payment_status = postgresql.ENUM(
        "pending", "awaiting_review", "confirmed", "rejected", "refunded", name="payment_status"
    )
    payout_status = postgresql.ENUM("pending", "paid", name="payout_status")
    dispute_status = postgresql.ENUM("open", "resolved", "rejected", name="dispute_status")
    for e in (booking_status, payment_method, payment_kind, payment_status, payout_status, dispute_status):
        e.create(bind, checkfirst=True)

    bs = postgresql.ENUM(name="booking_status", create_type=False)
    pm = postgresql.ENUM(name="payment_method", create_type=False)
    pk = postgresql.ENUM(name="payment_kind", create_type=False)
    ps = postgresql.ENUM(name="payment_status", create_type=False)
    pos = postgresql.ENUM(name="payout_status", create_type=False)
    ds = postgresql.ENUM(name="dispute_status", create_type=False)

    money = lambda: sa.Numeric(10, 2)  # noqa: E731

    # ---- bookings ----
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("guest_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("host_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("check_in", sa.Date(), nullable=False),
        sa.Column("check_out", sa.Date(), nullable=False),
        sa.Column("nights", sa.Integer(), nullable=False),
        sa.Column("guests_count", sa.Integer(), nullable=False),
        sa.Column("guest_national_id", sa.String(length=14), nullable=True),
        sa.Column("status", bs, server_default=sa.text("'pending_payment'"), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default=sa.text("'EGP'"), nullable=False),
        sa.Column("nightly_price", money(), nullable=False),
        sa.Column("room_subtotal", money(), nullable=False),
        sa.Column("cleaning_fee", money(), server_default=sa.text("0"), nullable=False),
        sa.Column("security_deposit", money(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_amount", money(), nullable=False),
        sa.Column("is_deposit", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("down_payment_percentage", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("amount_due_now", money(), nullable=False),
        sa.Column("amount_paid", money(), server_default=sa.text("0"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancellation_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["guest_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_bookings_property_id", "bookings", ["property_id"])
    op.create_index("ix_bookings_guest_id", "bookings", ["guest_id"])
    op.create_index("ix_bookings_host_id", "bookings", ["host_id"])
    op.create_index("ix_bookings_status", "bookings", ["status"])

    # ---- calendar_days.booking_id (added now that bookings exists) ----
    op.add_column("calendar_days", sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_calendar_days_booking_id", "calendar_days", "bookings", ["booking_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index("ix_calendar_days_booking_id", "calendar_days", ["booking_id"])

    # ---- payments ----
    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("method", pm, nullable=False),
        sa.Column("kind", pk, nullable=False),
        sa.Column("status", ps, nullable=False),
        sa.Column("amount", money(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("receipt_url", sa.String(length=1000), nullable=True),
        sa.Column("sender_reference", sa.String(length=255), nullable=True),
        sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_payments_booking_id", "payments", ["booking_id"])
    op.create_index("ix_payments_status", "payments", ["status"])

    # ---- payouts ----
    op.create_table(
        "payouts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("host_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("gross_amount", money(), nullable=False),
        sa.Column("commission_percentage", sa.Numeric(5, 2), nullable=False),
        sa.Column("commission_amount", money(), nullable=False),
        sa.Column("net_amount", money(), nullable=False),
        sa.Column("status", pos, server_default=sa.text("'pending'"), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("booking_id", name="uq_payouts_booking_id"),
    )
    op.create_index("ix_payouts_booking_id", "payouts", ["booking_id"])
    op.create_index("ix_payouts_host_id", "payouts", ["host_id"])
    op.create_index("ix_payouts_status", "payouts", ["status"])

    # ---- disputes ----
    op.create_table(
        "disputes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("raised_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", ds, server_default=sa.text("'open'"), nullable=False),
        sa.Column("resolution", sa.Text(), nullable=True),
        sa.Column("resolved_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["raised_by"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_by"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_disputes_booking_id", "disputes", ["booking_id"])
    op.create_index("ix_disputes_status", "disputes", ["status"])


def downgrade() -> None:
    op.drop_table("disputes")
    op.drop_table("payouts")
    op.drop_table("payments")

    op.drop_index("ix_calendar_days_booking_id", table_name="calendar_days")
    op.drop_constraint("fk_calendar_days_booking_id", "calendar_days", type_="foreignkey")
    op.drop_column("calendar_days", "booking_id")

    op.drop_table("bookings")

    bind = op.get_bind()
    for name in ("dispute_status", "payout_status", "payment_status", "payment_kind", "payment_method", "booking_status"):
        postgresql.ENUM(name=name).drop(bind, checkfirst=True)
