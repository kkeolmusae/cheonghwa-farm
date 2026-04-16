import re

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.journal import JournalImageResponse, JournalListResponse, JournalResponse
from app.services import journal_service

router = APIRouter(prefix="/journals", tags=["농장 일지 (공개)"])

_IMG_SRC_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)


def _extract_primary_image(content: str) -> JournalImageResponse | None:
    """HTML 콘텐츠에서 첫 번째 <img src> 추출."""
    m = _IMG_SRC_RE.search(content)
    if not m:
        return None
    url = m.group(1)
    return JournalImageResponse(id=0, image_url=url, thumbnail_url=url, is_primary=True, sort_order=0)


@router.get(
    "",
    response_model=PaginatedResponse[JournalListResponse],
    summary="농장 일지 목록 조회",
)
async def list_journals(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[JournalListResponse]:
    journals, total = await journal_service.list_journals(db, offset=offset, limit=limit)

    items = []
    for j in journals:
        # journal_images 테이블 우선, 없으면 HTML 콘텐츠에서 추출
        primary_image = next((img for img in j.images if img.is_primary), None)
        if primary_image is None and j.images:
            primary_image = j.images[0]
        if primary_image is None:
            primary_image = _extract_primary_image(j.content)

        items.append(
            JournalListResponse(
                id=j.id,
                title=j.title,
                primary_image=primary_image,
                created_at=j.created_at,
            )
        )

    return PaginatedResponse(items=items, total=total, offset=offset, limit=limit)


@router.get(
    "/{journal_id}",
    response_model=JournalResponse,
    summary="농장 일지 상세 조회",
)
async def get_journal(
    journal_id: int,
    db: AsyncSession = Depends(get_db),
) -> JournalResponse:
    journal = await journal_service.get_journal(db, journal_id)
    return JournalResponse.model_validate(journal)
