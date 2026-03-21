import { apiClient } from './client';
import type { Category } from '@/types/product';

export const categoryKeys = {
  all: ['categories'] as const,
};

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
}
