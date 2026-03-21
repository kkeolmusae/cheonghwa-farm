from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductListResponse, ProductResponse
from app.services import product_service

router = APIRouter(prefix="/products", tags=["상품 (공개)"])


@router.get(
    "",
    response_model=PaginatedResponse[ProductListResponse],
    summary="상품 목록 조회",
    description="판매 중인 상품 목록을 조회합니다. 카테고리별 필터링 및 페이지네이션을 지원합니다.",
)
async def list_products(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = Query(None, description="카테고리 ID 필터"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ProductListResponse]:
    products, total = await product_service.list_products(
        db, offset=offset, limit=limit, category_id=category_id
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
    summary="상품 상세 조회",
)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    product = await product_service.get_product(db, product_id)
    return ProductResponse.model_validate(product)
