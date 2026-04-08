export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product_name: string;
  option_name: string;
  quantity: number;
  unit_price: number;
}

/** 관리자 목록 API 응답 (items 없음) */
export interface OrderListItem {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_type: '택배' | '직거래';
  status: OrderStatus;
  cancel_reason?: string;
  tracking_number?: string;
  total_amount: number;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
}

/** 관리자 상세 API 응답 (items 포함) */
export interface Order extends OrderListItem {
  delivery_note?: string;
  items: OrderItem[];
}
