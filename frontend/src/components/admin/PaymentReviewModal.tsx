import React, { useState } from 'react';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { GlassButton } from '../../../shared/components/ui/GlassButton';
import { GlassInput } from '../../../shared/components/ui/GlassInput';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  AlertTriangle,
  DollarSign,
  Coins,
  Calendar,
  User,
  Wallet,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface Payment {
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

interface PaymentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  onComplete: () => void;
}

export const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({
  isOpen,
  onClose,
  payment,
  onComplete,
}) => {
  const [adminNotes, setAdminNotes] = useState(payment.adminNotes || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle approve
  const handleApprove = async () => {
    setProcessing(true);
    setError('');

    try {
      const functions = getFunctions();
      const verifyPayment = httpsCallable(functions, 'manualPayments-verifyManualPayment');

      await verifyPayment({
        manualPaymentId: payment.id,
        approved: true,
        adminNotes,
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to approve payment');
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!adminNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const functions = getFunctions();
      const verifyPayment = httpsCallable(functions, 'manualPayments-verifyManualPayment');

      await verifyPayment({
        manualPaymentId: payment.id,
        approved: false,
        adminNotes,
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to reject payment');
      setProcessing(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Open blockchain explorer
  const openExplorer = (txHash: string, chain: string) => {
    const explorers = {
      BSC: `https://bscscan.com/tx/${txHash}`,
      POLYGON: `https://polygonscan.com/tx/${txHash}`,
    };
    window.open(explorers[chain as keyof typeof explorers] || '#', '_blank');
  };

  const isPending = payment.status === 'PENDING_VERIFICATION';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Payment Review</h2>
            <p className="text-gray-400 text-sm mt-1">Reference: {payment.referenceId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Alert */}
          {isPending && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-400 font-medium">Action Required</p>
                  <p className="text-gray-300 text-sm mt-1">
                    This payment is awaiting verification. Review the proof and approve or reject.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </h3>
              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Name</div>
                  <div className="text-white font-medium">{payment.userName || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Email</div>
                  <div className="text-white">{payment.userEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">User ID</div>
                  <div className="text-white font-mono text-sm">{payment.userId}</div>
                </div>
              </div>
            </div>

            {/* Token Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Token Details
              </h3>
              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="text-sm text-gray-400">Token Type</div>
                  <div className="text-white font-medium">{payment.tokenType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Amount</div>
                  <div className="text-white font-medium">{payment.tokenAmount} {payment.tokenType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Delivery Chain</div>
                  <Badge variant="info">{payment.deliveryChain}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Information
            </h3>
            <div className="p-4 bg-white/5 rounded-lg space-y-3">
              <div className="grid lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Method</div>
                  <div className="text-white font-medium">
                    {payment.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Amount</div>
                  <div className="text-white font-medium">${payment.paymentAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Created</div>
                  <div className="text-white">{new Date(payment.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Cash App Details */}
              {payment.paymentMethod === 'CASH_APP' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Sender Cashtag</div>
                      <div className="flex items-center gap-2">
                        <div className="text-white font-mono">{payment.cashAppCashtag}</div>
                        <button
                          onClick={() => copyToClipboard(payment.cashAppCashtag || '')}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    {payment.cashAppProof && (
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Payment Proof</div>
                        <a
                          href={payment.cashAppProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                        >
                          <ImageIcon className="w-4 h-4" />
                          View Screenshot
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stablecoin Details */}
              {payment.paymentMethod === 'STABLECOIN' && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Stablecoin Type</div>
                    <Badge variant="info">{payment.stablecoinType}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Sender Address</div>
                    <div className="flex items-center gap-2">
                      <div className="text-white font-mono text-sm">{payment.senderAddress}</div>
                      <button
                        onClick={() => copyToClipboard(payment.senderAddress || '')}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {payment.txHash && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Transaction Hash</div>
                      <div className="flex items-center gap-2">
                        <div className="text-white font-mono text-sm">{payment.txHash}</div>
                        <button
                          onClick={() => copyToClipboard(payment.txHash || '')}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => openExplorer(payment.txHash!, payment.blockchainChain!)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                        >
                          View on Explorer
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Blockchain</div>
                    <Badge variant="info">{payment.blockchainChain}</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Notes */}
          {payment.userNotes && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">User Notes</h3>
              <div className="p-4 bg-white/5 rounded-lg text-white">
                {payment.userNotes}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Admin Notes</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this payment (required for rejection)..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              disabled={!isPending}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            {isPending ? (
              <>
                <GlassButton
                  variant="danger"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1"
                >
                  <XCircle className="w-5 h-5" />
                  {processing ? 'Rejecting...' : 'Reject Payment'}
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5" />
                  {processing ? 'Approving...' : 'Approve & Distribute'}
                </GlassButton>
              </>
            ) : (
              <GlassButton variant="secondary" onClick={onClose} className="flex-1">
                Close
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
