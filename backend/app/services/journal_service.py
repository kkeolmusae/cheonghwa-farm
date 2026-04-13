from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.journal import FarmJournal, JournalImage
from app.schemas.journal import JournalCreate, JournalUpdate


async def list_journals(
    db: AsyncSession, offset: int = 0, limit: int = 20
) -> tuple[list[FarmJournal], int]:
    """농장 일지 목록 조회 (최신순)."""
    count_result = await db.execute(select(func.count(FarmJournal.id)))
    total = count_result.scalar_one()

    query = (
        select(FarmJournal)
        .options(selectinload(FarmJournal.images))
        .order_by(FarmJournal.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    journals = list(result.scalars().unique().all())

    return journals, total


async def get_journal(db: AsyncSession, journal_id: int) -> FarmJournal:
    """농장 일지 상세 조회."""
    query = (
        select(FarmJournal)
        .where(FarmJournal.id == journal_id)
        .options(selectinload(FarmJournal.images))
    )
    result = await db.execute(query)
    journal = result.scalar_one_or_none()

    if journal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="농장 일지를 찾을 수 없습니다.",
        )

    return journal


async def create_journal(db: AsyncSession, data: JournalCreate) -> FarmJournal:
    """농장 일지 작성."""
    kwargs = {"title": data.title, "content": data.content}
    if data.created_at is not None:
        kwargs["created_at"] = data.created_at
    journal = FarmJournal(**kwargs)
    db.add(journal)
    await db.flush()

    if data.images:
        for idx, img_data in enumerate(data.images):
            image = JournalImage(
                journal_id=journal.id,
                image_url=img_data.image_url,
                thumbnail_url=img_data.thumbnail_url,
                sort_order=img_data.sort_order,
                is_primary=idx == 0,
            )
            db.add(image)

    await db.flush()
    return await get_journal(db, journal.id)


async def update_journal(
    db: AsyncSession, journal_id: int, data: JournalUpdate
) -> FarmJournal:
    """농장 일지 수정."""
    journal = await get_journal(db, journal_id)
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    images_data = update_data.pop("images", None)

    for field, value in update_data.items():
        setattr(journal, field, value)

    if images_data is not None:
        for old_image in journal.images:
            await db.delete(old_image)
        await db.flush()

        for idx, img_data in enumerate(images_data):
            image = JournalImage(
                journal_id=journal.id,
                image_url=img_data["image_url"],
                thumbnail_url=img_data.get("thumbnail_url"),
                sort_order=img_data.get("sort_order", idx),
                is_primary=idx == 0,
            )
            db.add(image)

    await db.flush()
    return await get_journal(db, journal.id)


async def delete_journal(db: AsyncSession, journal_id: int) -> None:
    """농장 일지 삭제."""
    journal = await get_journal(db, journal_id)
    await db.delete(journal)
    await db.flush()
