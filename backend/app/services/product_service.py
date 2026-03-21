from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product, ProductImage, ProductOption
from app.schemas.product import (
    ProductCreate,
    ProductStatusUpdate,
    ProductUpdate,
)

# 임포트 추가를 위해 필요한 스키마
from app.schemas.product import ProductImageCreate  # noqa: F401

VALID_STATUSES = {"판매 예정", "판매 중", "품절", "판매 종료"}
MAX_PRODUCT_IMAGES = 21  # 메인 1 + 서브 최대 20


async def list_products(
    db: AsyncSession,
    offset: int = 0,
    limit: int = 20,
    category_id: int | None = None,
    include_all: bool = False,
) -> tuple[list[Product], int]:
    """상품 목록 조회.

    include_all=False (공개): 삭제되지 않은 '판매 중' 상품만 반환.
    include_all=True (관리자): 삭제되지 않은 전체 상품 반환.
    """
    base = select(Product).where(Product.is_deleted.is_(False))
    if not include_all:
        base = base.where(Product.status == "판매 중")
    if category_id:
        base = base.where(Product.category_id == category_id)

    count_result = await db.execute(
        select(func.count()).select_from(base.subquery())
    )
    total = count_result.scalar_one()

    query = (
        base.options(
            selectinload(Product.category),
            selectinload(Product.options),
            selectinload(Product.images),
        )
        .order_by(Product.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    products = list(result.scalars().unique().all())

    return products, total


async def get_product(
    db: AsyncSession, product_id: int, include_deleted: bool = False
) -> Product:
    """상품 상세 조회."""
    query = (
        select(Product)
        .where(Product.id == product_id)
        .options(
            selectinload(Product.category),
            selectinload(Product.options),
            selectinload(Product.images),
        )
    )
    if not include_deleted:
        query = query.where(Product.is_deleted.is_(False))

    result = await db.execute(query)
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="상품을 찾을 수 없습니다.",
        )

    return product


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    """새 상품 등록."""
    if data.status and data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"유효하지 않은 상태입니다. 가능한 값: {VALID_STATUSES}",
        )
    if data.images and len(data.images) > MAX_PRODUCT_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"상품 이미지는 최대 {MAX_PRODUCT_IMAGES}장(메인 1 + 서브 20)까지 등록할 수 있습니다.",
        )

    product = Product(
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        status=data.status,
        harvest_start=data.harvest_start,
        harvest_end=data.harvest_end,
        sale_start=data.sale_start,
        sale_end=data.sale_end,
    )
    db.add(product)
    await db.flush()

    for opt_data in data.options:
        option = ProductOption(
            product_id=product.id,
            name=opt_data.name,
            price=opt_data.price,
            stock_quantity=opt_data.stock_quantity,
            stock_threshold=opt_data.stock_threshold,
            sort_order=opt_data.sort_order,
            is_active=opt_data.is_active,
        )
        db.add(option)

    if data.images:
        for idx, img_data in enumerate(data.images):
            image = ProductImage(
                product_id=product.id,
                image_url=img_data.image_url,
                thumbnail_url=img_data.thumbnail_url,
                sort_order=img_data.sort_order,
                is_primary=idx == 0,
            )
            db.add(image)

    await db.flush()
    return await get_product(db, product.id, include_deleted=True)


async def update_product(
    db: AsyncSession, product_id: int, data: ProductUpdate
) -> Product:
    """상품 수정."""
    product = await get_product(db, product_id, include_deleted=True)

    update_data = data.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"유효하지 않은 상태입니다. 가능한 값: {VALID_STATUSES}",
        )

    options_data = update_data.pop("options", None)
    images_data = update_data.pop("images", None)

    for field, value in update_data.items():
        setattr(product, field, value)

    # 옵션 전체 교체 방식
    if options_data is not None:
        for old_option in product.options:
            await db.delete(old_option)
        await db.flush()

        for opt_data in options_data:
            option = ProductOption(
                product_id=product.id,
                name=opt_data["name"],
                price=opt_data["price"],
                stock_quantity=opt_data.get("stock_quantity", 0),
                stock_threshold=opt_data.get("stock_threshold", 10),
                sort_order=opt_data.get("sort_order", 0),
                is_active=opt_data.get("is_active", True),
            )
            db.add(option)

    if images_data is not None:
        if len(images_data) > MAX_PRODUCT_IMAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"상품 이미지는 최대 {MAX_PRODUCT_IMAGES}장(메인 1 + 서브 20)까지 등록할 수 있습니다.",
            )
        for old_image in product.images:
            await db.delete(old_image)
        await db.flush()

        for idx, img_data in enumerate(images_data):
            image = ProductImage(
                product_id=product.id,
                image_url=img_data["image_url"],
                thumbnail_url=img_data.get("thumbnail_url"),
                sort_order=img_data.get("sort_order", idx),
                is_primary=idx == 0,
            )
            db.add(image)

    await db.flush()
    return await get_product(db, product.id, include_deleted=True)


async def delete_product(db: AsyncSession, product_id: int) -> None:
    """상품 소프트 삭제."""
    product = await get_product(db, product_id, include_deleted=True)
    product.is_deleted = True
    await db.flush()


async def update_product_status(
    db: AsyncSession, product_id: int, data: ProductStatusUpdate
) -> Product:
    """상품 판매 상태 변경."""
    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"유효하지 않은 상태입니다. 가능한 값: {VALID_STATUSES}",
        )

    product = await get_product(db, product_id, include_deleted=True)
    product.status = data.status
    await db.flush()
    return await get_product(db, product.id, include_deleted=True)
