import apiClient from './client';
import type { PaginatedResponse } from '@/types/common';
import type { Product, ProductListItem, Category } from '@/types/product';

export async function fetchProducts(params: {
  offset?: number;
  limit?: number;
  category_id?: number;
}): Promise<PaginatedResponse<ProductListItem>> {
  const { data } = await apiClient.get('/products', { params });
  return data;
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get('/categories');
  return data;
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
};
