import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/common';
import type { Journal, JournalCreate, JournalListItem, JournalUpdate } from '@/types/journal';

export const journalKeys = {
  all: ['journals'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...journalKeys.lists(), filters] as const,
  details: () => [...journalKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalKeys.details(), id] as const,
};

export async function listJournals(params: {
  offset?: number;
  limit?: number;
}): Promise<PaginatedResponse<JournalListItem>> {
  const response = await apiClient.get<PaginatedResponse<JournalListItem>>('/journals', {
    params,
  });
  return response.data;
}

export async function getJournal(id: string): Promise<Journal> {
  const response = await apiClient.get<Journal>(`/journals/${id}`);
  return response.data;
}

export async function createJournal(data: JournalCreate): Promise<Journal> {
  const response = await apiClient.post<Journal>('/admin/journals', data);
  return response.data;
}

export async function updateJournal(id: string, data: JournalUpdate): Promise<Journal> {
  const response = await apiClient.put<Journal>(`/admin/journals/${id}`, data);
  return response.data;
}

export async function deleteJournal(id: string): Promise<void> {
  await apiClient.delete(`/admin/journals/${id}`);
}
