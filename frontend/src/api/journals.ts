import apiClient from './client';
import type { PaginatedResponse } from '@/types/common';
import type { Journal, JournalListItem } from '@/types/journal';

export async function fetchJournals(params: {
  offset?: number;
  limit?: number;
}): Promise<PaginatedResponse<JournalListItem>> {
  const { data } = await apiClient.get('/journals', { params });
  return data;
}

export async function fetchJournal(id: number): Promise<Journal> {
  const { data } = await apiClient.get(`/journals/${id}`);
  return data;
}

export const journalKeys = {
  all: ['journals'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...journalKeys.lists(), filters] as const,
  details: () => [...journalKeys.all, 'detail'] as const,
  detail: (id: number) => [...journalKeys.details(), id] as const,
};
