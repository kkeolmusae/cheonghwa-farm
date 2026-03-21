from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.notice import NoticeListResponse, NoticeResponse
from app.services import notice_service

router = APIRouter(prefix="/notices", tags=["공지사항 (공개)"])


@router.get(
    "",
    response_model=PaginatedResponse[NoticeListResponse],
    summary="공지사항 목록 조회",
)
async def list_notices(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[NoticeListResponse]:
    notices, total = await notice_service.list_notices(db, offset=offset, limit=limit)
    items = [NoticeListResponse.model_validate(n) for n in notices]
    return PaginatedResponse(items=items, total=total, offset=offset, limit=limit)


@router.get(
    "/{notice_id}",
    response_model=NoticeResponse,
    summary="공지사항 상세 조회",
)
async def get_notice(
    notice_id: int,
    db: AsyncSession = Depends(get_db),
) -> NoticeResponse:
    notice = await notice_service.get_notice(db, notice_id)
    return NoticeResponse.model_validate(notice)
