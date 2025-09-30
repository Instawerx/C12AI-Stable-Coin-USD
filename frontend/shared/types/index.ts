// Shared TypeScript definitions for the C12USD frontend applications
// Generated from Prisma schema and API specifications

// Base types
export type Chain = 'BSC' | 'POLYGON';
export type KycStatus = 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'FOUNDER';
export type BadgeCategory = 'TRANSACTION' | 'LOYALTY' | 'ACHIEVEMENT' | 'SPECIAL' | 'LIMITED_EDITION' | 'FOUNDER';
export type BadgeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type AdminRoleType = 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'DAO_ADMIN' | 'SUPPORT_ADMIN' | 'MODERATOR' | 'AUDITOR';
export type AuthMethod = 'METAMASK' | 'GOOGLE' | 'FACEBOOK' | 'APPLE' | 'EMAIL' | 'PASSKEY';
export type NotificationType = 'TRANSACTION' | 'SYSTEM' | 'PROMOTIONAL' | 'SECURITY' | 'DAO_GOVERNANCE' | 'BADGE_EARNED' | 'MEMBERSHIP_UPDATE';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// User types
export interface User {
  id: string;
  address: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  discord?: string;

  // Authentication
  googleId?: string;
  facebookId?: string;
  appleId?: string;

  // Preferences
  preferredChain?: Chain;
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  language: string;

  // KYC
  kycStatus: KycStatus;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  daoMembership?: DaoMembership;
  userBadges?: UserBadge[];
  adminRoles?: AdminRole[];
}

// DAO Membership types
export interface DaoMembership {
  id: string;
  userId: string;
  membershipTier: MembershipTier;
  joinedAt: string;
  lastActiveAt: string;

  // Metrics
  totalStaked: string;
  totalTransactions: number;
  totalVolume: string;
  referralCount: number;

  // Status
  isActive: boolean;
  isPremium: boolean;
  isFounder: boolean;

  user?: User;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirements: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  progress?: Record<string, any>;
  isVisible: boolean;

  user?: User;
  badge?: Badge;
}

// Admin types
export interface AdminRole {
  id: string;
  userId: string;
  role: AdminRoleType;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  permissions: Record<string, any>;

  user?: User;
}

// Transaction types
export interface MintReceipt {
  id: string;
  userId: string;
  amount: string;
  tokenAmount: string;
  chain: Chain;
  status: 'PENDING' | 'PAYMENT_RECEIVED' | 'SIGNATURE_PENDING' | 'MINTING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  paymentMethod: 'STRIPE' | 'CASHAPP' | 'BANK_TRANSFER';
  paymentId: string;
  txHash?: string;
  createdAt: string;
  completedAt?: string;

  user?: User;
}

export interface RedeemReceipt {
  id: string;
  userId: string;
  tokenAmount: string;
  amount: string;
  chain: Chain;
  status: 'PENDING' | 'BURN_PENDING' | 'BURNED' | 'PAYOUT_PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  paymentMethod: 'STRIPE' | 'CASHAPP' | 'BANK_TRANSFER';
  paymentAddress: string;
  burnTxHash?: string;
  createdAt: string;
  completedAt?: string;

  user?: User;
}

// Notification types
export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  isSent: boolean;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  sentAt?: string;
}

// Authentication types
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
  loginMethod: AuthMethod;
}

export interface LoginRequest {
  method: AuthMethod;
  credentials: Record<string, any>;
  rememberMe?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Web3 types
export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider?: any;
}

export interface TokenBalance {
  chain: Chain;
  balance: string;
  formattedBalance: string;
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

// Contract types
export interface ContractAddresses {
  BSC: {
    token: string;
    gateway: string;
    layerZero: string;
  };
  POLYGON: {
    token: string;
    gateway: string;
    layerZero: string;
  };
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: string;
  activeMembers: number;
  totalSupply: string;
  reserveRatio: string;
}

export interface TransactionStats {
  daily: Array<{
    date: string;
    count: number;
    volume: string;
  }>;
  weekly: Array<{
    week: string;
    count: number;
    volume: string;
  }>;
  monthly: Array<{
    month: string;
    count: number;
    volume: string;
  }>;
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Export utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;