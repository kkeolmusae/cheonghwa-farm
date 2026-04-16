import secrets
import string
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductOption
from app.schemas.order import OrderCreate

# 무료 배송 기준 금액
FREE_DELIVERY_THRESHOLD = 30_000
# 기본 배송비
DEFAULT_DELIVERY_FEE = 3_000

# 제주 / 도서산간 판별 키워드
JEJU_KEYWORDS = ["제주특별자치도", "제주도", "제주시", "서귀포시", "서귀포"]
REMOTE_KEYWORDS = ["울릉군", "울릉도", "독도", "옹진군"]


def get_extra_delivery_fee(address: str) -> int:
    """주소 문자열로 제주/도서산간 추가 배송비를 반환한다."""
    for keyword in JEJU_KEYWORDS:
        if keyword in address:
            return settings.JEJU_ADDITIONAL_FEE
    for keyword in REMOTE_KEYWORDS:
        if keyword in address:
            return settings.REMOTE_AREA_ADDITIONAL_FEE
    return 0

# 상태 전환 허용 맵: 현재 상태 → 전환 가능한 다음 상태
VALID_TRANSITIONS: dict[str, str] = {
    "pending": "payment_pending",
    "payment_pending": "preparing",
    "preparing": "shipping",
    "shipping": "delivered",
}

CANCELLABLE_STATUSES = {"pending", "payment_pending"}
# payment_pending 이후 취소 시 재고 복구 필요한 상태
STOCK_RESTORED_STATUSES = {"payment_pending", "preparing", "shipping"}


def _generate_order_number() -> str:
    """8자리 알파벳(대문자)+숫자 랜덤 주문번호 생성."""
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(8))


async def _get_order_with_items(db: AsyncSession, order_id: int) -> Order:
    """ID로 주문 조회 (items eager load). 없으면 404."""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="주문을 찾을 수 없습니다.",
        )
    return order


async def create_order(db: AsyncSession, order_data: OrderCreate) -> Order:
    """주문 생성.

    - 각 OrderItem의 product_name/option_name은 ProductOption 조회 후 스냅샷으로 저장
    - total_amount = 각 아이템 (unit_price × quantity) 합계
    - delivery_fee: 직거래=0, 택배=total_amount>=30000이면 0 아니면 3000
    """
    # 주문번호 중복 없이 생성
    for _ in range(10):
        order_number = _generate_order_number()
        existing = await db.execute(
            select(Order).where(Order.order_number == order_number)
        )
        if existing.scalar_one_or_none() is None:
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="주문번호 생성에 실패했습니다. 다시 시도해주세요.",
        )

    # 아이템 유효성 검증 및 스냅샷 수집
    order_items: list[OrderItem] = []
    total_amount = 0

    for item_data in order_data.items:
        # ProductOption + Product 함께 로드
        result = await db.execute(
            select(ProductOption)
            .where(ProductOption.id == item_data.option_id)
            .options(selectinload(ProductOption.product))
        )
        option = result.scalar_one_or_none()

        if option is None or option.product_id != item_data.product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"옵션 ID {item_data.option_id}을(를) 찾을 수 없습니다.",
            )
        if not option.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{option.product.name} - {option.name}' 옵션은 현재 구매할 수 없습니다.",
            )
        if option.product.is_deleted or option.product.status not in {"판매 중"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{option.product.name}' 상품은 현재 판매 중이 아닙니다.",
            )

        line_price = option.price * item_data.quantity
        total_amount += line_price

        order_items.append(
            OrderItem(
                product_id=item_data.product_id,
                option_id=item_data.option_id,
                product_name=option.product.name,
                option_name=option.name,
                quantity=item_data.quantity,
                unit_price=option.price,
            )
        )

    # 배송비 계산
    if order_data.delivery_type == "직거래":
        delivery_fee = 0
    else:
        base_delivery_fee = 0 if total_amount >= FREE_DELIVERY_THRESHOLD else DEFAULT_DELIVERY_FEE
        extra_fee = get_extra_delivery_fee(order_data.customer_address)
        delivery_fee = base_delivery_fee + extra_fee

    order = Order(
        order_number=order_number,
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        customer_address=order_data.customer_address,
        delivery_type=order_data.delivery_type,
        delivery_note=order_data.delivery_note,
        status="pending",
        total_amount=total_amount,
        delivery_fee=delivery_fee,
    )
    db.add(order)
    await db.flush()

    for item in order_items:
        item.order_id = order.id
        db.add(item)

    await db.flush()
    return await _get_order_with_items(db, order.id)


async def get_order_by_number(
    db: AsyncSession, order_number: str, phone: str
) -> Order | None:
    """주문번호 + 연락처로 비회원 주문 조회."""
    result = await db.execute(
        select(Order)
        .where(Order.order_number == order_number, Order.customer_phone == phone)
        .options(selectinload(Order.items))
    )
    return result.scalar_one_or_none()


async def get_orders_admin(
    db: AsyncSession,
    status_filter: str | None,
    offset: int,
    limit: int,
) -> tuple[list[Order], int]:
    """관리자 주문 목록 조회."""
    from sqlalchemy import func

    base = select(Order)
    if status_filter:
        base = base.where(Order.status == status_filter)

    count_result = await db.execute(
        select(func.count()).select_from(base.subquery())
    )
    total = count_result.scalar_one()

    query = (
        base.options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    orders = list(result.scalars().unique().all())
    return orders, total


async def get_order_by_id_admin(db: AsyncSession, order_id: int) -> Order:
    """관리자용 주문 상세 조회."""
    return await _get_order_with_items(db, order_id)


async def accept_order(db: AsyncSession, order_id: int) -> Order:
    """주문 수락: pending → payment_pending + 재고 차감."""
    order = await _get_order_with_items(db, order_id)

    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"수락할 수 없는 상태입니다. 현재 상태: {order.status}",
        )

    # 재고 차감
    for item in order.items:
        result = await db.execute(
            select(ProductOption).where(ProductOption.id == item.option_id)
        )
        option = result.scalar_one_or_none()
        if option is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"옵션 ID {item.option_id}을(를) 찾을 수 없습니다.",
            )

        new_stock = max(0, option.stock_quantity - item.quantity)
        option.stock_quantity = new_stock

        # 재고 0이면 상품 상태를 '품절'로 변경
        if new_stock == 0:
            product_result = await db.execute(
                select(Product).where(Product.id == option.product_id)
            )
            product = product_result.scalar_one_or_none()
            if product and product.status == "판매 중":
                # 해당 상품의 모든 옵션이 품절인지 확인
                all_options_result = await db.execute(
                    select(ProductOption).where(
                        ProductOption.product_id == option.product_id,
                        ProductOption.is_active.is_(True),
                    )
                )
                all_options = list(all_options_result.scalars().all())
                # 방금 차감한 option 포함하여 재고 확인 (flush 전이므로 직접 비교)
                all_sold_out = all(
                    (opt.stock_quantity == 0 if opt.id != option.id else new_stock == 0)
                    for opt in all_options
                )
                if all_sold_out:
                    product.status = "품절"

    order.status = "payment_pending"
    order.expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.PAYMENT_DEADLINE_HOURS)
    await db.flush()
    return await _get_order_with_items(db, order.id)


async def harvest_order(db: AsyncSession, order_id: int) -> Order:
    """수확 완료: payment_pending → preparing."""
    order = await _get_order_with_items(db, order_id)

    if order.status != "payment_pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"수확 처리할 수 없는 상태입니다. 현재 상태: {order.status}",
        )

    order.status = "preparing"
    await db.flush()
    return await _get_order_with_items(db, order.id)


async def ship_order(
    db: AsyncSession, order_id: int, tracking_number: str
) -> Order:
    """배송 시작: preparing → shipping."""
    order = await _get_order_with_items(db, order_id)

    if order.status != "preparing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"배송 처리할 수 없는 상태입니다. 현재 상태: {order.status}",
        )

    order.status = "shipping"
    order.tracking_number = tracking_number
    await db.flush()
    return await _get_order_with_items(db, order.id)


async def complete_order(db: AsyncSession, order_id: int) -> Order:
    """배송 완료: shipping → delivered."""
    order = await _get_order_with_items(db, order_id)

    if order.status != "shipping":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"배송 완료 처리할 수 없는 상태입니다. 현재 상태: {order.status}",
        )

    order.status = "delivered"
    await db.flush()
    return await _get_order_with_items(db, order.id)


async def cancel_order(
    db: AsyncSession, order_id: int, reason: str
) -> Order:
    """주문 취소: pending/payment_pending → cancelled.

    payment_pending 이후 취소는 재고를 복구한다.
    """
    order = await _get_order_with_items(db, order_id)

    if order.status not in CANCELLABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"취소할 수 없는 상태입니다. 현재 상태: {order.status}",
        )

    # payment_pending 상태에서 취소하면 이미 차감된 재고를 복구
    if order.status == "payment_pending":
        for item in order.items:
            result = await db.execute(
                select(ProductOption).where(ProductOption.id == item.option_id)
            )
            option = result.scalar_one_or_none()
            if option is not None:
                option.stock_quantity += item.quantity

                # 재고 복구 후 품절 상태였던 상품을 '판매 중'으로 되돌림
                product_result = await db.execute(
                    select(Product).where(Product.id == option.product_id)
                )
                product = product_result.scalar_one_or_none()
                if product and product.status == "품절":
                    product.status = "판매 중"

    order.status = "cancelled"
    order.cancel_reason = reason
    await db.flush()
    return await _get_order_with_items(db, order.id)
