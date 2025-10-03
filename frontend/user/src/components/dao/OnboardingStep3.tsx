'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { WalletButton } from '../ui/WalletButton';
import { ProductCard, type MembershipTier } from './ProductCard';
import { TokenPurchaseModal } from './TokenPurchaseModal';
import { GlassCard } from '../ui/GlassCard';
import type { PurchaseData } from '../../app/app/dao/join/page';

interface OnboardingStep3Props {
  data: Partial<PurchaseData>;
  onUpdate: (data: Partial<PurchaseData>) => void;
}

const membershipPackages = [
  {
    tier: 'BRONZE' as MembershipTier,
    tokenAmount: 1000,
    usdPrice: 100,
    benefits: [
      'Basic voting rights',
      'Community access',
      'Monthly newsletter',
      'Member badge',
    ],
  },
  {
    tier: 'SILVER' as MembershipTier,
    tokenAmount: 5000,
    usdPrice: 450,
    benefits: [
      'Enhanced voting weight (1.5x)',
      'Priority support',
      'Early feature access',
      'Quarterly rewards',
      'Silver badge',
    ],
    discount: 10,
  },
  {
    tier: 'GOLD' as MembershipTier,
    tokenAmount: 25000,
    usdPrice: 2000,
    benefits: [
      'Premium voting weight (2.5x)',
      'Direct team access',
      'Beta testing privileges',
      'Monthly rewards',
      'Governance committee eligibility',
      'Gold badge',
    ],
    featured: true,
    discount: 20,
  },
  {
    tier: 'PLATINUM' as MembershipTier,
    tokenAmount: 100000,
    usdPrice: 7500,
    benefits: [
      'Maximum voting weight (5x)',
      'Advisory board access',
      'Custom features',
      'Weekly rewards',
      'Strategic partnerships',
      'Platinum badge',
    ],
    discount: 25,
  },
  {
    tier: 'DIAMOND' as MembershipTier,
    tokenAmount: 500000,
    usdPrice: 35000,
    benefits: [
      'Exclusive voting privileges (10x)',
      'Executive team access',
      'Revenue sharing',
      'Daily rewards',
      'Network expansion rights',
      'Diamond badge',
      'VIP status',
    ],
    discount: 30,
  },
];

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  data,
  onUpdate,
}) => {
  const { address, isConnected } = useAccount();
  const [selectedPackage, setSelectedPackage] = useState<{
    tier: MembershipTier;
    tokenAmount: number;
    usdPrice: number;
  } | null>(null);

  const handlePurchase = (tier: MembershipTier, tokenAmount: number) => {
    const pkg = membershipPackages.find(p => p.tier === tier);
    if (pkg) {
      setSelectedPackage({
        tier,
        tokenAmount,
        usdPrice: pkg.usdPrice * (pkg.discount ? 1 - pkg.discount / 100 : 1),
      });
    }
  };

  const handlePurchaseComplete = () => {
    if (selectedPackage) {
      onUpdate({
        tier: selectedPackage.tier,
        tokenAmount: selectedPackage.tokenAmount,
        paymentMethod: 'stripe', // This would come from the modal
        transactionId: `temp-${Date.now()}`, // This would come from actual payment
      });
      setSelectedPackage(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Get Your Membership Tokens</h2>
        <p className="text-text-secondary">
          Connect your wallet and purchase C12DAO tokens to activate your membership
        </p>
      </div>

      {/* Wallet Connection Status */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${isConnected ? 'bg-brand-success/20' : 'bg-brand-warning/20'}
          `}>
            <Wallet className={`w-6 h-6 ${isConnected ? 'text-brand-success' : 'text-brand-warning'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
            </h3>
            {isConnected ? (
              <p className="text-sm text-text-secondary font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            ) : (
              <p className="text-sm text-text-secondary">
                You need to connect your wallet to receive tokens
              </p>
            )}
          </div>
          {!isConnected && <WalletButton />}
          {isConnected && (
            <div className="flex items-center gap-2 text-brand-success">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Ready</span>
            </div>
          )}
        </div>
      </GlassCard>

      {!isConnected && (
        <GlassCard className="p-4 bg-brand-warning/10 border border-brand-warning/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-brand-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-brand-warning mb-1">
                Wallet Connection Required
              </p>
              <p className="text-text-secondary">
                Please connect your wallet before selecting a membership package. Your tokens will be sent to your connected wallet address.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Membership Packages */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-center">
          Choose Your Membership Tier
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {membershipPackages.map((pkg) => (
            <ProductCard
              key={pkg.tier}
              tier={pkg.tier}
              tokenAmount={pkg.tokenAmount}
              usdPrice={pkg.usdPrice}
              benefits={pkg.benefits}
              featured={pkg.featured}
              discount={pkg.discount}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </div>

      {/* Purchase Summary */}
      {data.tier && data.tokenAmount && (
        <GlassCard className="p-6 bg-brand-success/10 border border-brand-success/30">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-brand-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-brand-success mb-1">
                Purchase Confirmed
              </p>
              <p className="text-sm text-text-secondary">
                You've selected the <span className="font-semibold">{data.tier}</span> tier with{' '}
                <span className="font-semibold">{data.tokenAmount?.toLocaleString()} C12DAO tokens</span>.
                Your membership will be activated once your tokens are delivered.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Additional Info */}
      <div className="p-6 glass-card rounded-lg">
        <h4 className="font-medium mb-3">Why Purchase Tokens?</h4>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong>Voting Rights:</strong> More tokens = more voting power in DAO governance
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong>Tier Benefits:</strong> Higher tiers unlock exclusive features and rewards
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong>Value Appreciation:</strong> Tokens may increase in value as the ecosystem grows
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong>Revenue Sharing:</strong> Higher tiers participate in DAO revenue distribution
            </span>
          </li>
        </ul>
      </div>

      {/* Purchase Modal */}
      {selectedPackage && (
        <TokenPurchaseModal
          isOpen={true}
          onClose={() => setSelectedPackage(null)}
          tier={selectedPackage.tier}
          tokenAmount={selectedPackage.tokenAmount}
          usdPrice={selectedPackage.usdPrice}
        />
      )}
    </div>
  );
};
