'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Smartphone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassInput } from '../../../components/ui/GlassInput';
import { Badge } from '../../../components/ui/Badge';
import toast from 'react-hot-toast';

type TransactionType = 'mint' | 'redeem';
type PaymentMethod = 'stripe' | 'cashapp' | 'bank';

const paymentMethods = {
  stripe: {
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-4 h-4" />,
    fee: '2.9%',
    processingTime: 'Instant',
  },
  cashapp: {
    name: 'Cash App',
    icon: <Smartphone className="w-4 h-4" />,
    fee: '1.5%',
    processingTime: '1-2 minutes',
  },
  bank: {
    name: 'Bank Transfer',
    icon: <DollarSign className="w-4 h-4" />,
    fee: '0.5%',
    processingTime: '1-3 business days',
  },
};

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') as TransactionType || 'mint';

  const [transactionType, setTransactionType] = useState<TransactionType>(initialType);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('stripe');
  const [selectedChain, setSelectedChain] = useState<'BSC' | 'POLYGON'>('BSC');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateFee = () => {
    const baseAmount = parseFloat(amount) || 0;
    const feePercentage = parseFloat(paymentMethods[selectedPaymentMethod].fee) / 100;
    return (baseAmount * feePercentage).toFixed(2);
  };

  const calculateTotal = () => {
    const baseAmount = parseFloat(amount) || 0;
    const fee = parseFloat(calculateFee());
    return transactionType === 'mint'
      ? (baseAmount + fee).toFixed(2)
      : (baseAmount - fee).toFixed(2);
  };

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (transactionType === 'redeem' && !recipientAddress) {
      toast.error('Please enter a recipient address');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success(`${transactionType === 'mint' ? 'Mint' : 'Redeem'} request submitted successfully!`);

      // Reset form
      setAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          Mint new C12USD tokens or redeem existing ones
        </p>
      </div>

      {/* Transaction Type Selector */}
      <div className="flex gap-4">
        <GlassButton
          variant={transactionType === 'mint' ? 'primary' : 'secondary'}
          onClick={() => setTransactionType('mint')}
          className="flex-1 sm:flex-none"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Mint C12USD
        </GlassButton>
        <GlassButton
          variant={transactionType === 'redeem' ? 'primary' : 'secondary'}
          onClick={() => setTransactionType('redeem')}
          className="flex-1 sm:flex-none"
        >
          <ArrowUpRight className="w-4 h-4" />
          Redeem C12USD
        </GlassButton>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Transaction Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              {transactionType === 'mint' ? (
                <div className="w-12 h-12 bg-brand-success/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-brand-success" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-brand-warning/10 rounded-xl flex items-center justify-center">
                  <Minus className="w-6 h-6 text-brand-warning" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {transactionType === 'mint' ? 'Mint C12USD' : 'Redeem C12USD'}
                </h2>
                <p className="text-text-secondary">
                  {transactionType === 'mint'
                    ? 'Convert USD to C12USD tokens'
                    : 'Convert C12USD tokens back to USD'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Chain Selector */}
              <div>
                <label className="block text-sm font-medium mb-3">Select Network</label>
                <div className="grid grid-cols-2 gap-3">
                  <GlassButton
                    variant={selectedChain === 'BSC' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedChain('BSC')}
                    className="justify-center"
                  >
                    BSC (Binance Smart Chain)
                  </GlassButton>
                  <GlassButton
                    variant={selectedChain === 'POLYGON' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedChain('POLYGON')}
                    className="justify-center"
                  >
                    Polygon
                  </GlassButton>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <GlassInput
                  type="number"
                  label={transactionType === 'mint' ? 'USD Amount' : 'C12USD Amount'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  placeholder="0.00"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  {transactionType === 'mint' ? 'Payment Method' : 'Withdrawal Method'}
                </label>
                <div className="space-y-3">
                  {Object.entries(paymentMethods).map(([key, method]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPaymentMethod === key
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-border-light hover:border-brand-primary/50'
                      }`}
                      onClick={() => setSelectedPaymentMethod(key as PaymentMethod)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-glass rounded-lg flex items-center justify-center">
                            {method.icon}
                          </div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-text-secondary">
                              Fee: {method.fee} • {method.processingTime}
                            </div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPaymentMethod === key
                            ? 'border-brand-primary bg-brand-primary'
                            : 'border-border-light'
                        }`}>
                          {selectedPaymentMethod === key && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipient Address for Redeem */}
              {transactionType === 'redeem' && (
                <div>
                  <GlassInput
                    type="text"
                    label="Recipient Address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter wallet address or email"
                  />
                </div>
              )}

              {/* Transaction Button */}
              <GlassButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleTransaction}
                disabled={isProcessing || !amount}
              >
                {isProcessing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {transactionType === 'mint' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                    {transactionType === 'mint' ? 'Mint C12USD' : 'Redeem C12USD'}
                  </>
                )}
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Transaction Summary */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>

            {amount && parseFloat(amount) > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-medium">${amount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">Fee ({paymentMethods[selectedPaymentMethod].fee})</span>
                  <span className="font-medium">${calculateFee()}</span>
                </div>

                <div className="border-t border-border-light pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {transactionType === 'mint' ? 'Total to Pay' : 'You will receive'}
                    </span>
                    <span className="font-bold text-lg">${calculateTotal()}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex justify-between">
                    <span>Network</span>
                    <span>{selectedChain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Time</span>
                    <span>{paymentMethods[selectedPaymentMethod].processingTime}</span>
                  </div>
                  {transactionType === 'mint' && (
                    <div className="flex justify-between">
                      <span>You will receive</span>
                      <span>{amount || '0'} C12USD</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter an amount to see transaction summary</p>
              </div>
            )}
          </GlassCard>

          {/* Important Information */}
          <GlassCard className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-2">Important Information</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  {transactionType === 'mint' ? (
                    <>
                      <p>• C12USD tokens are minted 1:1 with USD</p>
                      <p>• Transactions are irreversible once confirmed</p>
                      <p>• Minimum amount: $10</p>
                      <p>• Maximum amount: $10,000 per transaction</p>
                    </>
                  ) : (
                    <>
                      <p>• C12USD tokens are redeemed 1:1 for USD</p>
                      <p>• Redemption requires identity verification</p>
                      <p>• Minimum amount: $10</p>
                      <p>• Processing may take 1-3 business days</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Status Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 glass-card rounded-lg">
              <CheckCircle className="w-5 h-5 text-brand-success" />
              <div className="flex-1">
                <div className="font-medium text-sm">System Status</div>
                <Badge variant="success" size="sm">Operational</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 glass-card rounded-lg">
              <Clock className="w-5 h-5 text-brand-warning" />
              <div className="flex-1">
                <div className="font-medium text-sm">Network Congestion</div>
                <Badge variant="warning" size="sm">Moderate</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}