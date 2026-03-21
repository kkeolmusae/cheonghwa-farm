import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/common';
import type {
  Product,
  ProductCreate,
  ProductListItem,
  ProductStatusUpdate,
  ProductUpdate,
} from '@/types/product';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export async function listProducts(params: {
  offset?: number;
  limit?: number;
  category_id?: string;
  status?: string;
}): Promise<PaginatedResponse<ProductListItem>> {
  const response = await apiClient.get<PaginatedResponse<ProductListItem>>(
    '/admin/products',
    { params },
  );
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/admin/products/${id}`);
  return response.data;
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  const response = await apiClient.post<Product>('/admin/products', data);
  return response.data;
}

export async function updateProduct(id: string, data: ProductUpdate): Promise<Product> {
  const response = await apiClient.put<Product>(`/admin/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export async function updateProductStatus(
  id: string,
  data: ProductStatusUpdate,
): Promise<Product> {
  const response = await apiClient.put<Product>(`/admin/products/${id}/status`, data);
  return response.data;
}
