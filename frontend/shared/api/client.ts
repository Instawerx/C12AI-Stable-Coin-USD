import {
  ApiResponse,
  User,
  DaoMembership,
  Badge,
  UserBadge,
  MintReceipt,
  RedeemReceipt,
  Notification,
  AuthSession,
  LoginRequest,
  PaginationParams,
  DashboardStats,
  TransactionStats,
} from '../types';

/**
 * API Client for C12USD Backend
 *
 * Type-safe client for interacting with the backend API
 * Supports authentication, error handling, and request/response transformation
 */
class ApiClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  // Authentication
  private getStoredToken(): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || undefined;
    }
    return undefined;
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
    this.token = token;
  }

  private removeStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    this.token = undefined;
  }

  // HTTP Methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication endpoints
  async login(request: LoginRequest): Promise<ApiResponse<AuthSession>> {
    const response = await this.post<AuthSession>('/auth/login', request);

    if (response.success && response.data) {
      this.setStoredToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>('/auth/logout');
    this.removeStoredToken();
    return response;
  }

  async refreshToken(): Promise<ApiResponse<AuthSession>> {
    const response = await this.post<AuthSession>('/auth/refresh');

    if (response.success && response.data) {
      this.setStoredToken(response.data.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<User>('/auth/profile', data);
  }

  // User endpoints
  async getUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get<User[]>(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/users/${id}`);
  }

  // DAO Membership endpoints
  async joinDao(): Promise<ApiResponse<DaoMembership>> {
    return this.post<DaoMembership>('/dao/join');
  }

  async getDaoMembership(userId?: string): Promise<ApiResponse<DaoMembership>> {
    const endpoint = userId ? `/dao/members/${userId}` : '/dao/membership';
    return this.get<DaoMembership>(endpoint);
  }

  async updateMembershipTier(
    userId: string,
    tier: string
  ): Promise<ApiResponse<DaoMembership>> {
    return this.put<DaoMembership>(`/dao/members/${userId}/tier`, { tier });
  }

  async getDaoMembers(params?: PaginationParams): Promise<ApiResponse<DaoMembership[]>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get<DaoMembership[]>(`/dao/members${queryString ? `?${queryString}` : ''}`);
  }

  // Badge endpoints
  async getBadges(params?: PaginationParams): Promise<ApiResponse<Badge[]>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get<Badge[]>(`/badges${queryString ? `?${queryString}` : ''}`);
  }

  async createBadge(data: Partial<Badge>): Promise<ApiResponse<Badge>> {
    return this.post<Badge>('/badges', data);
  }

  async updateBadge(id: string, data: Partial<Badge>): Promise<ApiResponse<Badge>> {
    return this.put<Badge>(`/badges/${id}`, data);
  }

  async getUserBadges(userId?: string): Promise<ApiResponse<UserBadge[]>> {
    const endpoint = userId ? `/users/${userId}/badges` : '/user/badges';
    return this.get<UserBadge[]>(endpoint);
  }

  async awardBadge(userId: string, badgeId: string): Promise<ApiResponse<UserBadge>> {
    return this.post<UserBadge>(`/users/${userId}/badges/${badgeId}`);
  }

  // Transaction endpoints
  async getMintReceipts(params?: PaginationParams): Promise<ApiResponse<MintReceipt[]>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get<MintReceipt[]>(`/mint${queryString ? `?${queryString}` : ''}`);
  }

  async getRedeemReceipts(params?: PaginationParams): Promise<ApiResponse<RedeemReceipt[]>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get<RedeemReceipt[]>(`/redeem${queryString ? `?${queryString}` : ''}`);
  }

  async createMintRequest(data: {
    amount: string;
    chain: string;
    paymentMethod: string;
  }): Promise<ApiResponse<MintReceipt>> {
    return this.post<MintReceipt>('/mint', data);
  }

  async createRedeemRequest(data: {
    tokenAmount: string;
    chain: string;
    paymentMethod: string;
    paymentAddress: string;
  }): Promise<ApiResponse<RedeemReceipt>> {
    return this.post<RedeemReceipt>('/redeem', data);
  }

  // Notification endpoints
  async getNotifications(params?: PaginationParams): Promise<ApiResponse<Notification[]>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.get<Notification[]>(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.put<void>(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.put<void>('/notifications/read-all');
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>('/dashboard/stats');
  }

  async getTransactionStats(period: 'daily' | 'weekly' | 'monthly'): Promise<ApiResponse<TransactionStats>> {
    return this.get<TransactionStats>(`/dashboard/transactions?period=${period}`);
  }

  // Health endpoint
  async getHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for custom instances
export { ApiClient };
export default apiClient;