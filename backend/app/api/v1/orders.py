from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service, sms_service

router = APIRouter(prefix="/orders", tags=["주문 (공개)"])


def _build_order_response(order, include_bank_info: bool = False) -> OrderResponse:
    """Order ORM 객체를 OrderResponse로 변환.

    include_bank_info=True이면 bank_account, bank_holder를 설정에서 채워 반환.
    payment_pending 상태이고 입금기한이 남아있을 때만 계좌 정보를 노출한다.
    """
    data = OrderResponse.model_validate(order)
    if include_bank_info:
        data.bank_account = settings.BANK_ACCOUNT
        data.bank_holder = settings.BANK_HOLDER
    return data


@router.post(
    "",
    response_model=OrderResponse,
    status_code=201,
    summary="주문 생성",
    description="비회원 무통장 입금 주문을 생성합니다. 생성 후 관리자에게 SMS 알림이 발송됩니다.",
)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.create_order(db, body)
    # SMS 발송 실패는 주문 처리에 영향 없음
    await sms_service.notify_admin_new_order(order)
    # 주문 생성 직후에는 bank 정보 포함해서 응답 (고객이 미리 확인할 수 있도록)
    return _build_order_response(order, include_bank_info=True)


@router.get(
    "/{order_number}",
    response_model=OrderResponse,
    summary="비회원 주문 조회",
    description="주문번호와 연락처로 본인의 주문을 조회합니다.",
)
async def get_order(
    order_number: str,
    phone: str = Query(..., description="주문 시 입력한 연락처"),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    order = await order_service.get_order_by_number(db, order_number, phone)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="주문을 찾을 수 없습니다. 주문번호와 연락처를 확인해주세요.",
        )
    # payment_pending 상태일 때만 계좌 정보 포함
    include_bank = order.status == "payment_pending"
    return _build_order_response(order, include_bank_info=include_bank)
