import {
  apiClient,
  type ApiResponse,
  type AuthResponse,
  type RegisterRequest,
  type LoginRequest,
  type User,
} from '@/lib/api-client';
import { API_BASE_URL } from '@/lib/api-client';

class AuthService {
  private readonly BASE_PATH = '/api/v1/auth';
  private readonly USER_PATH = '/api/v1/user';

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        `${this.BASE_PATH}/register`,
        data
      );

      if (response.success && response.data) {
        apiClient.saveTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        });
        this.saveUserToStorage(response.data.user);
        return response.data;
      }
      throw new Error('Registration failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        `${this.BASE_PATH}/login`,
        data
      );

      if (response.success && response.data) {
        apiClient.saveTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        });
        this.saveUserToStorage(response.data.user);
        return response.data;
      }
      throw new Error('Login failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(`${this.BASE_PATH}/logout`, {
          refresh_token: refreshToken,
        });
      }
    } catch {
      // Swallow logout errors to avoid blocking the UX
    } finally {
      apiClient.logout();
      this.clearUserFromStorage();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`${this.USER_PATH}/me`);
      if (response.success && response.data) {
        this.saveUserToStorage(response.data);
        return response.data;
      }
      throw new Error('Failed to fetch user');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  getGitHubAuthUrl(state?: string): { url: string; state: string } {
    const finalState = state || crypto.randomUUID();
    const url = `${apiClientBase()}/api/v1/auth/oauth/github?state=${finalState}`;
    return { url, state: finalState };
  }

  async handleGitHubCallback(code: string, state: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<ApiResponse<AuthResponse>>(
        `${this.BASE_PATH}/oauth/github/callback?code=${code}&state=${state}`
      );
      if (response.success && response.data) {
        apiClient.saveTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        });
        this.saveUserToStorage(response.data.user);
        return response.data;
      }
      throw new Error('GitHub authentication failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  getGoogleAuthUrl(state?: string): { url: string; state: string } {
    const finalState = state || crypto.randomUUID();
    const url = `${apiClientBase()}/api/v1/auth/oauth/google?state=${finalState}`;
    return { url, state: finalState };
  }

  async handleGoogleCallback(code: string, state: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<ApiResponse<AuthResponse>>(
        `${this.BASE_PATH}/oauth/google/callback?code=${code}&state=${state}`
      );
      if (response.success && response.data) {
        apiClient.saveTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        });
        this.saveUserToStorage(response.data.user);
        return response.data;
      }
      throw new Error('Google authentication failed');
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  getUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private saveUserToStorage(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearUserFromStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private handleError(error: any): Error {
    if (error?.response?.data?.error) {
      const apiError = error.response.data.error;
      return new Error(apiError.message || apiError);
    }
    if (error?.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }
}

export const authService = new AuthService();

function apiClientBase(): string {
  return API_BASE_URL.replace(/\/+$/, '');
}
