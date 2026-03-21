from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.journal import JournalListResponse, JournalResponse
from app.services import journal_service

router = APIRouter(prefix="/journals", tags=["농장 일지 (공개)"])


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
        primary_image = next((img for img in j.images if img.is_primary), None)
        if primary_image is None and j.images:
            primary_image = j.images[0]

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
