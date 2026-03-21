from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notice import Notice
from app.schemas.notice import NoticeCreate, NoticeUpdate


async def list_notices(
    db: AsyncSession, offset: int = 0, limit: int = 20
) -> tuple[list[Notice], int]:
    """공지사항 목록 조회 (고정 우선, 최신순)."""
    count_result = await db.execute(select(func.count(Notice.id)))
    total = count_result.scalar_one()

    query = (
        select(Notice)
        .order_by(Notice.is_pinned.desc(), Notice.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    notices = list(result.scalars().all())

    return notices, total


async def get_notice(db: AsyncSession, notice_id: int) -> Notice:
    """공지사항 상세 조회."""
    result = await db.execute(select(Notice).where(Notice.id == notice_id))
    notice = result.scalar_one_or_none()

    if notice is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="공지사항을 찾을 수 없습니다.",
        )

    return notice


async def create_notice(db: AsyncSession, data: NoticeCreate) -> Notice:
    """공지사항 작성."""
    notice = Notice(
        title=data.title,
        content=data.content,
        is_pinned=data.is_pinned,
    )
    db.add(notice)
    await db.flush()
    return notice


async def update_notice(
    db: AsyncSession, notice_id: int, data: NoticeUpdate
) -> Notice:
    """공지사항 수정."""
    notice = await get_notice(db, notice_id)
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(notice, field, value)

    await db.flush()
    return notice


async def delete_notice(db: AsyncSession, notice_id: int) -> None:
    """공지사항 삭제."""
    notice = await get_notice(db, notice_id)
    await db.delete(notice)
    await db.flush()
