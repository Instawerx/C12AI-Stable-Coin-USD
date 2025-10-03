'use client';

import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { Badge } from './ui/Badge';
import {
  Info,
  DollarSign,
  Coins,
  Copy,
  Smartphone,
  ExternalLink,
  Upload,
  CheckCircle,
} from 'lucide-react';
import {
  PAYMENT_CONFIG,
  generateReferenceId,
  copyToClipboard,
  openInNewTab,
  formatUSD,
  type TokenType,
  type ChainType,
} from '../lib/pricing';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface PaymentInstructionsProps {
  tokenType: TokenType;
  amount: string;
  tokenAmount: number;
  chain: ChainType;
  paymentMethod: 'cash-app' | 'stablecoin';
  stablecoin: 'BUSD' | 'USDT' | 'USDC';
  userAddress?: string;
  onBack: () => void;
  onClose: () => void;
}

export const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  tokenType,
  amount,
  tokenAmount,
  chain,
  paymentMethod,
  stablecoin,
  userAddress,
  onBack,
  onClose,
}) => {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [txHash, setTxHash] = useState('');
  const [senderInfo, setSenderInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId] = useState(generateReferenceId());

  // Copy to clipboard with toast notification
  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      // TODO: Add toast notification
      alert(`${label} copied!`);
    }
  };

  // Handle screenshot upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
    }
  };

  // Upload screenshot to Firebase Storage
  const uploadScreenshot = async (file: File): Promise<string> => {
    // TODO: Implement Firebase Storage upload
    // For now, return placeholder URL
    console.log('Uploading screenshot:', file.name);
    return `https://storage.example.com/screenshots/${referenceId}/${file.name}`;
  };

  // Submit payment proof
  const handleSubmit = async () => {
    // Validation
    if (paymentMethod === 'cash-app') {
      if (!screenshot) {
        alert('Please upload a screenshot of your Cash App payment');
        return;
      }
      if (!senderInfo) {
        alert('Please enter your Cash App cashtag');
        return;
      }
    } else {
      if (!txHash) {
        alert('Please enter the transaction hash');
        return;
      }
      if (!senderInfo) {
        alert('Please enter your wallet address');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Upload screenshot if Cash App
      let proofUrl = null;
      if (paymentMethod === 'cash-app' && screenshot) {
        proofUrl = await uploadScreenshot(screenshot);
      }

      // Call Firebase Function to create manual payment
      const functions = getFunctions();
      const createManualPayment = httpsCallable(functions, 'manualPayments.createManualPayment');

      const paymentData = {
        referenceId,
        tokenType,
        requestedAmount: parseFloat(amount),
        tokenAmount,
        deliveryChain: chain,
        paymentMethod: paymentMethod === 'cash-app' ? 'CASH_APP' : 'STABLECOIN',
        paymentAmount: parseFloat(amount),
        // Cash App specific
        cashAppCashtag: paymentMethod === 'cash-app' ? senderInfo : null,
        cashAppProof: proofUrl,
        // Stablecoin specific
        stablecoinType: paymentMethod === 'stablecoin' ? stablecoin : null,
        senderAddress: paymentMethod === 'stablecoin' ? senderInfo : null,
        txHash: paymentMethod === 'stablecoin' ? txHash : null,
        blockchainChain: paymentMethod === 'stablecoin' ? chain : null,
        userNotes: notes || null,
      };

      const result = await createManualPayment(paymentData);

      if (result.data.success) {
        setSubmitted(true);
        // Show success message for 3 seconds then close
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Error submitting payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-brand-success" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Payment Submitted!</h3>
        <p className="text-text-secondary mb-4">
          Your payment is being verified. You'll receive a notification when your tokens are
          delivered.
        </p>
        <div className="bg-brand-info/10 border border-brand-info/30 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium">Reference ID</p>
          <p className="text-lg font-bold font-mono">{referenceId}</p>
        </div>
        <p className="text-sm text-text-secondary">
          Estimated verification time: 15-60 minutes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-brand-primary hover:underline">
        ← Back
      </button>

      {/* Instructions Alert */}
      <GlassCard className="p-4 bg-brand-info/10 border-brand-info/30">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-brand-info mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Payment Instructions</p>
            <p className="text-text-secondary">
              Follow the steps below to complete your payment. Your tokens will be delivered
              within 15-60 minutes after verification.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Reference ID */}
      <div>
        <label className="block text-sm font-medium mb-2">Transaction Reference</label>
        <div className="flex gap-2">
          <GlassInput value={referenceId} readOnly className="font-mono" />
          <GlassButton
            variant="secondary"
            onClick={() => handleCopy(referenceId, 'Reference ID')}
          >
            <Copy className="w-4 h-4" />
          </GlassButton>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Keep this reference for tracking your payment
        </p>
      </div>

      {/* Cash App Instructions */}
      {paymentMethod === 'cash-app' && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                1. Send Payment To
              </label>
              <div className="flex gap-2">
                <GlassInput
                  value={PAYMENT_CONFIG.CASH_APP_CASHTAG}
                  readOnly
                  className="font-bold text-lg"
                />
                <GlassButton
                  variant="secondary"
                  onClick={() =>
                    handleCopy(PAYMENT_CONFIG.CASH_APP_CASHTAG, 'Cashtag')
                  }
                >
                  <Copy className="w-4 h-4" />
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => openInNewTab(PAYMENT_CONFIG.CASH_APP_URL)}
                >
                  <Smartphone className="w-4 h-4" />
                  Open
                </GlassButton>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                2. Payment Amount
              </label>
              <GlassInput
                value={formatUSD(parseFloat(amount))}
                readOnly
                leftIcon={<DollarSign className="w-5 h-5" />}
                className="text-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                3. QR Code (Optional)
              </label>
              <GlassCard className="p-4 text-center">
                <div className="w-48 h-48 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                  {/* TODO: Add actual QR code image */}
                  <p className="text-sm text-gray-500">QR Code Here</p>
                </div>
                <p className="text-sm text-text-secondary">
                  Scan with Cash App to pay directly
                </p>
              </GlassCard>
            </div>
          </div>

          {/* Proof Submission */}
          <div className="border-t border-white/20 pt-6">
            <h3 className="font-medium mb-4">Submit Payment Proof</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Screenshot *
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-brand-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="cursor-pointer block"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    {screenshot ? (
                      <div>
                        <p className="font-medium text-brand-success mb-1">
                          {screenshot.name}
                        </p>
                        <p className="text-sm text-text-secondary">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium mb-1">
                          Click to upload screenshot
                        </p>
                        <p className="text-sm text-text-secondary">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Screenshot of Cash App payment confirmation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Cash App Cashtag *
                </label>
                <GlassInput
                  placeholder="$YourCashtag"
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all"
                  rows={3}
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stablecoin Instructions */}
      {paymentMethod === 'stablecoin' && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                1. Send {stablecoin} To
              </label>
              <div className="flex gap-2">
                <GlassInput
                  value={PAYMENT_CONFIG.ADMIN_WALLET_ADDRESS}
                  readOnly
                  className="font-mono text-sm"
                />
                <GlassButton
                  variant="secondary"
                  onClick={() =>
                    handleCopy(PAYMENT_CONFIG.ADMIN_WALLET_ADDRESS, 'Address')
                  }
                >
                  <Copy className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                2. Payment Amount
              </label>
              <GlassInput
                value={`${parseFloat(amount).toFixed(2)} ${stablecoin}`}
                readOnly
                leftIcon={<Coins className="w-5 h-5" />}
                className="text-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">3. Network</label>
              <GlassInput value={chain} readOnly />
              <div className="bg-brand-warning/10 border border-brand-warning/30 rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-brand-warning flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Important: Send on {chain} network only!
                </p>
              </div>
            </div>
          </div>

          {/* Proof Submission */}
          <div className="border-t border-white/20 pt-6">
            <h3 className="font-medium mb-4">Submit Transaction Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction Hash *
                </label>
                <GlassInput
                  placeholder="0x..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Hash from your {stablecoin} transfer transaction
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Wallet Address *
                </label>
                <GlassInput
                  placeholder="0x..."
                  value={senderInfo}
                  onChange={(e) => setSenderInfo(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all"
                  rows={3}
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      <GlassCard className="p-4 bg-brand-primary/5">
        <h3 className="font-medium mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Token:</span>
            <span className="font-medium">{tokenType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Amount:</span>
            <span className="font-medium">
              {tokenAmount.toFixed(2)} {tokenType}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Payment:</span>
            <span className="font-medium">{formatUSD(parseFloat(amount))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Delivery Chain:</span>
            <Badge variant="info" size="sm">
              {chain}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Reference:</span>
            <span className="font-mono text-xs">{referenceId}</span>
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <GlassButton
        variant="primary"
        className="w-full"
        onClick={handleSubmit}
        disabled={
          submitting ||
          !senderInfo ||
          (paymentMethod === 'cash-app' && !screenshot) ||
          (paymentMethod === 'stablecoin' && !txHash)
        }
        loading={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Payment'}
      </GlassButton>
    </div>
  );
};
