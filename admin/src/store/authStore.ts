import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenResponse } from '@/types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: TokenResponse) => void;
  logout: () => void;
  setTokens: (tokens: TokenResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (tokens: TokenResponse) => {
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setTokens: (tokens: TokenResponse) => {
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
      },
    }),
    {
      name: 'farm-admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
