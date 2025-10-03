'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import {
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { formatTokenAmount, PRICING, CHAINS, type TokenType } from '../../lib/pricing';
import { PaymentReviewModal } from './PaymentReviewModal';

interface ManualPayment {
  id: string;
  referenceId: string;
  userId: string;
  userEmail?: string;
  tokenType: TokenType;
  requestedAmount: number;
  tokenAmount: number;
  deliveryChain: string;
  paymentMethod: string;
  stablecoinType?: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  cashAppProof?: string;
  stablecoinTxHash?: string;
  deliveryAddress: string;
}

type FilterStatus = 'all' | 'pending' | 'verifying' | 'approved' | 'completed' | 'rejected';

export const ManualPaymentQueue: React.FC = () => {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch payments from backend
  const fetchPayments = async () => {
    setLoading(true);
    setError('');

    try {
      const functions = getFunctions();
      const listPayments = httpsCallable(functions, 'manualPayments-listPayments');

      const result = await listPayments({
        status: filterStatus === 'all' ? undefined : filterStatus,
      }) as { data: { payments: ManualPayment[] } };

      setPayments(result.data.payments);
      setFilteredPayments(result.data.payments);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  // Filter payments by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter(
      (p) =>
        p.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleReviewClick = (payment: ManualPayment) => {
    setSelectedPayment(payment);
    setShowReviewModal(true);
  };

  const handleReviewComplete = () => {
    setShowReviewModal(false);
    setSelectedPayment(null);
    fetchPayments(); // Refresh list
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      PENDING_SUBMISSION: { color: 'bg-gray-500', icon: Clock },
      PENDING_VERIFICATION: { color: 'bg-yellow-500', icon: AlertTriangle },
      VERIFYING: { color: 'bg-blue-500', icon: Clock },
      APPROVED: { color: 'bg-green-500', icon: CheckCircle },
      DISTRIBUTING: { color: 'bg-blue-500', icon: Clock },
      COMPLETED: { color: 'bg-green-600', icon: CheckCircle },
      REJECTED: { color: 'bg-red-500', icon: XCircle },
      EXPIRED: { color: 'bg-gray-600', icon: Clock },
      REFUNDED: { color: 'bg-purple-500', icon: DollarSign },
    };

    const config = statusConfig[status] || { color: 'bg-gray-500', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getPriorityColor = (payment: ManualPayment) => {
    const expiresAt = new Date(payment.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilExpiry < 2) return 'border-l-red-500';
    if (hoursUntilExpiry < 6) return 'border-l-yellow-500';
    return 'border-l-blue-500';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatExpiresIn = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) return 'Expired';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manual Payment Queue</h2>
          <p className="text-gray-400 mt-1">
            Review and approve token purchase requests
          </p>
        </div>
        <GlassButton
          onClick={fetchPayments}
          variant="secondary"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </GlassButton>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference ID, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Verification</option>
              <option value="verifying">Verifying</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Error State */}
      {error && (
        <GlassCard className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {/* Loading State */}
      {loading && (
        <GlassCard className="p-8">
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p>Loading payments...</p>
          </div>
        </GlassCard>
      )}

      {/* Empty State */}
      {!loading && filteredPayments.length === 0 && (
        <GlassCard className="p-8">
          <div className="text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No payments found</p>
            <p className="text-sm mt-2">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Payments will appear here when users submit payment requests'}
            </p>
          </div>
        </GlassCard>
      )}

      {/* Payment List */}
      {!loading && filteredPayments.length > 0 && (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <GlassCard
              key={payment.id}
              className={`p-4 border-l-4 ${getPriorityColor(payment)} hover:bg-white/5 transition-colors`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Payment Info */}
                <div className="flex-1 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-white">
                      {payment.referenceId}
                    </span>
                    {getStatusBadge(payment.status)}
                    <span className="text-sm text-gray-400">
                      {formatTimeAgo(payment.createdAt)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* User & Amount */}
                    <div className="space-y-1">
                      <p className="text-gray-400">User</p>
                      <p className="text-white font-medium">
                        {payment.userEmail || payment.userId.slice(0, 8) + '...'}
                      </p>
                      <p className="text-gray-400 mt-2">Amount</p>
                      <p className="text-white font-bold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        ${payment.requestedAmount.toFixed(2)}
                      </p>
                    </div>

                    {/* Token Info */}
                    <div className="space-y-1">
                      <p className="text-gray-400">Token</p>
                      <p className="text-white font-medium">
                        {formatTokenAmount(payment.tokenAmount, payment.tokenType)}
                      </p>
                      <p className="text-gray-400 mt-2">Chain</p>
                      <p className="text-white">
                        {CHAINS[payment.deliveryChain as keyof typeof CHAINS]?.name || payment.deliveryChain}
                      </p>
                    </div>

                    {/* Payment Method & Expiry */}
                    <div className="space-y-1">
                      <p className="text-gray-400">Payment Method</p>
                      <p className="text-white">
                        {payment.paymentMethod === 'CASH_APP' ? 'Cash App' : payment.stablecoinType}
                      </p>
                      {payment.status === 'PENDING_VERIFICATION' && (
                        <>
                          <p className="text-gray-400 mt-2">Expires In</p>
                          <p className={`font-medium ${
                            formatExpiresIn(payment.expiresAt) === 'Expired'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                          }`}>
                            <Clock className="inline w-3 h-3 mr-1" />
                            {formatExpiresIn(payment.expiresAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="text-sm">
                    <p className="text-gray-400">Delivery Address</p>
                    <p className="text-white font-mono text-xs mt-1">
                      {payment.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                {(payment.status === 'PENDING_VERIFICATION' || payment.status === 'VERIFYING') && (
                  <GlassButton
                    onClick={() => handleReviewClick(payment)}
                    variant="primary"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {!loading && payments.length > 0 && (
        <GlassCard className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {payments.filter((p) => p.status === 'PENDING_VERIFICATION').length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Verifying</p>
              <p className="text-2xl font-bold text-blue-400">
                {payments.filter((p) => p.status === 'VERIFYING').length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">
                {payments.filter((p) => p.status === 'COMPLETED').length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${payments.reduce((sum, p) => sum + p.requestedAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedPayment && (
        <PaymentReviewModal
          payment={selectedPayment}
          isOpen={showReviewModal}
          onClose={handleReviewComplete}
        />
      )}
    </div>
  );
};
