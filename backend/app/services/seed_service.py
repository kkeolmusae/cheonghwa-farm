import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.admin import Admin
from app.models.category import Category

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = [
    {"name": "과일", "sort_order": 1},
    {"name": "채소", "sort_order": 2},
    {"name": "곡물", "sort_order": 3},
    {"name": "가공식품", "sort_order": 4},
    {"name": "기타", "sort_order": 5},
]


async def seed_admin(db: AsyncSession) -> None:
    """기본 관리자 계정이 없으면 생성."""
    result = await db.execute(
        select(Admin).where(Admin.email == settings.ADMIN_EMAIL)
    )
    if result.scalar_one_or_none() is not None:
        logger.info("기본 관리자 계정이 이미 존재합니다.")
        return

    admin = Admin(
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        name=settings.ADMIN_NAME,
    )
    db.add(admin)
    await db.commit()
    logger.info("기본 관리자 계정이 생성되었습니다: %s", settings.ADMIN_EMAIL)


async def seed_categories(db: AsyncSession) -> None:
    """기본 카테고리가 없으면 생성."""
    result = await db.execute(select(Category))
    if result.scalars().first() is not None:
        logger.info("카테고리가 이미 존재합니다.")
        return

    for cat_data in DEFAULT_CATEGORIES:
        category = Category(**cat_data)
        db.add(category)

    await db.commit()
    logger.info("기본 카테고리 %d개가 생성되었습니다.", len(DEFAULT_CATEGORIES))
