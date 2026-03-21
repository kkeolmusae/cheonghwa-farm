from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.schemas.notice import NoticeCreate, NoticeResponse, NoticeUpdate
from app.services import notice_service

router = APIRouter(
    prefix="/admin/notices",
    tags=["공지사항 관리 (관리자)"],
    dependencies=[Depends(get_current_admin)],
)


@router.post(
    "",
    response_model=NoticeResponse,
    status_code=201,
    summary="공지사항 작성",
)
async def create_notice(
    body: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> NoticeResponse:
    notice = await notice_service.create_notice(db, body)
    return NoticeResponse.model_validate(notice)


@router.put(
    "/{notice_id}",
    response_model=NoticeResponse,
    summary="공지사항 수정",
)
async def update_notice(
    notice_id: int,
    body: NoticeUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> NoticeResponse:
    notice = await notice_service.update_notice(db, notice_id, body)
    return NoticeResponse.model_validate(notice)


@router.delete(
    "/{notice_id}",
    status_code=204,
    summary="공지사항 삭제",
)
async def delete_notice(
    notice_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> None:
    await notice_service.delete_notice(db, notice_id)
