from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site_settings import SiteSettings


async def get_or_create_row(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    row = result.scalar_one_or_none()
    if row is None:
        row = SiteSettings(id=1)
        db.add(row)
        await db.flush()
    return row


async def get_public(db: AsyncSession) -> dict[str, str | None]:
    row = await get_or_create_row(db)
    return {
        "home_hero_image_url": row.home_hero_image_url,
        "home_story_image_url": row.home_story_image_url,
        "shop_hero_texture_url": row.shop_hero_texture_url,
    }


async def apply_patch(db: AsyncSession, updates: dict[str, str | None]) -> SiteSettings:
    row = await get_or_create_row(db)
    for key, value in updates.items():
        setattr(row, key, None if value == "" else value)
    await db.flush()
    return row
