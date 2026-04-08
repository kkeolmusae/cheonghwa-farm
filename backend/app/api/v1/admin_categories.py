from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.schemas.product import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services import category_service

router = APIRouter(
    prefix="/admin/categories",
    tags=["카테고리 관리 (관리자)"],
    dependencies=[Depends(get_current_admin)],
)


@router.get(
    "",
    response_model=list[CategoryResponse],
    summary="카테고리 목록 조회 (관리자)",
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> list[CategoryResponse]:
    categories = await category_service.list_categories(db)
    return [CategoryResponse.model_validate(c) for c in categories]


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=201,
    summary="카테고리 생성",
)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> CategoryResponse:
    category = await category_service.create_category(db, body)
    return CategoryResponse.model_validate(category)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="카테고리 수정",
)
async def update_category(
    category_id: int,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> CategoryResponse:
    category = await category_service.update_category(db, category_id, body)
    return CategoryResponse.model_validate(category)


@router.delete(
    "/{category_id}",
    status_code=204,
    summary="카테고리 삭제",
)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> None:
    await category_service.delete_category(db, category_id)
