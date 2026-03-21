import apiClient from './client';
import type { PaginatedResponse } from '@/types/common';
import type { Notice } from '@/types/notice';

export async function fetchNotices(params: {
  offset?: number;
  limit?: number;
}): Promise<PaginatedResponse<Notice>> {
  const { data } = await apiClient.get('/notices', { params });
  return data;
}

export async function fetchNotice(id: number): Promise<Notice> {
  const { data } = await apiClient.get(`/notices/${id}`);
  return data;
}

export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...noticeKeys.lists(), filters] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: number) => [...noticeKeys.details(), id] as const,
};
