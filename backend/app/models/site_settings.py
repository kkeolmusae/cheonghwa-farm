from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SiteSettings(Base):
    """싱글톤 행(id=1). 공개 홈·상품 목록 등에 쓰는 이미지 URL."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    home_hero_image_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    home_story_image_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    shop_hero_texture_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )
