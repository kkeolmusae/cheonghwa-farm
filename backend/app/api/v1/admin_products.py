from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import Admin
from app.schemas.common import PaginatedResponse
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductStatusUpdate,
    ProductUpdate,
)
from app.services import product_service

router = APIRouter(
    prefix="/admin/products",
    tags=["상품 관리 (관리자)"],
    dependencies=[Depends(get_current_admin)],
)


@router.get(
    "",
    response_model=PaginatedResponse[ProductListResponse],
    summary="상품 목록 조회 (관리자)",
    description="삭제되지 않은 전체 상품을 조회합니다 (모든 상태 포함).",
)
async def list_products_admin(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ProductListResponse]:
    products, total = await product_service.list_products(
        db, offset=offset, limit=limit, category_id=category_id, include_all=True
    )

    items = []
    for p in products:
        primary_image = next((img for img in p.images if img.is_primary), None)
        if primary_image is None and p.images:
            primary_image = p.images[0]
        items.append(
            ProductListResponse(
                id=p.id,
                category_id=p.category_id,
                category=p.category,
                name=p.name,
                status=p.status,
                harvest_start=p.harvest_start,
                harvest_end=p.harvest_end,
                options=p.options,
                primary_image=primary_image,
                created_at=p.created_at,
            )
        )

    return PaginatedResponse(items=items, total=total, offset=offset, limit=limit)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="상품 상세 조회 (관리자)",
)
async def get_product_admin(
    product_id: int,
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    product = await product_service.get_product(db, product_id, include_deleted=True)
    return ProductResponse.model_validate(product)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=201,
    summary="상품 등록",
)
async def create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> ProductResponse:
    product = await product_service.create_product(db, body)
    return ProductResponse.model_validate(product)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="상품 수정",
)
async def update_product(
    product_id: int,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> ProductResponse:
    product = await product_service.update_product(db, product_id, body)
    return ProductResponse.model_validate(product)


@router.delete(
    "/{product_id}",
    status_code=204,
    summary="상품 삭제 (소프트 삭제)",
)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> None:
    await product_service.delete_product(db, product_id)


@router.put(
    "/{product_id}/status",
    response_model=ProductResponse,
    summary="상품 판매 상태 변경",
)
async def update_product_status(
    product_id: int,
    body: ProductStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: Admin = Depends(get_current_admin),
) -> ProductResponse:
    product = await product_service.update_product_status(db, product_id, body)
    return ProductResponse.model_validate(product)
