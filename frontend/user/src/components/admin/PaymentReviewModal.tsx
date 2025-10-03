'use client';

import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { Badge } from '../ui/Badge';
import {
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  DollarSign,
  Coins,
  Clock,
  User,
  Wallet,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { formatTokenAmount, PRICING, CHAINS, type TokenType } from '../../lib/pricing';

interface PaymentReviewModalProps {
  payment: {
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
  };
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    setError('');
    setSuccess('');

    try {
      const functions = getFunctions();
      const verifyPayment = httpsCallable(functions, 'manualPayments-verifyManualPayment');

      await verifyPayment({
        paymentId: payment.id,
        approved: true,
      });

      setSuccess('Payment approved! Tokens will be distributed shortly.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error approving payment:', err);
      setError(err.message || 'Failed to approve payment');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setRejecting(true);
    setError('');
    setSuccess('');

    try {
      const functions = getFunctions();
      const verifyPayment = httpsCallable(functions, 'manualPayments-verifyManualPayment');

      await verifyPayment({
        paymentId: payment.id,
        approved: false,
        rejectionReason: rejectReason,
      });

      setSuccess('Payment rejected. User has been notified.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error rejecting payment:', err);
      setError(err.message || 'Failed to reject payment');
    } finally {
      setRejecting(false);
    }
  };

  const openBlockExplorer = () => {
    if (!payment.stablecoinTxHash) return;

    const chain = CHAINS[payment.deliveryChain as keyof typeof CHAINS];
    if (chain) {
      window.open(`${chain.explorer}/tx/${payment.stablecoinTxHash}`, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateExpiry = () => {
    const expiresAt = new Date(payment.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs < 0) {
      return { text: 'Expired', color: 'text-red-400', expired: true };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 2) {
      return { text: `${diffHours}h ${diffMins}m remaining`, color: 'text-red-400', expired: false };
    }

    return { text: `${diffHours}h ${diffMins}m remaining`, color: 'text-yellow-400', expired: false };
  };

  const expiry = calculateExpiry();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Review Payment</h2>
            <p className="text-gray-400 mt-1">
              Reference: <span className="font-mono text-white">{payment.referenceId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Expiry Banner */}
          <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Status: {payment.status.replace(/_/g, ' ')}</p>
                <p className="text-gray-400 text-sm">Created: {formatDate(payment.createdAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${expiry.color}`}>{expiry.text}</p>
              <p className="text-gray-400 text-sm">Expires: {formatDate(payment.expiresAt)}</p>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                User Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">User ID</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white font-mono text-sm">{payment.userId}</p>
                    <button
                      onClick={() => handleCopy(payment.userId, 'userId')}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copied === 'userId' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                {payment.userEmail && (
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white mt-1">{payment.userEmail}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm">Delivery Address</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white font-mono text-xs break-all">
                      {payment.deliveryAddress}
                    </p>
                    <button
                      onClick={() => handleCopy(payment.deliveryAddress, 'address')}
                      className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                    >
                      {copied === 'address' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-400" />
                Purchase Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Token Type</p>
                  <p className="text-white font-medium mt-1">
                    {PRICING[payment.tokenType].icon} {PRICING[payment.tokenType].name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount (USD)</p>
                  <p className="text-white font-bold text-2xl flex items-center gap-2 mt-1">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    {payment.requestedAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Token Amount</p>
                  <p className="text-white font-medium mt-1">
                    {formatTokenAmount(payment.tokenAmount, payment.tokenType)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Delivery Chain</p>
                  <p className="text-white mt-1">
                    {CHAINS[payment.deliveryChain as keyof typeof CHAINS]?.name || payment.deliveryChain}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Payment Proof
            </h3>

            {payment.paymentMethod === 'CASH_APP' && payment.cashAppProof && (
              <div className="space-y-3">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Cash App Payment Screenshot
                  </p>
                  <div className="mt-3">
                    <img
                      src={payment.cashAppProof}
                      alt="Cash App Payment Proof"
                      className="max-w-full rounded-lg border border-white/10"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={payment.cashAppProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in new tab
                    </a>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-sm mb-2">Verify payment details:</p>
                  <ul className="text-white text-sm space-y-1 ml-4 list-disc">
                    <li>Payment sent to: <span className="font-bold">$C12Ai</span></li>
                    <li>Amount: <span className="font-bold">${payment.requestedAmount.toFixed(2)}</span></li>
                    <li>Screenshot shows completed transaction</li>
                    <li>Timestamp is within 24 hours of request</li>
                  </ul>
                </div>
              </div>
            )}

            {payment.paymentMethod === 'STABLECOIN' && payment.stablecoinTxHash && (
              <div className="space-y-3">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-400 font-medium mb-2">Stablecoin Transaction</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Stablecoin Type</p>
                      <p className="text-white font-medium mt-1">{payment.stablecoinType}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Transaction Hash</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-white font-mono text-xs break-all">
                          {payment.stablecoinTxHash}
                        </p>
                        <button
                          onClick={() => handleCopy(payment.stablecoinTxHash!, 'txHash')}
                          className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                        >
                          {copied === 'txHash' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <GlassButton
                      onClick={openBlockExplorer}
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Block Explorer
                    </GlassButton>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-sm mb-2">Verify transaction details:</p>
                  <ul className="text-white text-sm space-y-1 ml-4 list-disc">
                    <li>Sent to: <span className="font-mono text-xs">0x7903c63CB9f42284d03BC2a124474760f9C1390b</span></li>
                    <li>Token: <span className="font-bold">{payment.stablecoinType}</span></li>
                    <li>Amount: <span className="font-bold">{payment.requestedAmount.toFixed(2)} {payment.stablecoinType}</span></li>
                    <li>Chain: <span className="font-bold">{CHAINS[payment.deliveryChain as keyof typeof CHAINS]?.name}</span></li>
                    <li>Transaction is confirmed on blockchain</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <p>{success}</p>
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
              <p className="text-red-400 font-medium">Reason for Rejection</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a clear reason for rejecting this payment (will be sent to user)"
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          {payment.status === 'PENDING_VERIFICATION' || payment.status === 'VERIFYING' ? (
            <div className="flex gap-3">
              {!showRejectForm ? (
                <>
                  <GlassButton
                    onClick={handleApprove}
                    disabled={approving || rejecting || expiry.expired}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {approving ? 'Approving...' : 'Approve & Distribute Tokens'}
                  </GlassButton>
                  <GlassButton
                    onClick={() => setShowRejectForm(true)}
                    disabled={approving || rejecting}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Payment
                  </GlassButton>
                </>
              ) : (
                <>
                  <GlassButton
                    onClick={handleReject}
                    disabled={rejecting || !rejectReason.trim()}
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
                  >
                    <XCircle className="w-5 h-5" />
                    {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                  </GlassButton>
                  <GlassButton
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    disabled={rejecting}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </GlassButton>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
              <p className="text-gray-400">
                This payment has already been {payment.status.toLowerCase().replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {expiry.expired && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <p>This payment request has expired and cannot be approved</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
