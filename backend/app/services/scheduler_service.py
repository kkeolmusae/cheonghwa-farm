"""미입금 자동 취소 스케줄러.

APScheduler AsyncIOScheduler를 사용해 매 시간마다 실행된다.
payment_pending 상태에서 expires_at이 지난 주문을 자동 취소하고,
재고를 복구하며 고객에게 취소 SMS를 발송한다.
"""

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.order import Order
from app.services import order_service, sms_service

logger = logging.getLogger(__name__)


async def cancel_expired_orders(session_factory) -> None:
    """payment_pending 상태에서 expires_at이 지난 주문을 자동 취소한다.

    재고 복구와 취소 SMS 발송은 order_service.cancel_order()를 재사용한다.
    SMS 발송 실패는 취소 처리에 영향을 주지 않는다.
    """
    async with session_factory() as session:
        now = datetime.now(timezone.utc)

        result = await session.execute(
            select(Order)
            .where(
                Order.status == "payment_pending",
                Order.expires_at.is_not(None),
                Order.expires_at <= now,
            )
            .options(selectinload(Order.items))
        )
        expired_orders = list(result.scalars().unique().all())

        if not expired_orders:
            return

        logger.info("만료된 주문 %d건 자동 취소 시작", len(expired_orders))

        for order in expired_orders:
            try:
                # cancel_order()가 재고 복구까지 처리하므로 그대로 위임
                cancelled = await order_service.cancel_order(
                    session,
                    order.id,
                    reason="입금 기한 초과 자동 취소",
                )
                # SMS는 silent fail
                await sms_service.notify_customer_cancelled(cancelled)
                logger.info("주문 %s 자동 취소 완료", order.order_number)
            except Exception as exc:
                # 개별 주문 실패가 전체 배치를 막지 않도록 예외를 흡수
                logger.error(
                    "주문 %s 자동 취소 중 오류: %s", order.order_number, exc
                )

        await session.commit()


def create_scheduler(session_factory) -> AsyncIOScheduler:
    """1시간 간격으로 만료 주문 취소 작업을 실행하는 스케줄러를 생성한다."""
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        cancel_expired_orders,
        trigger=IntervalTrigger(hours=1),
        args=[session_factory],
        id="cancel_expired_orders",
        replace_existing=True,
    )
    return scheduler
