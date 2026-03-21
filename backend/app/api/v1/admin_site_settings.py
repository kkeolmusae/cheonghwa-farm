from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.schemas.site_settings import SiteSettingsPatch, SiteSettingsPublicResponse
from app.services import site_settings_service

router = APIRouter(
    prefix="/admin/site-settings",
    tags=["관리자 사이트 설정"],
    dependencies=[Depends(get_current_admin)],
)


@router.get(
    "",
    response_model=SiteSettingsPublicResponse,
    summary="사이트 이미지 설정 조회",
)
async def get_site_settings_admin(
    db: AsyncSession = Depends(get_db),
) -> SiteSettingsPublicResponse:
    data = await site_settings_service.get_public(db)
    return SiteSettingsPublicResponse(**data)


@router.patch(
    "",
    response_model=SiteSettingsPublicResponse,
    summary="사이트 이미지 설정 수정",
    description="보낸 필드만 갱신합니다. 빈 문자열이면 해당 이미지를 초기화(기본 시안 사용)합니다.",
)
async def patch_site_settings(
    body: SiteSettingsPatch,
    db: AsyncSession = Depends(get_db),
) -> SiteSettingsPublicResponse:
    raw = body.model_dump(exclude_unset=True)
    updates: dict[str, str | None] = {}
    for k, v in raw.items():
        if v is None:
            updates[k] = None
        elif isinstance(v, str):
            updates[k] = v.strip() if v.strip() else None
    await site_settings_service.apply_patch(db, updates)
    data = await site_settings_service.get_public(db)
    return SiteSettingsPublicResponse(**data)
