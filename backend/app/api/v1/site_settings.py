from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.site_settings import SiteSettingsPublicResponse
from app.services import site_settings_service

router = APIRouter(prefix="/site-settings", tags=["사이트 설정"])


@router.get(
    "",
    response_model=SiteSettingsPublicResponse,
    summary="공개 사이트 설정 (이미지 URL)",
)
async def get_site_settings_public(
    db: AsyncSession = Depends(get_db),
) -> SiteSettingsPublicResponse:
    data = await site_settings_service.get_public(db)
    return SiteSettingsPublicResponse(**data)
