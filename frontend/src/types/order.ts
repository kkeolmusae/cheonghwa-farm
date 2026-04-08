export type DeliveryType = '택배' | '직거래';

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderItemCreate {
  product_id: number;
  option_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_type: DeliveryType;
  delivery_note?: string;
  items: OrderItemCreate[];
}

export interface OrderItemResponse {
  id: number;
  product_name: string;
  option_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderResponse {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_type: DeliveryType;
  delivery_note?: string;
  status: OrderStatus;
  cancel_reason?: string;
  tracking_number?: string;
  total_amount: number;
  delivery_fee: number;
  items: OrderItemResponse[];
  created_at: string;
  // 주문 생성 응답에 포함되는 입금 안내 정보
  bank_account?: string;
  bank_holder?: string;
  expires_at?: string;
}
