from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    customer_phone: Mapped[str] = mapped_column(String(20), index=True)
    customer_address: Mapped[str] = mapped_column(String(500))
    delivery_type: Mapped[str] = mapped_column(String(20))  # "택배" | "직거래"
    delivery_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="pending", server_default="pending", index=True
    )
    # pending / payment_pending / preparing / shipping / delivered / cancelled
    cancel_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    total_amount: Mapped[int] = mapped_column(Integer)  # 상품 금액 합계 (배송비 제외)
    delivery_fee: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[int] = mapped_column(Integer)
    option_id: Mapped[int] = mapped_column(Integer)
    product_name: Mapped[str] = mapped_column(String(255))  # 주문 시점 스냅샷
    option_name: Mapped[str] = mapped_column(String(100))   # 주문 시점 스냅샷
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[int] = mapped_column(Integer)

    order: Mapped["Order"] = relationship(back_populates="items")
