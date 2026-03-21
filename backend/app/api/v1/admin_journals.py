from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.schemas.journal import JournalCreate, JournalResponse, JournalUpdate
from app.services import journal_service

router = APIRouter(
    prefix="/admin/journals",
    tags=["농장 일지 관리 (관리자)"],
    dependencies=[Depends(get_current_admin)],
)


@router.post(
    "",
    response_model=JournalResponse,
    status_code=201,
    summary="농장 일지 작성",
)
async def create_journal(
    body: JournalCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> JournalResponse:
    journal = await journal_service.create_journal(db, body)
    return JournalResponse.model_validate(journal)


@router.put(
    "/{journal_id}",
    response_model=JournalResponse,
    summary="농장 일지 수정",
)
async def update_journal(
    journal_id: int,
    body: JournalUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> JournalResponse:
    journal = await journal_service.update_journal(db, journal_id, body)
    return JournalResponse.model_validate(journal)


@router.delete(
    "/{journal_id}",
    status_code=204,
    summary="농장 일지 삭제",
)
async def delete_journal(
    journal_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> None:
    await journal_service.delete_journal(db, journal_id)
