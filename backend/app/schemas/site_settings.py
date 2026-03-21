from typing import Optional

from pydantic import BaseModel, Field


class SiteSettingsPublicResponse(BaseModel):
    """공개 사이트용 (빈 값은 프론트에서 기본 시안 URL로 대체)."""

    home_hero_image_url: Optional[str] = None
    home_story_image_url: Optional[str] = None
    shop_hero_texture_url: Optional[str] = None


class SiteSettingsPatch(BaseModel):
    home_hero_image_url: Optional[str] = Field(None, max_length=2000)
    home_story_image_url: Optional[str] = Field(None, max_length=2000)
    shop_hero_texture_url: Optional[str] = Field(None, max_length=2000)
