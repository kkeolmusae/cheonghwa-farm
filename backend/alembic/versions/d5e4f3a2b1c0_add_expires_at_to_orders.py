"""add expires_at to orders

Revision ID: d5e4f3a2b1c0
Revises: c3f1e2d9a4b7
Create Date: 2026-04-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd5e4f3a2b1c0'
down_revision: Union[str, None] = 'c3f1e2d9a4b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'orders',
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('orders', 'expires_at')
