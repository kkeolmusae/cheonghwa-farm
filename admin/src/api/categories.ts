import { apiClient } from './client';
import type { Category } from '@/types/product';

export const categoryKeys = {
  all: ['categories'] as const,
  adminAll: ['admin', 'categories'] as const,
};

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
}

export async function adminFetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/admin/categories');
  return response.data;
}

export async function createCategory(data: {
  name: string;
  sort_order: number;
}): Promise<Category> {
  const response = await apiClient.post<Category>('/admin/categories', data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: { name?: string; sort_order?: number },
): Promise<Category> {
  const response = await apiClient.put<Category>(`/admin/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}
