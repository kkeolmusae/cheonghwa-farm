from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.product import Product
from app.schemas.product import CategoryCreate, CategoryUpdate


async def list_categories(db: AsyncSession) -> list[Category]:
    """카테고리 목록 조회 (sort_order 오름차순)."""
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return list(result.scalars().all())


async def get_category(db: AsyncSession, category_id: int) -> Category:
    """카테고리 단건 조회."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="카테고리를 찾을 수 없습니다.",
        )

    return category


async def _check_name_duplicate(
    db: AsyncSession, name: str, exclude_id: int | None = None
) -> None:
    """이름 중복 검사. 중복이면 400 에러."""
    query = select(Category).where(Category.name == name)
    if exclude_id is not None:
        query = query.where(Category.id != exclude_id)

    result = await db.execute(query)
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 카테고리 이름입니다.",
        )


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    """카테고리 생성."""
    await _check_name_duplicate(db, data.name)

    category = Category(name=data.name, sort_order=data.sort_order)
    db.add(category)
    await db.flush()
    return category


async def update_category(
    db: AsyncSession, category_id: int, data: CategoryUpdate
) -> Category:
    """카테고리 수정."""
    category = await get_category(db, category_id)
    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data:
        await _check_name_duplicate(db, update_data["name"], exclude_id=category_id)

    for field, value in update_data.items():
        setattr(category, field, value)

    await db.flush()
    return category


async def delete_category(db: AsyncSession, category_id: int) -> None:
    """카테고리 삭제. 연결된 활성 상품이 있으면 400 에러."""
    category = await get_category(db, category_id)

    linked_result = await db.execute(
        select(Product).where(
            Product.category_id == category_id,
            Product.is_deleted.is_(False),
        )
    )
    if linked_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="해당 카테고리를 사용하는 상품이 있어 삭제할 수 없습니다.",
        )

    await db.delete(category)
    await db.flush()
