import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { GlassButton } from '../../../shared/components/ui/GlassButton';
import { Badge } from '../../../shared/components/ui/Badge';
import { PaymentReviewModal } from './PaymentReviewModal';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ManualPayment {
  id: string;
  referenceId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  tokenType: 'C12USD' | 'C12DAO';
  requestedAmount: number;
  tokenAmount: number;
  deliveryChain: 'BSC' | 'POLYGON';
  paymentMethod: 'CASH_APP' | 'STABLECOIN';
  paymentAmount: number;
  status: string;
  cashAppCashtag?: string;
  cashAppProof?: string;
  stablecoinType?: string;
  senderAddress?: string;
  txHash?: string;
  blockchainChain?: string;
  userNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

type StatusFilter = 'ALL' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export const ManualPaymentQueue: React.FC = () => {
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING_VERIFICATION');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const getPayments = httpsCallable(functions, 'manualPayments-getAdminPayments');
      const result = await getPayments({ status: statusFilter === 'ALL' ? undefined : statusFilter });

      if (result.data && Array.isArray((result.data as any).payments)) {
        const paymentsData = (result.data as any).payments.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          expiresAt: new Date(p.expiresAt),
        }));
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Use mock data for development
      setPayments(getMockPayments());
    } finally {
      setLoading(false);
    }
  };

  // Filter payments based on search and status
  useEffect(() => {
    let filtered = payments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm]);

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  // Handle review click
  const handleReviewClick = (payment: ManualPayment) => {
    setSelectedPayment(payment);
    setIsReviewModalOpen(true);
  };

  // Handle review complete
  const handleReviewComplete = () => {
    setIsReviewModalOpen(false);
    setSelectedPayment(null);
    fetchPayments(); // Refresh list
  };

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'EXPIRED':
        return 'default';
      case 'TOKENS_DISTRIBUTED':
        return 'success';
      default:
        return 'default';
    }
  };

  // Status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
      case 'TOKENS_DISTRIBUTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center gap-3 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p>Loading payment queue...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <GlassCard className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference ID, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'EXPIRED'] as StatusFilter[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      statusFilter === status
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : formatStatus(status)}
                  </button>
                )
              )}
            </div>

            {/* Refresh */}
            <GlassButton variant="secondary" onClick={fetchPayments}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </GlassButton>
          </div>
        </GlassCard>

        {/* Queue Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {payments.filter((p) => p.status === 'PENDING_VERIFICATION').length}
                </div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {payments.filter((p) => p.status === 'APPROVED' || p.status === 'TOKENS_DISTRIBUTED').length}
                </div>
                <div className="text-sm text-gray-400">Approved</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {payments.filter((p) => p.status === 'REJECTED').length}
                </div>
                <div className="text-sm text-gray-400">Rejected</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  ${payments.reduce((sum, p) => sum + p.paymentAmount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Volume</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Payment List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Payment Requests ({filteredPayments.length})
          </h2>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">No payments found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Payment Info */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Reference ID</div>
                        <div className="font-mono text-white font-medium">{payment.referenceId}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">User</div>
                        <div className="text-white">{payment.userName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{payment.userEmail}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">Purchase</div>
                        <div className="text-white font-medium">
                          {payment.tokenAmount} {payment.tokenType}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${payment.paymentAmount.toFixed(2)} via {payment.paymentMethod.replace('_', ' ')}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">Status</div>
                        <Badge
                          variant={getStatusVariant(payment.status)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(payment.status)}
                          {formatStatus(payment.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {payment.status === 'PENDING_VERIFICATION' && (
                        <GlassButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleReviewClick(payment)}
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </GlassButton>
                      )}
                      {payment.status !== 'PENDING_VERIFICATION' && (
                        <GlassButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReviewClick(payment)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Review Modal */}
      {selectedPayment && (
        <PaymentReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          payment={selectedPayment}
          onComplete={handleReviewComplete}
        />
      )}
    </>
  );
};

// Mock data for development
function getMockPayments(): ManualPayment[] {
  return [
    {
      id: '1',
      referenceId: 'MP-2025-001',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      tokenType: 'C12USD',
      requestedAmount: 100,
      tokenAmount: 100,
      deliveryChain: 'BSC',
      paymentMethod: 'CASH_APP',
      paymentAmount: 100,
      status: 'PENDING_VERIFICATION',
      cashAppCashtag: '$johndoe',
      cashAppProof: 'https://example.com/proof.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      referenceId: 'MP-2025-002',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      tokenType: 'C12DAO',
      requestedAmount: 330,
      tokenAmount: 100,
      deliveryChain: 'POLYGON',
      paymentMethod: 'STABLECOIN',
      paymentAmount: 330,
      status: 'PENDING_VERIFICATION',
      stablecoinType: 'USDT',
      senderAddress: '0x1234...5678',
      txHash: '0xabcd...efgh',
      blockchainChain: 'BSC',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
    },
  ];
}
