"""site_settings singleton table

Revision ID: b8e2a1c0d4f3
Revises: 471bee478bb7
Create Date: 2026-03-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b8e2a1c0d4f3'
down_revision: Union[str, None] = '471bee478bb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'site_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('home_hero_image_url', sa.String(length=2000), nullable=True),
        sa.Column('home_story_image_url', sa.String(length=2000), nullable=True),
        sa.Column('shop_hero_texture_url', sa.String(length=2000), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.execute(sa.text("INSERT INTO site_settings (id) VALUES (1)"))


def downgrade() -> None:
    op.drop_table('site_settings')
