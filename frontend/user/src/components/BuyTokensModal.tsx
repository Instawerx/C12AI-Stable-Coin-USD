'use client';

import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { Badge } from './ui/Badge';
import {
  DollarSign,
  Coins,
  ArrowRight,
  Info,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';
import {
  PRICING,
  CHAINS,
  calculatePurchasePreview,
  validatePurchaseAmount,
  generateReferenceId,
  type TokenType,
  type ChainType,
} from '../lib/pricing';
import { PaymentInstructions } from './PaymentInstructions';

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress?: string;
  initialTokenType?: TokenType;
}

type Step = 'select-token' | 'payment-method' | 'instructions';
type PaymentMethod = 'cash-app' | 'stablecoin';

export const BuyTokensModal: React.FC<BuyTokensModalProps> = ({
  isOpen,
  onClose,
  userAddress,
  initialTokenType = 'C12USD',
}) => {
  // State
  const [step, setStep] = useState<Step>('select-token');
  const [tokenType, setTokenType] = useState<TokenType>(initialTokenType);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash-app');
  const [chain, setChain] = useState<ChainType>('BSC');
  const [stablecoin, setStablecoin] = useState<'BUSD' | 'USDT' | 'USDC'>('BUSD');
  const [error, setError] = useState('');

  // Reset state when modal closes
  const handleClose = () => {
    setStep('select-token');
    setTokenType(initialTokenType);
    setAmount('');
    setError('');
    onClose();
  };

  // Update token type when initialTokenType changes
  React.useEffect(() => {
    if (isOpen) {
      setTokenType(initialTokenType);
    }
  }, [isOpen, initialTokenType]);

  // Calculate preview
  const tokenAmount =
    parseFloat(amount || '0') / PRICING[tokenType].priceUSD;

  // Handle continue from step 1
  const handleContinueToPayment = () => {
    const validation = validatePurchaseAmount(parseFloat(amount), tokenType);
    if (!validation.valid) {
      setError(validation.error || 'Invalid amount');
      return;
    }
    setError('');
    setStep('payment-method');
  };

  // Handle continue from step 2
  const handleContinueToInstructions = () => {
    setStep('instructions');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard variant="modal" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Buy Tokens</h2>
              <p className="text-sm text-text-secondary mt-1">
                {step === 'select-token' && 'Choose token and amount'}
                {step === 'payment-method' && 'Select payment method'}
                {step === 'instructions' && 'Complete payment'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'select-token'
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-primary/20 text-brand-primary'
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step !== 'select-token' ? 'bg-brand-primary' : 'bg-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'payment-method'
                    ? 'bg-brand-primary text-white'
                    : step === 'instructions'
                    ? 'bg-brand-primary/20 text-brand-primary'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step === 'instructions' ? 'bg-brand-primary' : 'bg-gray-300'
                }`}
              />
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 'instructions'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              3
            </div>
          </div>

          {/* Step 1: Select Token */}
          {step === 'select-token' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Select Token</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* C12USD Option */}
                  <button
                    onClick={() => setTokenType('C12USD')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      tokenType === 'C12USD'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30 hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">C12USD</div>
                        <div className="text-sm text-text-secondary">Stablecoin</div>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      {PRICING.C12USD.description}
                    </div>
                  </button>

                  {/* C12DAO Option */}
                  <button
                    onClick={() => setTokenType('C12DAO')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      tokenType === 'C12DAO'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30 hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl">
                        {PRICING.C12DAO.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-bold">C12DAO</div>
                        <div className="text-sm text-text-secondary">Governance</div>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      ${PRICING.C12DAO.priceUSD.toFixed(2)} per token
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                <GlassInput
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  leftIcon={<DollarSign className="w-5 h-5" />}
                  error={error}
                />
                <p className="text-xs text-text-secondary mt-1">
                  Minimum: ${PRICING[tokenType].minPurchase.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Chain</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setChain('BSC')}
                    className={`p-3 rounded-lg border transition-all ${
                      chain === 'BSC'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30 hover:border-brand-primary/30'
                    }`}
                  >
                    <div className="font-medium">{CHAINS.BSC.name}</div>
                    <div className="text-sm text-text-secondary">
                      {CHAINS.BSC.symbol}
                    </div>
                  </button>
                  <button
                    onClick={() => setChain('POLYGON')}
                    className={`p-3 rounded-lg border transition-all ${
                      chain === 'POLYGON'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30 hover:border-brand-primary/30'
                    }`}
                  >
                    <div className="font-medium">{CHAINS.POLYGON.name}</div>
                    <div className="text-sm text-text-secondary">
                      {CHAINS.POLYGON.symbol}
                    </div>
                  </button>
                </div>
              </div>

              {/* Preview */}
              {parseFloat(amount || '0') > 0 && (
                <GlassCard className="p-4 bg-brand-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">You'll receive:</span>
                    <span className="text-lg font-bold">
                      {tokenAmount.toFixed(2)} {tokenType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">On chain:</span>
                    <Badge variant="info" size="sm">
                      {chain}
                    </Badge>
                  </div>
                </GlassCard>
              )}

              <GlassButton
                variant="primary"
                className="w-full"
                onClick={handleContinueToPayment}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </GlassButton>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 'payment-method' && (
            <div className="space-y-6">
              <button
                onClick={() => setStep('select-token')}
                className="text-sm text-brand-primary hover:underline mb-4"
              >
                ← Back
              </button>

              <div>
                <label className="block text-sm font-medium mb-3">Payment Method</label>
                <div className="space-y-3">
                  {/* Cash App Option */}
                  <button
                    onClick={() => setPaymentMethod('cash-app')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash-app'
                        ? 'border-brand-success bg-brand-success/10'
                        : 'border-white/30 hover:border-brand-success/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-success rounded-xl flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold">Cash App</div>
                        <div className="text-sm text-text-secondary">
                          Pay with $C12Ai via Cash App
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        USD
                      </Badge>
                    </div>
                  </button>

                  {/* Stablecoin Option */}
                  <button
                    onClick={() => setPaymentMethod('stablecoin')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'stablecoin'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30 hover:border-brand-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold">Stablecoin</div>
                        <div className="text-sm text-text-secondary">
                          Pay with BUSD, USDT, or USDC
                        </div>
                      </div>
                      <Badge variant="info" size="sm">
                        Crypto
                      </Badge>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stablecoin Selection */}
              {paymentMethod === 'stablecoin' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Stablecoin
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['BUSD', 'USDT', 'USDC'] as const).map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setStablecoin(coin)}
                        className={`p-3 rounded-lg border transition-all ${
                          stablecoin === coin
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-white/30 hover:border-brand-primary/30'
                        }`}
                      >
                        <div className="font-bold">{coin}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <GlassButton
                variant="primary"
                className="w-full"
                onClick={handleContinueToInstructions}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </GlassButton>
            </div>
          )}

          {/* Step 3: Payment Instructions */}
          {step === 'instructions' && (
            <PaymentInstructions
              tokenType={tokenType}
              amount={amount}
              tokenAmount={tokenAmount}
              chain={chain}
              paymentMethod={paymentMethod}
              stablecoin={stablecoin}
              userAddress={userAddress}
              onBack={() => setStep('payment-method')}
              onClose={handleClose}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
};
