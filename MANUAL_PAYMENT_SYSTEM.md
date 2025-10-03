# 💳 Manual Payment System - Immediate Implementation

**Version:** 1.0
**Date:** October 2, 2025
**Priority:** HIGH - Immediate Revenue Generation
**Status:** Ready for Implementation

---

## 🎯 Purpose

Provide **immediate purchase capability** for C12USD and C12DAO tokens while Stripe/Cash App integrations are being developed. Users can pay via:
1. Cash App ($C12Ai)
2. Stablecoins (BUSD, USDT, USDC) to MetaMask wallet
3. QR Code payment

---

## 💰 Payment Addresses

### Primary Collection Addresses:
```
Cash App:       https://cash.app/$C12Ai
MetaMask:       0x7903c63CB9f42284d03BC2a124474760f9C1390b
QR Code:        [Stored at: assets/qr/cashapp-payment-qr.png]
```

### Accepted Stablecoins (MetaMask):
- **BUSD** (Binance USD) - BSC & Polygon
- **USDT** (Tether) - BSC & Polygon
- **USDC** (USD Coin) - BSC & Polygon

### Supported Chains:
- BSC (BNB Chain)
- Polygon

---

## 🔄 User Flow: Manual Purchase

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard → "Buy Tokens" Button                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Token Selection Modal                                       │
│ ├─ Select token type:                                       │
│ │   • C12USD (Stablecoin) - 1:1 USD                         │
│ │   • C12DAO (Governance) - Current market price            │
│ ├─ Enter amount in USD                                      │
│ ├─ Preview:                                                 │
│ │   • Token amount you'll receive                           │
│ │   • Exchange rate (for C12DAO)                            │
│ │   • Processing fee (if any)                               │
│ └─ Continue →                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Payment Method Selection                                    │
│ ├─ Choose payment method:                                   │
│ │   ○ Cash App (USD)                                        │
│ │   ○ Stablecoin (BUSD/USDT/USDC)                           │
│ ├─ Select delivery chain (BSC/Polygon)                      │
│ └─ Continue →                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
    Cash App                              Stablecoin
        │                                       │
        ↓                                       ↓
┌─────────────────────┐           ┌─────────────────────────┐
│ Cash App Payment    │           │ Stablecoin Payment      │
│ Instructions        │           │ Instructions            │
│                     │           │                         │
│ 1. Payment Address: │           │ 1. Select stablecoin:   │
│    $C12Ai           │           │    • BUSD               │
│                     │           │    • USDT               │
│ 2. Payment Amount:  │           │    • USDC               │
│    $XXX.XX          │           │                         │
│                     │           │ 2. Send to address:     │
│ 3. Payment Note:    │           │    0x7903c63...f9C1390b │
│    C12-XXXXXX       │           │                         │
│    (Reference ID)   │           │ 3. Amount: $XXX BUSD    │
│                     │           │                         │
│ 4. QR Code Option:  │           │ 4. Network: BSC/Polygon │
│    [QR Code Image]  │           │                         │
│                     │           │ 5. Transaction ID:      │
│ Actions:            │           │    C12-XXXXXX           │
│ • Copy $Cashtag     │           │                         │
│ • Open Cash App     │           │ Actions:                │
│ • Copy Reference    │           │ • Copy Address          │
│ • Download QR       │           │ • Open MetaMask         │
│                     │           │ • Copy Reference        │
│ After Payment:      │           │                         │
│ • Upload screenshot │           │ After Payment:          │
│ • Enter Cashtag     │           │ • Enter TX Hash         │
│ • Submit for review │           │ • Submit for review     │
└─────────────────────┘           └─────────────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Payment Submission Form                                     │
│ ├─ Upload Payment Proof:                                    │
│ │   • Screenshot (Cash App)                                 │
│ │   • Transaction Hash (Stablecoin)                         │
│ ├─ Enter Sender Info:                                       │
│ │   • Cash App Cashtag OR Wallet Address                    │
│ ├─ Transaction Reference: C12-XXXXXX (auto-filled)          │
│ ├─ Additional Notes (optional)                              │
│ └─ Submit → Create ManualPayment record                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Payment Pending Screen                                      │
│ ├─ Status: PENDING_VERIFICATION                             │
│ ├─ Reference: C12-XXXXXX                                    │
│ ├─ Estimated verification time: 15-60 minutes               │
│ ├─ What happens next:                                       │
│ │   1. Our team verifies your payment                       │
│ │   2. Tokens are minted to your wallet                     │
│ │   3. You receive confirmation notification                │
│ ├─ Track Status: View in "Transaction History"              │
│ └─ Need help? Contact Support                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Admin Verification (Admin Dashboard)                        │
│ ├─ Manual Payment Queue shows new submission                │
│ ├─ Admin reviews:                                           │
│ │   • Payment proof (screenshot/TX hash)                    │
│ │   • Amount matches request                                │
│ │   • Sender info verification                              │
│ ├─ Admin actions:                                           │
│ │   • Approve → Trigger mint/distribution                   │
│ │   • Reject → Request more info or refund                  │
│ │   • Flag for review                                       │
│ └─ Decision logged in audit trail                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
    Approved                               Rejected
        │                                       │
        ↓                                       ↓
┌─────────────────────┐           ┌─────────────────────────┐
│ Token Distribution  │           │ Rejection Notice        │
│                     │           │                         │
│ 1. Generate mint    │           │ • User notified         │
│    signature (if    │           │ • Reason provided       │
│    C12USD)          │           │ • Refund initiated      │
│                     │           │   (if applicable)       │
│ 2. Mint/Transfer    │           │                         │
│    tokens to user   │           │ Status: REJECTED        │
│    wallet           │           │                         │
│                     │           └─────────────────────────┘
│ 3. Update status:   │
│    COMPLETED        │
│                     │
│ 4. Send notification│
│                     │
└─────────────────────┘
        │
        ↓
┌─────────────────────────────────────────────────────────────┐
│ Completion Notification                                     │
│ ├─ Title: "Tokens Delivered!"                               │
│ ├─ Message: "Your XXX C12USD/C12DAO have been sent"         │
│ ├─ Transaction details:                                     │
│ │   • Amount received                                       │
│ │   • Delivery chain                                        │
│ │   • TX hash (view on explorer)                            │
│ ├─ Updated balance shown in dashboard                       │
│ └─ Transaction appears in history                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Addition

### New Model: ManualPayment

```prisma
model ManualPayment {
  id              String              @id @default(cuid())
  referenceId     String              @unique // Format: C12-XXXXXX
  userId          String

  // Token details
  tokenType       ManualPaymentTokenType
  requestedAmount Decimal             @db.Decimal(18, 6) // USD amount
  tokenAmount     Decimal             @db.Decimal(18, 18) // Token amount to receive
  deliveryChain   Chain               // BSC or POLYGON

  // Payment details
  paymentMethod   ManualPaymentMethod
  paymentAmount   Decimal             @db.Decimal(18, 6)

  // Cash App specific
  cashAppCashtag  String?             // Sender's cashtag
  cashAppProof    String?             // Screenshot URL (Firebase Storage)

  // Stablecoin specific
  stablecoinType  StablecoinType?     // BUSD, USDT, USDC
  senderAddress   String?             // Wallet address
  txHash          String?             // Blockchain TX hash
  blockchainChain Chain?              // Chain where payment was sent

  // Status tracking
  status          ManualPaymentStatus @default(PENDING_SUBMISSION)

  // Verification
  verifiedBy      String?             // Admin user ID
  verifiedAt      DateTime?
  rejectionReason String?

  // Distribution
  distributionTxHash String?          // TX hash of token distribution
  distributedAt   DateTime?

  // Additional
  userNotes       String?             // User-provided notes
  adminNotes      String?             // Admin-provided notes

  // Timestamps
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  expiresAt       DateTime            // 24 hours from creation

  // Relationships
  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status, createdAt])
  @@index([userId])
  @@index([referenceId])
  @@map("manual_payments")
}

enum ManualPaymentTokenType {
  C12USD
  C12DAO
}

enum ManualPaymentMethod {
  CASH_APP
  STABLECOIN
}

enum StablecoinType {
  BUSD
  USDT
  USDC
}

enum ManualPaymentStatus {
  PENDING_SUBMISSION      // User hasn't submitted payment proof yet
  PENDING_VERIFICATION    // Submitted, awaiting admin review
  VERIFYING               // Admin is reviewing
  APPROVED                // Approved, awaiting distribution
  DISTRIBUTING            // Tokens being minted/transferred
  COMPLETED               // Tokens delivered
  REJECTED                // Payment rejected
  EXPIRED                 // Submission window expired (24h)
  REFUNDED                // Payment refunded
}
```

### Update User Model

```prisma
model User {
  // ... existing fields ...

  manualPayments  ManualPayment[]

  // ... rest of model ...
}
```

---

## 🎨 UI Components

### 1. Buy Tokens Modal (`components/BuyTokensModal.tsx`)

```typescript
'use client';

import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { Badge } from './ui/Badge';
import {
  DollarSign, Coins, ArrowRight, Info,
  Smartphone, Wallet, QrCode
} from 'lucide-react';

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyTokensModal: React.FC<BuyTokensModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'select-token' | 'payment-method' | 'instructions'>(
    'select-token'
  );
  const [tokenType, setTokenType] = useState<'C12USD' | 'C12DAO'>('C12USD');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash-app' | 'stablecoin'>('cash-app');
  const [chain, setChain] = useState<'BSC' | 'POLYGON'>('BSC');
  const [stablecoin, setStablecoin] = useState<'BUSD' | 'USDT' | 'USDC'>('BUSD');

  if (!isOpen) return null;

  // Calculate token amount with official pricing
  const C12USD_PRICE = 1.00;  // Fixed 1:1 USD
  const C12DAO_PRICE = 3.30;  // $3.30 per token

  const tokenAmount = tokenType === 'C12USD'
    ? parseFloat(amount || '0') / C12USD_PRICE
    : parseFloat(amount || '0') / C12DAO_PRICE;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard variant="modal" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Buy Tokens</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {/* Step 1: Select Token */}
          {step === 'select-token' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Select Token</label>
                <div className="grid grid-cols-2 gap-4">
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
                    <div className="text-sm text-text-secondary">1:1 USD Backed</div>
                  </button>

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
                        💧
                      </div>
                      <div className="text-left">
                        <div className="font-bold">C12DAO</div>
                        <div className="text-sm text-text-secondary">Governance</div>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">$3.30 per token</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                <GlassInput
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  leftIcon={<DollarSign className="w-5 h-5" />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Delivery Chain</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setChain('BSC')}
                    className={`p-3 rounded-lg border transition-all ${
                      chain === 'BSC'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30'
                    }`}
                  >
                    <div className="font-medium">BSC</div>
                    <div className="text-sm text-text-secondary">BNB Chain</div>
                  </button>
                  <button
                    onClick={() => setChain('POLYGON')}
                    className={`p-3 rounded-lg border transition-all ${
                      chain === 'POLYGON'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30'
                    }`}
                  >
                    <div className="font-medium">Polygon</div>
                    <div className="text-sm text-text-secondary">Matic Network</div>
                  </button>
                </div>
              </div>

              {/* Preview */}
              <GlassCard className="p-4 bg-brand-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">You'll receive:</span>
                  <span className="text-lg font-bold">
                    {tokenAmount.toLocaleString()} {tokenType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">On chain:</span>
                  <Badge variant="info" size="sm">{chain}</Badge>
                </div>
              </GlassCard>

              <GlassButton
                variant="primary"
                className="w-full"
                onClick={() => setStep('payment-method')}
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
                  <button
                    onClick={() => setPaymentMethod('cash-app')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash-app'
                        ? 'border-brand-success bg-brand-success/10'
                        : 'border-white/30'
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
                      <Badge variant="success" size="sm">USD</Badge>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('stablecoin')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'stablecoin'
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-white/30'
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
                      <Badge variant="info" size="sm">Crypto</Badge>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'stablecoin' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Stablecoin</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['BUSD', 'USDT', 'USDC'] as const).map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setStablecoin(coin)}
                        className={`p-3 rounded-lg border transition-all ${
                          stablecoin === coin
                            ? 'border-brand-primary bg-brand-primary/10'
                            : 'border-white/30'
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
                onClick={() => setStep('instructions')}
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
              onBack={() => setStep('payment-method')}
              onClose={onClose}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
};
```

### 2. Payment Instructions Component

```typescript
interface PaymentInstructionsProps {
  tokenType: 'C12USD' | 'C12DAO';
  amount: string;
  tokenAmount: number;
  chain: 'BSC' | 'POLYGON';
  paymentMethod: 'cash-app' | 'stablecoin';
  stablecoin: 'BUSD' | 'USDT' | 'USDC';
  onBack: () => void;
  onClose: () => void;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({
  tokenType,
  amount,
  tokenAmount,
  chain,
  paymentMethod,
  stablecoin,
  onBack,
  onClose,
}) => {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [txHash, setTxHash] = useState('');
  const [senderInfo, setSenderInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const referenceId = `C12-${Date.now().toString(36).toUpperCase()}`;

  const ADMIN_ADDRESS = '0x7903c63CB9f42284d03BC2a124474760f9C1390b';
  const CASH_APP_CASHTAG = '$C12Ai';
  const CASH_APP_URL = 'https://cash.app/$C12Ai';

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Upload screenshot if Cash App
      let proofUrl = null;
      if (paymentMethod === 'cash-app' && screenshot) {
        proofUrl = await uploadScreenshot(screenshot);
      }

      // Create ManualPayment record
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
        userNotes: notes,
      };

      await createManualPayment(paymentData);

      // Show success and redirect
      alert('Payment submitted! You will be notified when verified.');
      onClose();

    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Error submitting payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-brand-primary hover:underline">
        ← Back
      </button>

      {/* Instructions */}
      <GlassCard className="p-4 bg-brand-info/10 border-brand-info/30">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-brand-info mt-0.5" />
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
          <GlassInput value={referenceId} readOnly />
          <GlassButton
            variant="secondary"
            onClick={() => navigator.clipboard.writeText(referenceId)}
          >
            Copy
          </GlassButton>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Include this reference in your payment
        </p>
      </div>

      {/* Cash App Instructions */}
      {paymentMethod === 'cash-app' && (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">1. Send Payment To</label>
              <div className="flex gap-2">
                <GlassInput value={CASH_APP_CASHTAG} readOnly />
                <GlassButton
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(CASH_APP_CASHTAG)}
                >
                  Copy
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => window.open(CASH_APP_URL, '_blank')}
                >
                  <Smartphone className="w-4 h-4" />
                  Open Cash App
                </GlassButton>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">2. Payment Amount</label>
              <GlassInput
                value={`$${parseFloat(amount).toFixed(2)}`}
                readOnly
                leftIcon={<DollarSign className="w-5 h-5" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">3. QR Code (Optional)</label>
              <GlassCard className="p-4 text-center">
                <img
                  src="/assets/qr/cashapp-payment-qr.png"
                  alt="Cash App QR Code"
                  className="w-48 h-48 mx-auto mb-3"
                />
                <p className="text-sm text-text-secondary">
                  Scan with Cash App to pay directly
                </p>
              </GlassCard>
            </div>
          </div>

          {/* Proof of Payment */}
          <div className="border-t border-white/20 pt-6">
            <h3 className="font-medium mb-4">Submit Payment Proof</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="w-full"
                />
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
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg"
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
              <label className="block text-sm font-medium mb-2">1. Send {stablecoin} To</label>
              <div className="flex gap-2">
                <GlassInput value={ADMIN_ADDRESS} readOnly className="font-mono text-sm" />
                <GlassButton
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(ADMIN_ADDRESS)}
                >
                  Copy
                </GlassButton>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">2. Payment Amount</label>
              <GlassInput
                value={`${parseFloat(amount).toFixed(2)} ${stablecoin}`}
                readOnly
                leftIcon={<Coins className="w-5 h-5" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">3. Network</label>
              <GlassInput value={chain} readOnly />
              <p className="text-xs text-brand-warning mt-1">
                ⚠️ Important: Send on {chain} network only!
              </p>
            </div>
          </div>

          {/* Proof of Payment */}
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
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg"
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
            <span className="font-medium">{tokenAmount.toLocaleString()} {tokenType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Payment:</span>
            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Delivery Chain:</span>
            <Badge variant="info" size="sm">{chain}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Reference:</span>
            <span className="font-mono text-xs">{referenceId}</span>
          </div>
        </div>
      </GlassCard>

      {/* Submit */}
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

// Helper functions
async function uploadScreenshot(file: File): Promise<string> {
  // Upload to Firebase Storage
  // Return download URL
  return 'https://storage.example.com/screenshots/...';
}

async function createManualPayment(data: any): Promise<void> {
  // Call Firebase Function to create ManualPayment record
  // Return promise
}
```

---

## 🔧 Backend Implementation

### Firebase Function: Create Manual Payment

```typescript
// functions/src/manualPayments/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';

const firestore = getFirestoreInstance();

export const createManualPayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const {
      referenceId,
      tokenType,
      requestedAmount,
      tokenAmount,
      deliveryChain,
      paymentMethod,
      paymentAmount,
      cashAppCashtag,
      cashAppProof,
      stablecoinType,
      senderAddress,
      txHash,
      blockchainChain,
      userNotes,
    } = data;

    // Validation
    if (!referenceId || !tokenType || !requestedAmount || !deliveryChain || !paymentMethod) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Create ManualPayment record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await firestore.collection('manual_payments').add({
      referenceId,
      userId,
      tokenType,
      requestedAmount,
      tokenAmount,
      deliveryChain,
      paymentMethod,
      paymentAmount,
      cashAppCashtag: cashAppCashtag || null,
      cashAppProof: cashAppProof || null,
      stablecoinType: stablecoinType || null,
      senderAddress: senderAddress || null,
      txHash: txHash || null,
      blockchainChain: blockchainChain || null,
      status: 'PENDING_VERIFICATION',
      userNotes: userNotes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
    });

    // Create notification for admins
    await firestore.collection('notifications').add({
      type: 'ADMIN_MANUAL_PAYMENT',
      title: 'New Manual Payment Submission',
      message: `${tokenType} purchase: $${requestedAmount} via ${paymentMethod}`,
      data: { referenceId, tokenType, requestedAmount, paymentMethod },
      priority: 'HIGH',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'manual_payment',
      entityId: referenceId,
      userAddress: userId,
      newData: { tokenType, requestedAmount, paymentMethod, status: 'PENDING_VERIFICATION' },
      severity: 'INFO',
      category: 'FINANCIAL',
    });

    return { success: true, referenceId };
  } catch (error) {
    console.error('Error creating manual payment:', error);
    throw error;
  }
});

export const verifyManualPayment = functions.https.onCall(async (data, context) => {
  try {
    // Check admin permissions
    if (!hasAdminRole(context.auth, 'FINANCE_ADMIN')) {
      throw new functions.https.HttpsError('permission-denied', 'Finance admin access required');
    }

    const { paymentId, approved, rejectionReason, adminNotes } = data;

    const paymentRef = firestore.collection('manual_payments').doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Payment not found');
    }

    const payment = paymentDoc.data();

    if (approved) {
      // Update status to APPROVED
      await paymentRef.update({
        status: 'APPROVED',
        verifiedBy: context.auth.uid,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        adminNotes: adminNotes || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Trigger token distribution
      await distributeTokens(paymentDoc.id, payment);

      // Notify user
      await sendNotification(payment.userId, {
        title: 'Payment Approved!',
        body: `Your ${payment.tokenType} purchase has been approved. Tokens will be delivered shortly.`,
        type: 'manual_payment_approved',
        data: { referenceId: payment.referenceId },
      });
    } else {
      // Update status to REJECTED
      await paymentRef.update({
        status: 'REJECTED',
        verifiedBy: context.auth.uid,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectionReason,
        adminNotes: adminNotes || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Notify user
      await sendNotification(payment.userId, {
        title: 'Payment Rejected',
        body: `Your payment has been rejected. Reason: ${rejectionReason}`,
        type: 'manual_payment_rejected',
        data: { referenceId: payment.referenceId, reason: rejectionReason },
      });
    }

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'manual_payment',
      entityId: payment.referenceId,
      adminAddress: context.auth.uid,
      oldData: { status: payment.status },
      newData: { status: approved ? 'APPROVED' : 'REJECTED', rejectionReason },
      severity: 'INFO',
      category: 'FINANCIAL',
    });

    return { success: true };
  } catch (error) {
    console.error('Error verifying manual payment:', error);
    throw error;
  }
});

async function distributeTokens(paymentId: string, payment: any) {
  // Update status to DISTRIBUTING
  await firestore.collection('manual_payments').doc(paymentId).update({
    status: 'DISTRIBUTING',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  try {
    let distributionTxHash;

    if (payment.tokenType === 'C12USD') {
      // Generate mint signature and create MintReceipt
      distributionTxHash = await mintC12USD(payment);
    } else {
      // Transfer C12DAO from treasury/admin wallet
      distributionTxHash = await transferC12DAO(payment);
    }

    // Update status to COMPLETED
    await firestore.collection('manual_payments').doc(paymentId).update({
      status: 'COMPLETED',
      distributionTxHash,
      distributedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify user
    await sendNotification(payment.userId, {
      title: 'Tokens Delivered!',
      body: `Your ${payment.tokenAmount} ${payment.tokenType} have been delivered to ${payment.deliveryChain}`,
      type: 'manual_payment_completed',
      data: {
        referenceId: payment.referenceId,
        tokenType: payment.tokenType,
        tokenAmount: payment.tokenAmount,
        distributionTxHash,
      },
    });
  } catch (error) {
    console.error('Error distributing tokens:', error);

    // Update status to FAILED
    await firestore.collection('manual_payments').doc(paymentId).update({
      status: 'REJECTED',
      rejectionReason: 'Distribution failed',
      adminNotes: error.message,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    throw error;
  }
}

async function mintC12USD(payment: any): Promise<string> {
  // Create MintReceipt for manual payment
  // Generate signature from signer service
  // Return mint TX hash
  return '0x...';
}

async function transferC12DAO(payment: any): Promise<string> {
  // Transfer C12DAO from admin/treasury wallet
  // Return transfer TX hash
  return '0x...';
}

export const manualPaymentFunctions = {
  createManualPayment,
  verifyManualPayment,
};
```

---

## 🎯 Admin Dashboard Integration

### Manual Payment Queue (`admin/dashboard/finance/manual-payments`)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { Eye, Check, X, ExternalLink } from 'lucide-react';

export default function ManualPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch manual payments
  useEffect(() => {
    // Real-time listener for manual_payments collection
    const unsubscribe = firestore
      .collection('manual_payments')
      .where('status', 'in', ['PENDING_VERIFICATION', 'VERIFYING', 'APPROVED'])
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(data);
      });

    return () => unsubscribe();
  }, []);

  const columns = [
    { key: 'referenceId', label: 'Reference' },
    {
      key: 'tokenType',
      label: 'Token',
      render: (value) => (
        <Badge variant="info" size="sm">{value}</Badge>
      ),
    },
    {
      key: 'requestedAmount',
      label: 'Amount',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (value) => value === 'CASH_APP' ? 'Cash App' : 'Stablecoin',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const variant =
          value === 'PENDING_VERIFICATION' ? 'warning' :
          value === 'APPROVED' ? 'success' :
          value === 'REJECTED' ? 'danger' : 'default';
        return <Badge variant={variant} size="sm">{value}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => new Date(value.toDate()).toLocaleString(),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => setSelectedPayment(row)}
        >
          <Eye className="w-4 h-4" />
          Review
        </GlassButton>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manual Payment Queue</h1>
        <p className="text-text-secondary">
          Review and approve manual token purchases
        </p>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        searchable
        paginated
      />

      {selectedPayment && (
        <PaymentReviewModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
```

### Payment Review Modal

```typescript
const PaymentReviewModal = ({ payment, onClose }) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const handleApprove = async () => {
    setApproving(true);
    try {
      await verifyManualPayment({
        paymentId: payment.id,
        approved: true,
        adminNotes,
      });
      alert('Payment approved!');
      onClose();
    } catch (error) {
      alert('Error approving payment');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    setRejecting(true);
    try {
      await verifyManualPayment({
        paymentId: payment.id,
        approved: false,
        rejectionReason,
        adminNotes,
      });
      alert('Payment rejected');
      onClose();
    } catch (error) {
      alert('Error rejecting payment');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard variant="modal" className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Review Payment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Payment Details */}
            <GlassCard className="p-4">
              <h3 className="font-medium mb-3">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">Reference:</span>
                  <p className="font-medium font-mono">{payment.referenceId}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Token:</span>
                  <p className="font-medium">{payment.tokenType}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Amount:</span>
                  <p className="font-medium">
                    {payment.tokenAmount} {payment.tokenType} (${payment.requestedAmount})
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Chain:</span>
                  <p className="font-medium">{payment.deliveryChain}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Method:</span>
                  <p className="font-medium">
                    {payment.paymentMethod === 'CASH_APP' ? 'Cash App' : `${payment.stablecoinType} (Stablecoin)`}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Status:</span>
                  <Badge variant="warning">{payment.status}</Badge>
                </div>
              </div>
            </GlassCard>

            {/* Cash App Proof */}
            {payment.paymentMethod === 'CASH_APP' && (
              <GlassCard className="p-4">
                <h3 className="font-medium mb-3">Cash App Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary">Sender Cashtag:</span>
                    <p className="font-medium">{payment.cashAppCashtag}</p>
                  </div>
                  {payment.cashAppProof && (
                    <div>
                      <span className="text-sm text-text-secondary">Payment Screenshot:</span>
                      <img
                        src={payment.cashAppProof}
                        alt="Payment proof"
                        className="mt-2 max-w-md rounded-lg border border-white/30"
                      />
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Stablecoin Details */}
            {payment.paymentMethod === 'STABLECOIN' && (
              <GlassCard className="p-4">
                <h3 className="font-medium mb-3">Stablecoin Transaction</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary">Sender Address:</span>
                    <p className="font-medium font-mono text-sm">{payment.senderAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Transaction Hash:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono text-sm">{payment.txHash}</p>
                      <a
                        href={`https://bscscan.com/tx/${payment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 text-brand-primary" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Network:</span>
                    <p className="font-medium">{payment.blockchainChain}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* User Notes */}
            {payment.userNotes && (
              <GlassCard className="p-4">
                <h3 className="font-medium mb-2">User Notes</h3>
                <p className="text-sm text-text-secondary">{payment.userNotes}</p>
              </GlassCard>
            )}

            {/* Admin Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this payment..."
                />
              </div>

              {rejecting && (
                <div>
                  <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
                  <textarea
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg"
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (will be sent to user)..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                {!rejecting ? (
                  <>
                    <GlassButton
                      variant="danger"
                      className="flex-1"
                      onClick={() => setRejecting(true)}
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      className="flex-1"
                      onClick={handleApprove}
                      loading={approving}
                    >
                      <Check className="w-5 h-5" />
                      Approve & Distribute
                    </GlassButton>
                  </>
                ) : (
                  <>
                    <GlassButton
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setRejecting(false)}
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="danger"
                      className="flex-1"
                      onClick={handleReject}
                      loading={rejecting}
                    >
                      Confirm Rejection
                    </GlassButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
```

---

## 📅 Implementation Timeline

### Week 1: Database & Backend (3 days)
- ✅ Add ManualPayment model to Prisma schema
- ✅ Run migration
- ✅ Implement Firebase Functions (create, verify)
- ✅ Set up Firebase Storage for screenshots

### Week 1-2: Frontend (4 days)
- ✅ Create BuyTokensModal component
- ✅ Create PaymentInstructions component
- ✅ Add QR code image to assets
- ✅ Integrate into user dashboard
- ✅ Test user flow end-to-end

### Week 2: Admin Integration (2 days)
- ✅ Create ManualPaymentsPage in admin dashboard
- ✅ Create PaymentReviewModal
- ✅ Add real-time notifications for new payments
- ✅ Test admin verification flow

### Total: 1.5 weeks

---

## ✅ Testing Checklist

- [ ] User can initiate purchase from dashboard
- [ ] Cash App payment instructions display correctly
- [ ] QR code loads and displays properly
- [ ] Stablecoin payment instructions show correct address
- [ ] Screenshot upload works (Cash App)
- [ ] TX hash validation works (Stablecoin)
- [ ] ManualPayment record created successfully
- [ ] Admin receives notification of new payment
- [ ] Admin can view payment details
- [ ] Admin can approve payment
- [ ] Tokens distributed correctly after approval
- [ ] User receives completion notification
- [ ] Admin can reject payment with reason
- [ ] User receives rejection notification
- [ ] Payment expires after 24 hours
- [ ] Audit trail complete for all actions

---

**END OF MANUAL PAYMENT SYSTEM SPECIFICATION**

*This system enables immediate revenue generation while maintaining security, transparency, and user experience quality.*
