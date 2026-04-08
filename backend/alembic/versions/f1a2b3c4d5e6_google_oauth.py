"""google oauth - allowed emails + admin google_id

Revision ID: f1a2b3c4d5e6
Revises: d5e4f3a2b1c0
Create Date: 2026-04-09

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "d5e4f3a2b1c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # admins 테이블: password_hash nullable, google_id 추가
    op.alter_column("admins", "password_hash", existing_type=sa.String(255), nullable=True)
    op.add_column("admins", sa.Column("google_id", sa.String(255), nullable=True))
    op.create_unique_constraint("uq_admins_google_id", "admins", ["google_id"])

    # allowed_google_emails 테이블 생성
    op.create_table(
        "allowed_google_emails",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=False), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_allowed_google_emails_email", "allowed_google_emails", ["email"])

    # 초기 허용 계정 삽입
    op.execute("INSERT INTO allowed_google_emails (email) VALUES ('kim03208@naver.com')")


def downgrade() -> None:
    op.drop_table("allowed_google_emails")
    op.drop_constraint("uq_admins_google_id", "admins", type_="unique")
    op.drop_column("admins", "google_id")
    op.alter_column("admins", "password_hash", existing_type=sa.String(255), nullable=False)
