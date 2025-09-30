import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
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
} from '../lib/types';

// User hooks
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => apiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// DAO hooks
export function useDaoMembership(userId?: string) {
  return useQuery({
    queryKey: ['dao-membership', userId],
    queryFn: () => apiClient.getDaoMembership(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useJoinDao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.joinDao(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dao-membership'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDaoMembers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['dao-members', params],
    queryFn: () => apiClient.getDaoMembers(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Badge hooks
export function useBadges(params?: PaginationParams) {
  return useQuery({
    queryKey: ['badges', params],
    queryFn: () => apiClient.getBadges(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: () => apiClient.getUserBadges(userId),
    staleTime: 10 * 60 * 1000,
  });
}

// Transaction hooks
export function useMintReceipts(params?: PaginationParams) {
  return useQuery({
    queryKey: ['mint-receipts', params],
    queryFn: () => apiClient.getMintReceipts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRedeemReceipts(params?: PaginationParams) {
  return useQuery({
    queryKey: ['redeem-receipts', params],
    queryFn: () => apiClient.getRedeemReceipts(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateMintRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: string;
      chain: string;
      paymentMethod: string;
    }) => apiClient.createMintRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mint-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCreateRedeemRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      tokenAmount: string;
      chain: string;
      paymentMethod: string;
      paymentAddress: string;
    }) => apiClient.createRedeemRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redeem-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// Notification hooks
export function useNotifications(params?: PaginationParams) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => apiClient.getNotifications(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Dashboard hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useTransactionStats(period: 'daily' | 'weekly' | 'monthly') {
  return useQuery({
    queryKey: ['transaction-stats', period],
    queryFn: () => apiClient.getTransactionStats(period),
    staleTime: 10 * 60 * 1000,
  });
}

// Health check hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Check every minute
  });
}