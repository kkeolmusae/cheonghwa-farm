import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/common';
import type { Notice, NoticeCreate, NoticeUpdate } from '@/types/notice';

export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...noticeKeys.lists(), filters] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: string) => [...noticeKeys.details(), id] as const,
};

export async function listNotices(params: {
  offset?: number;
  limit?: number;
}): Promise<PaginatedResponse<Notice>> {
  const response = await apiClient.get<PaginatedResponse<Notice>>('/notices', { params });
  return response.data;
}

export async function getNotice(id: string): Promise<Notice> {
  const response = await apiClient.get<Notice>(`/notices/${id}`);
  return response.data;
}

export async function createNotice(data: NoticeCreate): Promise<Notice> {
  const response = await apiClient.post<Notice>('/admin/notices', data);
  return response.data;
}

export async function updateNotice(id: string, data: NoticeUpdate): Promise<Notice> {
  const response = await apiClient.put<Notice>(`/admin/notices/${id}`, data);
  return response.data;
}

export async function deleteNotice(id: string): Promise<void> {
  await apiClient.delete(`/admin/notices/${id}`);
}
