"""initial auth schema: users + otp_codes

Revision ID: 0001_initial_auth
Revises:
Create Date: 2026-06-20

Hand-written so the PostgreSQL ENUM types and the ARRAY(enum) column are
created in the right order.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_auth"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    user_role = postgresql.ENUM("guest", "host", "admin", name="user_role")
    user_role.create(bind, checkfirst=True)

    otp_purpose = postgresql.ENUM(
        "phone_verification", "password_reset", "login", name="otp_purpose"
    )
    otp_purpose.create(bind, checkfirst=True)

    # Reference the already-created types without re-emitting CREATE TYPE.
    user_role_ref = postgresql.ENUM(name="user_role", create_type=False)
    otp_purpose_ref = postgresql.ENUM(name="otp_purpose", create_type=False)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("phone_number", sa.String(length=20), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("national_id", sa.String(length=14), nullable=True),
        sa.Column(
            "roles",
            postgresql.ARRAY(user_role_ref),
            server_default=sa.text("'{guest}'::user_role[]"),
            nullable=False,
        ),
        sa.Column("is_phone_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_unique_constraint("uq_users_phone_number", "users", ["phone_number"])
    op.create_index("ix_users_phone_number", "users", ["phone_number"])
    op.create_unique_constraint("uq_users_email", "users", ["email"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_unique_constraint("uq_users_national_id", "users", ["national_id"])
    op.create_index("ix_users_national_id", "users", ["national_id"])

    op.create_table(
        "otp_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("purpose", otp_purpose_ref, nullable=False),
        sa.Column("hashed_code", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_otp_codes_user_id", "otp_codes", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_otp_codes_user_id", table_name="otp_codes")
    op.drop_table("otp_codes")

    op.drop_index("ix_users_national_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_phone_number", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    postgresql.ENUM(name="otp_purpose").drop(bind, checkfirst=True)
    postgresql.ENUM(name="user_role").drop(bind, checkfirst=True)
