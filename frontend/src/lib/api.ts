import axios from 'axios';

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);

    // Handle specific error types
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.warn('Unauthorized access - redirecting to login');
    }

    return Promise.reject(error);
  }
);

// API Types
export interface RedemptionRequest {
  userWallet: string;
  usdAmount: number;
  chainId: number;
  payoutMethod: 'stripe' | 'cashapp';
  payoutDestination?: string;
  expectedTokenAmount?: string;
}

export interface RedemptionResponse {
  success: boolean;
  redemptionId: string;
  transactionHash?: string;
  payoutId?: string;
  estimatedProcessingTime: string;
  status: string;
}

export interface RedemptionStatus {
  redemptionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  userWallet: string;
  usdAmount: number;
  chainId: number;
  txHash?: string;
  payoutId?: string;
  payoutStatus?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface UserLimits {
  userWallet: string;
  dailyLimits: {
    current: number;
    limit: number;
    remaining: number;
  };
  tokenBalances: Record<string, {
    balance: string;
    symbol?: string;
    error?: string;
  }>;
  pilotLimits: {
    dailyLimit: number;
    perTransactionLimit: number;
  };
}

export interface PoRSnapshot {
  id: string;
  totalReserves: number;
  circulatingSupply: number;
  reserveRatio: number;
  status: string;
  txHash?: string;
  blockNumber?: number;
  createdAt: string;
  publishedAt?: string;
  reserves?: {
    accounts: any[];
    breakdown: any[];
    queryTimestamp: string;
  };
}

export interface ApiMetrics {
  timestamp: string;
  counters: {
    total_receipts: number;
    total_redemptions: number;
    receipts_24h: number;
    redemptions_24h: number;
  };
  volumes: {
    total_mint_usd: number;
    total_redeem_usd: number;
  };
  system: {
    uptime_seconds: number;
    memory_usage_mb: number;
    node_version: string;
    environment: string;
  };
}

// API Functions
export const ApiService = {
  // Health and status
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  async getReadiness() {
    const response = await api.get('/ready');
    return response.data;
  },

  async getMetrics(): Promise<ApiMetrics> {
    const response = await api.get('/metrics');
    return response.data;
  },

  // Redemption operations
  async requestRedemption(request: RedemptionRequest): Promise<RedemptionResponse> {
    const response = await api.post('/api/redeem', request);
    return response.data;
  },

  async getRedemptionStatus(redemptionId: string): Promise<RedemptionStatus> {
    const response = await api.get(`/api/redeem/${redemptionId}/status`);
    return response.data;
  },

  async getRedemptionHistory(
    userWallet: string,
    limit = 10,
    offset = 0,
    status?: string
  ): Promise<{
    redemptions: RedemptionStatus[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (status) params.append('status', status);

    const response = await api.get(`/api/redeem/history/${userWallet}?${params}`);
    return response.data;
  },

  async getUserLimits(userWallet: string): Promise<UserLimits> {
    const response = await api.get(`/api/redeem/limits/${userWallet}`);
    return response.data;
  },

  async cancelRedemption(redemptionId: string) {
    const response = await api.post(`/api/redeem/${redemptionId}/cancel`);
    return response.data;
  },

  // Proof of Reserves
  async getLatestPoR(): Promise<{ snapshot: PoRSnapshot }> {
    const response = await api.get('/api/por/latest');
    return response.data;
  },

  async getPoRHistory(
    limit = 10,
    offset = 0
  ): Promise<{
    snapshots: PoRSnapshot[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await api.get(`/api/por/history?${params}`);
    return response.data;
  },

  async getPoRStatus() {
    const response = await api.get('/api/por/status');
    return response.data;
  },
};

// Error handling utility
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}