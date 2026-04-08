"""알리고(aligo) SMS API 연동 서비스.

SMS 발송 실패는 주문 처리에 영향을 주지 않으므로 모든 함수는
내부적으로 예외를 흡수하고 bool을 반환한다.
"""

import logging

import httpx

from app.core.config import settings
from app.models.order import Order

logger = logging.getLogger(__name__)

ALIGO_API_URL = "https://apis.aligo.in/send/"


async def send_sms(receiver: str, msg: str) -> bool:
    """알리고 API로 SMS 발송.

    Returns:
        True  - 발송 성공 (result_code == "1")
        False - 설정 미비 또는 발송 실패
    """
    if not all([settings.ALIGO_API_KEY, settings.ALIGO_USER_ID, settings.ALIGO_SENDER]):
        logger.warning("SMS 설정이 누락되어 발송을 건너뜁니다.")
        return False

    try:
        payload = {
            "api_key": settings.ALIGO_API_KEY,
            "user_id": settings.ALIGO_USER_ID,
            "sender": settings.ALIGO_SENDER,
            "receiver": receiver,
            "msg": msg,
            "testmode_yn": "N",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(ALIGO_API_URL, data=payload)
            response.raise_for_status()
            result = response.json()
            if str(result.get("result_code")) == "1":
                return True
            logger.warning("알리고 SMS 발송 실패: %s", result)
            return False
    except Exception as exc:
        logger.error("SMS 발송 중 예외 발생: %s", exc)
        return False


async def notify_admin_new_order(order: Order) -> None:
    """관리자(아빠)에게 새 주문 알림."""
    if not settings.ADMIN_PHONE:
        return
    try:
        msg = (
            f"[농장] 새 주문이 접수되었습니다.\n"
            f"주문번호: {order.order_number}\n"
            f"주문자: {order.customer_name}\n"
            f"연락처: {order.customer_phone}\n"
            f"배송방법: {order.delivery_type}\n"
            f"결제금액: {order.total_amount + order.delivery_fee:,}원"
        )
        await send_sms(settings.ADMIN_PHONE, msg)
    except Exception as exc:
        logger.error("관리자 새 주문 알림 실패: %s", exc)


async def notify_customer_payment_pending(order: Order) -> None:
    """고객에게 무통장 입금 계좌 안내 (입금기한 포함)."""
    try:
        total = order.total_amount + order.delivery_fee
        deadline_str = (
            order.expires_at.strftime("%m월 %d일 %H시")
            if order.expires_at is not None
            else "48시간 이내"
        )
        msg = (
            f"[농장] 주문이 확인되었습니다.\n"
            f"주문번호: {order.order_number}\n"
            f"입금계좌: {settings.BANK_ACCOUNT}\n"
            f"예금주: {settings.BANK_HOLDER}\n"
            f"입금금액: {total:,}원\n"
            f"입금기한: {deadline_str}까지\n"
            f"기한 내 미입금 시 자동 취소됩니다."
        )
        await send_sms(order.customer_phone, msg)
    except Exception as exc:
        logger.error("고객 계좌 안내 SMS 실패: %s", exc)


async def notify_customer_preparing(order: Order) -> None:
    """고객에게 배송 준비 중 알림."""
    try:
        msg = (
            f"[농장] 입금이 확인되었습니다.\n"
            f"주문번호: {order.order_number}\n"
            f"고객님의 상품을 정성껏 준비하고 있습니다."
        )
        await send_sms(order.customer_phone, msg)
    except Exception as exc:
        logger.error("고객 배송 준비 중 SMS 실패: %s", exc)


async def notify_customer_shipped(order: Order) -> None:
    """고객에게 배송 시작 + 송장번호 알림."""
    try:
        msg = (
            f"[농장] 상품이 발송되었습니다.\n"
            f"주문번호: {order.order_number}\n"
            f"송장번호: {order.tracking_number}\n"
            f"빠른 시일 내에 도착할 예정입니다. 감사합니다."
        )
        await send_sms(order.customer_phone, msg)
    except Exception as exc:
        logger.error("고객 배송 시작 SMS 실패: %s", exc)


async def notify_customer_cancelled(order: Order) -> None:
    """고객에게 주문 취소 + 사유 알림."""
    try:
        msg = (
            f"[농장] 주문이 취소되었습니다.\n"
            f"주문번호: {order.order_number}\n"
            f"취소사유: {order.cancel_reason}\n"
            f"문의사항은 연락 주세요."
        )
        await send_sms(order.customer_phone, msg)
    except Exception as exc:
        logger.error("고객 취소 SMS 실패: %s", exc)
