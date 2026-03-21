from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.category import Category
from app.schemas.product import CategoryResponse

router = APIRouter(prefix="/categories", tags=["카테고리"])


@router.get(
    "",
    response_model=list[CategoryResponse],
    summary="카테고리 목록 조회",
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> list[CategoryResponse]:
    result = await db.execute(select(Category).order_by(Category.sort_order))
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(c) for c in categories]
