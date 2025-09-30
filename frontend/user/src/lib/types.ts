// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  daoMembership?: DaoMembership;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  transactions: boolean;
  dao: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  transactionsVisible: boolean;
  daoActivityVisible: boolean;
}

// DAO types
export interface DaoMembership {
  id: string;
  userId: string;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinedAt: string;
  reputation: number;
  votingPower: number;
  isActive: boolean;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
  level?: number;
}

// Transaction types
export interface MintReceipt {
  id: string;
  userId: string;
  amount: string;
  amountUSD: string;
  chain: string;
  paymentMethod: string;
  paymentAddress?: string;
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  fee: string;
  feeUSD: string;
}

export interface RedeemReceipt {
  id: string;
  userId: string;
  tokenAmount: string;
  amountUSD: string;
  chain: string;
  paymentMethod: string;
  paymentAddress: string;
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  fee: string;
  feeUSD: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'dao' | 'badge' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalBalance: string;
  totalBalanceUSD: string;
  totalMinted: string;
  totalMintedUSD: string;
  totalRedeemed: string;
  totalRedeemedUSD: string;
  totalFees: string;
  totalFeesUSD: string;
  pendingTransactions: number;
  daoReputation?: number;
  badgeCount: number;
}

export interface TransactionStats {
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: string;
    minted: string;
    redeemed: string;
    volume: string;
  }>;
}

// API types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Health check
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: 'ok' | 'down';
    blockchain: 'ok' | 'down';
    cache: 'ok' | 'down';
  };
}