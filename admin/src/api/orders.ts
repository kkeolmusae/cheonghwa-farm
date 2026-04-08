import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/common';
import type { Order, OrderListItem, OrderStatus } from '@/types/order';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

export async function getOrders(params: {
  status?: OrderStatus;
  offset?: number;
  limit?: number;
}): Promise<PaginatedResponse<OrderListItem>> {
  const response = await apiClient.get<PaginatedResponse<OrderListItem>>('/admin/orders', { params });
  return response.data;
}

export async function getOrder(id: number): Promise<Order> {
  const response = await apiClient.get<Order>(`/admin/orders/${id}`);
  return response.data;
}

export async function acceptOrder(id: number): Promise<Order> {
  const response = await apiClient.post<Order>(`/admin/orders/${id}/accept`);
  return response.data;
}

export async function harvestOrder(id: number): Promise<Order> {
  const response = await apiClient.post<Order>(`/admin/orders/${id}/harvest`);
  return response.data;
}

export async function shipOrder(id: number, tracking_number: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/admin/orders/${id}/ship`, { tracking_number });
  return response.data;
}

export async function completeOrder(id: number): Promise<Order> {
  const response = await apiClient.post<Order>(`/admin/orders/${id}/complete`);
  return response.data;
}

export async function cancelOrder(id: number, cancel_reason: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/admin/orders/${id}/cancel`, { cancel_reason });
  return response.data;
}
