from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.schemas.common import PaginatedResponse
from app.schemas.order import (
    AdminOrderListItem,
    CancelOrderRequest,
    OrderResponse,
    ShipOrderRequest,
)
from app.services import order_service, sms_service

router = APIRouter(
    prefix="/admin/orders",
    tags=["주문 관리 (관리자)"],
    dependencies=[Depends(get_current_admin)],
)


@router.get(
    "",
    response_model=PaginatedResponse[AdminOrderListItem],
    summary="주문 목록 조회 (관리자)",
    description="전체 주문 목록을 조회합니다. status 파라미터로 필터링 가능합니다.",
)
async def list_orders_admin(
    status: Optional[str] = Query(None, description="주문 상태 필터"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[AdminOrderListItem]:
    orders, total = await order_service.get_orders_admin(
        db, status_filter=status, offset=offset, limit=limit
    )
    items = [AdminOrderListItem.model_validate(o) for o in orders]
    return PaginatedResponse(items=items, total=total, offset=offset, limit=limit)


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="주문 상세 조회 (관리자)",
)
async def get_order_admin(
    order_id: int,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.get_order_by_id_admin(db, order_id)
    return OrderResponse.model_validate(order)


@router.post(
    "/{order_id}/accept",
    response_model=OrderResponse,
    summary="주문 수락",
    description="pending → payment_pending. 재고를 차감하고 고객에게 입금 계좌를 안내합니다.",
)
async def accept_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.accept_order(db, order_id)
    await sms_service.notify_customer_payment_pending(order)
    return OrderResponse.model_validate(order)


@router.post(
    "/{order_id}/harvest",
    response_model=OrderResponse,
    summary="수확 완료",
    description="payment_pending → preparing. 고객에게 배송 준비 중 알림을 보냅니다.",
)
async def harvest_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.harvest_order(db, order_id)
    await sms_service.notify_customer_preparing(order)
    return OrderResponse.model_validate(order)


@router.post(
    "/{order_id}/ship",
    response_model=OrderResponse,
    summary="배송 시작",
    description="preparing → shipping. 송장번호를 등록하고 고객에게 배송 시작 알림을 보냅니다.",
)
async def ship_order(
    order_id: int,
    body: ShipOrderRequest,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.ship_order(db, order_id, body.tracking_number)
    await sms_service.notify_customer_shipped(order)
    return OrderResponse.model_validate(order)


@router.post(
    "/{order_id}/complete",
    response_model=OrderResponse,
    summary="배송 완료",
    description="shipping → delivered.",
)
async def complete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.complete_order(db, order_id)
    return OrderResponse.model_validate(order)


@router.post(
    "/{order_id}/cancel",
    response_model=OrderResponse,
    summary="주문 취소",
    description=(
        "pending/payment_pending → cancelled. "
        "payment_pending 이후 취소 시 재고를 복구합니다. "
        "고객에게 취소 SMS를 발송합니다."
    ),
)
async def cancel_order(
    order_id: int,
    body: CancelOrderRequest,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.cancel_order(db, order_id, body.cancel_reason)
    await sms_service.notify_customer_cancelled(order)
    return OrderResponse.model_validate(order)
