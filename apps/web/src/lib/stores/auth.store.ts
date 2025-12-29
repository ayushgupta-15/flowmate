import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/lib/services/auth.service';
import type { User, RegisterRequest, LoginRequest } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  githubLogin: () => Promise<void>;
  googleLogin: () => Promise<void>;
  handleOAuthCallback: (
    provider: 'github' | 'google',
    code: string,
    state: string
  ) => Promise<void>;
  markAuthenticated: () => void;
  clearError: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        register: async (data: RegisterRequest) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.register(data);
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Registration failed',
            });
            throw error;
          }
        },

        login: async (data: LoginRequest) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(data);
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Login failed',
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true, error: null });
          try {
            await authService.logout();
            set({
              ...initialState,
              isLoading: false,
            });
          } catch (error: any) {
            // Even if logout fails, clear local state
            set({
              ...initialState,
              isLoading: false,
            });
          }
        },

        fetchUser: async () => {
          if (!authService.isAuthenticated()) {
            set({ ...initialState });
            return;
          }

          set({ isLoading: true, error: null });
          try {
            const user = await authService.getCurrentUser();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              ...initialState,
              isLoading: false,
              error: error.message || 'Failed to fetch user',
            });
          }
        },

        githubLogin: async () => {
          set({ isLoading: true, error: null });
          try {
            const { url, state } = authService.getGitHubAuthUrl();
            sessionStorage.setItem('oauth_state', state);
            sessionStorage.setItem('oauth_provider', 'github');
            window.location.href = url;
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'GitHub login failed',
            });
            throw error;
          }
        },

        googleLogin: async () => {
          set({ isLoading: true, error: null });
          try {
            const { url, state } = authService.getGoogleAuthUrl();
            sessionStorage.setItem('oauth_state', state);
            sessionStorage.setItem('oauth_provider', 'google');
            window.location.href = url;
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Google login failed',
            });
            throw error;
          }
        },

        handleOAuthCallback: async (provider, code, state) => {
          set({ isLoading: true, error: null });
          try {
            const storedState = sessionStorage.getItem('oauth_state');
            const storedProvider = sessionStorage.getItem('oauth_provider');

            if (storedState !== state || storedProvider !== provider) {
              throw new Error('Invalid OAuth state');
            }

            const response =
              provider === 'github'
                ? await authService.handleGitHubCallback(code, state)
                : await authService.handleGoogleCallback(code, state);

            sessionStorage.removeItem('oauth_state');
            sessionStorage.removeItem('oauth_provider');

            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            sessionStorage.removeItem('oauth_state');
            sessionStorage.removeItem('oauth_provider');
            set({
              isLoading: false,
              error: error.message || 'OAuth authentication failed',
            });
            throw error;
          }
        },

        markAuthenticated: () => {
          set({ isAuthenticated: true });
        },

        clearError: () => set({ error: null }),
        reset: () => set({ ...initialState }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors to avoid re-renders
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
