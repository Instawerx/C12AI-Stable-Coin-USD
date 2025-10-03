'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  Smartphone,
  Coins,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import type { MembershipTier } from './ProductCard';

type PaymentMethod = 'stripe' | 'cashapp' | 'usdc' | 'usdt';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: MembershipTier;
  tokenAmount: number;
  usdPrice: number;
}

const paymentMethods = [
  {
    id: 'stripe' as PaymentMethod,
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex',
    fee: 2.9,
    estimatedTime: 'Instant',
  },
  {
    id: 'cashapp' as PaymentMethod,
    name: 'Cash App',
    icon: Smartphone,
    description: 'Pay with $Cashtag',
    fee: 0,
    estimatedTime: '5-10 minutes',
  },
  {
    id: 'usdc' as PaymentMethod,
    name: 'USDC',
    icon: Coins,
    description: 'USD Coin (ERC-20)',
    fee: 0,
    estimatedTime: '2-5 minutes',
  },
  {
    id: 'usdt' as PaymentMethod,
    name: 'USDT',
    icon: Coins,
    description: 'Tether (ERC-20)',
    fee: 0,
    estimatedTime: '2-5 minutes',
  },
];

export const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({
  isOpen,
  onClose,
  tier,
  tokenAmount,
  usdPrice,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'payment' | 'confirm' | 'success'>('payment');

  const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);
  const feeAmount = selectedMethod ? (usdPrice * quantity * selectedMethod.fee) / 100 : 0;
  const totalAmount = usdPrice * quantity + feeAmount;

  const handlePurchase = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);

    try {
      // Simulate API call to create manual payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Replace with actual Firebase Functions call
      // const response = await fetch('/api/createManualPayment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: totalAmount,
      //     paymentMethod: selectedPayment,
      //     tier,
      //     tokenAmount: tokenAmount * quantity,
      //   }),
      // });

      setStep('success');
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('payment');
    setSelectedPayment(null);
    setQuantity(1);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Purchase {tier} Tokens</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Complete your purchase securely
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-surface-glass rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'payment' && (
              <>
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </GlassButton>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold">{quantity}x</div>
                      <div className="text-sm text-text-secondary">
                        {(tokenAmount * quantity).toLocaleString()} tokens
                      </div>
                    </div>
                    <GlassButton
                      variant="secondary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </GlassButton>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Payment Method
                  </label>
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment === method.id;

                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${isSelected
                              ? 'border-brand-primary bg-brand-primary/10'
                              : 'border-surface-glass hover:border-brand-primary/50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`
                              w-12 h-12 rounded-lg flex items-center justify-center
                              ${isSelected ? 'bg-brand-primary/20' : 'bg-surface-glass'}
                            `}>
                              <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-primary' : ''}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{method.name}</span>
                                {method.fee > 0 && (
                                  <Badge variant="warning" size="sm">
                                    {method.fee}% fee
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-text-secondary">
                                {method.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-text-secondary">
                                <Clock className="w-3 h-3" />
                                {method.estimatedTime}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mb-6 p-4 glass-card rounded-lg">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        {tokenAmount.toLocaleString()} tokens × {quantity}
                      </span>
                      <span className="font-medium">
                        ${(usdPrice * quantity).toLocaleString()}
                      </span>
                    </div>
                    {feeAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Payment processing fee ({selectedMethod?.fee}%)
                        </span>
                        <span className="font-medium">
                          ${feeAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-surface-glass my-2" />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-brand-primary">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mb-6 p-4 glass-card rounded-lg bg-brand-info/10 border border-brand-info/30">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-brand-info flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-brand-info mb-1">
                        Secure Payment Processing
                      </p>
                      <p className="text-text-secondary">
                        Your payment is processed securely. Tokens will be delivered to your wallet within {selectedMethod?.estimatedTime || 'a few minutes'}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <GlassButton
                    variant="secondary"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    className="flex-1"
                    onClick={handlePurchase}
                    disabled={!selectedPayment || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Purchase
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </GlassButton>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-brand-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-brand-success" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Purchase Successful!</h3>
                <p className="text-text-secondary mb-6">
                  Your payment has been received and is being processed.
                  You'll receive {(tokenAmount * quantity).toLocaleString()} C12DAO tokens shortly.
                </p>
                <div className="p-4 glass-card rounded-lg mb-6 text-left">
                  <h4 className="font-medium mb-2">What's Next?</h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
                      Payment confirmation sent to your email
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
                      Tokens will arrive in your wallet within {selectedMethod?.estimatedTime}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
                      You can track your order in the History page
                    </li>
                  </ul>
                </div>
                <GlassButton
                  variant="primary"
                  className="w-full"
                  onClick={handleClose}
                >
                  Done
                </GlassButton>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
