import apiClient from './client';
import type { OrderCreate, OrderResponse } from '@/types/order';

export async function createOrder(data: OrderCreate): Promise<OrderResponse> {
  const { data: response } = await apiClient.post('/orders', data);
  return response;
}

export async function getOrderByNumber(
  orderNumber: string,
  phone: string,
): Promise<OrderResponse> {
  const { data } = await apiClient.get(`/orders/${orderNumber}`, {
    params: { phone },
  });
  return data;
}

export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderNumber: string, phone: string) =>
    [...orderKeys.all, 'detail', orderNumber, phone] as const,
};
