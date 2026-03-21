import { apiClient } from './client';
import type { LoginRequest, TokenResponse } from '@/types/auth';

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/admin/login', data);
  return response.data;
}

export async function refreshToken(token: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/refresh', {
    refresh_token: token,
  });
  return response.data;
}
