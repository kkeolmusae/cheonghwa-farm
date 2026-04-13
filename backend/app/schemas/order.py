from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- 주문 아이템 ---

class OrderItemCreate(BaseModel):
    product_id: int
    option_id: int
    quantity: int = Field(ge=1)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    option_id: int
    product_name: str
    option_name: str
    quantity: int
    unit_price: int

    model_config = {"from_attributes": True}


# --- 주문 생성 ---

class OrderCreate(BaseModel):
    customer_name: str = Field(max_length=100)
    customer_phone: str = Field(max_length=20)
    customer_address: str = Field(max_length=500)
    delivery_type: str = Field(description="택배 | 직거래")
    delivery_note: Optional[str] = None
    items: list[OrderItemCreate] = Field(min_length=1)


# --- 주문 응답 ---

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: str
    delivery_type: str
    delivery_note: Optional[str] = None
    status: str
    cancel_reason: Optional[str] = None
    tracking_number: Optional[str] = None
    total_amount: int
    delivery_fee: int
    expires_at: Optional[datetime] = None
    bank_account: Optional[str] = None
    bank_holder: Optional[str] = None
    items: list[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusResponse(BaseModel):
    """간단 상태 조회용."""
    order_number: str
    status: str

    model_config = {"from_attributes": True}


class AdminOrderListItem(BaseModel):
    """관리자 목록용 (items 없이)."""
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: str
    delivery_type: str
    status: str
    cancel_reason: Optional[str] = None
    tracking_number: Optional[str] = None
    total_amount: int
    delivery_fee: int
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- 상태 전환 요청 ---

class ShipOrderRequest(BaseModel):
    tracking_number: str = Field(min_length=1, max_length=100)


class CancelOrderRequest(BaseModel):
    cancel_reason: str = Field(min_length=1, max_length=500)
