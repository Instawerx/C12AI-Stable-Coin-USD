import type {
  User,
  DaoMembership,
  Badge,
  UserBadge,
  MintReceipt,
  RedeemReceipt,
  Notification,
  DashboardStats,
  TransactionStats,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
  HealthStatus,
} from './types';

// Mock API client for development
// Replace with actual API calls in production
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // For now, return mock data to prevent errors
    // Replace with actual fetch calls in production
    console.log(`Mock API call: ${endpoint}`, options);

    // Return mock data based on endpoint
    return this.getMockData(endpoint) as T;
  }

  private getMockData(endpoint: string): any {
    // Mock data to prevent runtime errors
    if (endpoint.includes('profile')) {
      return {
        id: '1',
        email: 'user@example.com',
        displayName: 'Test User',
        avatar: null,
        walletAddress: '0x1234...5678',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (endpoint.includes('dao-membership')) {
      return {
        id: '1',
        userId: '1',
        membershipTier: 'bronze',
        joinedAt: new Date().toISOString(),
        reputation: 100,
        votingPower: 1,
        isActive: true,
      };
    }

    if (endpoint.includes('dashboard-stats')) {
      return {
        totalBalance: '1000.00',
        totalBalanceUSD: '1000.00',
        totalMinted: '5000.00',
        totalMintedUSD: '5000.00',
        totalRedeemed: '4000.00',
        totalRedeemedUSD: '4000.00',
        totalFees: '50.00',
        totalFeesUSD: '50.00',
        pendingTransactions: 2,
        badgeCount: 5,
      };
    }

    if (endpoint.includes('badges')) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }

    if (endpoint.includes('notifications')) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }

    if (endpoint.includes('health')) {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok',
          blockchain: 'ok',
          cache: 'ok',
        }
      };
    }

    // Default empty response
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }

  // User endpoints
  async getProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // DAO endpoints
  async getDaoMembership(userId?: string): Promise<DaoMembership | null> {
    return this.request<DaoMembership | null>(`/dao/membership${userId ? `?userId=${userId}` : ''}`);
  }

  async joinDao(): Promise<DaoMembership> {
    return this.request<DaoMembership>('/dao/join', { method: 'POST' });
  }

  async getDaoMembers(params?: PaginationParams): Promise<PaginatedResponse<DaoMembership>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<DaoMembership>>(`/dao/members?${queryString}`);
  }

  // Badge endpoints
  async getBadges(params?: PaginationParams): Promise<PaginatedResponse<Badge>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<Badge>>(`/badges?${queryString}`);
  }

  async getUserBadges(userId?: string): Promise<PaginatedResponse<UserBadge>> {
    return this.request<PaginatedResponse<UserBadge>>(`/badges/user${userId ? `?userId=${userId}` : ''}`);
  }

  // Transaction endpoints
  async getMintReceipts(params?: PaginationParams): Promise<PaginatedResponse<MintReceipt>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<MintReceipt>>(`/transactions/mint?${queryString}`);
  }

  async getRedeemReceipts(params?: PaginationParams): Promise<PaginatedResponse<RedeemReceipt>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<RedeemReceipt>>(`/transactions/redeem?${queryString}`);
  }

  async createMintRequest(data: {
    amount: string;
    chain: string;
    paymentMethod: string;
  }): Promise<MintReceipt> {
    return this.request<MintReceipt>('/transactions/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async createRedeemRequest(data: {
    tokenAmount: string;
    chain: string;
    paymentMethod: string;
    paymentAddress: string;
  }): Promise<RedeemReceipt> {
    return this.request<RedeemReceipt>('/transactions/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Notification endpoints
  async getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<Notification>>(`/notifications?${queryString}`);
  }

  async markNotificationRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/notifications/read-all', { method: 'PATCH' });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getTransactionStats(period: 'daily' | 'weekly' | 'monthly'): Promise<TransactionStats> {
    return this.request<TransactionStats>(`/dashboard/transaction-stats?period=${period}`);
  }

  // Health check
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }
}

export const apiClient = new ApiClient();