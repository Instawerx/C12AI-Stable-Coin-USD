'use client';

import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { Badge } from './ui/Badge';
import { BuyTokensModal } from './BuyTokensModal';
import { TokenIcon } from './ui/TokenIcon';
import { ShoppingCart, TrendingUp, Shield, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';

interface TokenProductCardProps {
  tokenType: 'C12USD' | 'C12DAO';
  showPricing?: boolean;
  compact?: boolean;
}

export const TokenProductCard: React.FC<TokenProductCardProps> = ({
  tokenType,
  showPricing = true,
  compact = false,
}) => {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { address } = useAccount();

  const tokenData = {
    C12USD: {
      name: 'C12USD',
      fullName: 'C12USD Stablecoin',
      price: '$1.00',
      description: '1:1 USD backed stablecoin for stable value storage and transfers',
      color: 'from-blue-500 to-cyan-500',
      features: [
        { icon: Shield, text: 'Fully Collateralized' },
        { icon: TrendingUp, text: '1:1 USD Peg' },
        { icon: Zap, text: 'Instant Transfers' },
      ],
      minPurchase: '$10',
    },
    C12DAO: {
      name: 'C12DAO',
      fullName: 'C12DAO Governance',
      price: '$3.30',
      description: 'Blue-pink gradient droplet governance token for DAO participation',
      color: 'from-blue-500 to-pink-500',
      features: [
        { icon: Shield, text: 'Voting Rights' },
        { icon: TrendingUp, text: 'Revenue Sharing' },
        { icon: Zap, text: 'Exclusive Access' },
      ],
      minPurchase: '$3.30',
    },
  };

  const token = tokenData[tokenType];

  if (compact) {
    return (
      <>
        <GlassCard className="p-6 hover:shadow-lg transition-all cursor-pointer" hover>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TokenIcon type={tokenType} size={48} />
              <div>
                <h3 className="text-lg font-bold">{token.name}</h3>
                {showPricing && <p className="text-2xl font-bold text-brand-primary">{token.price}</p>}
              </div>
            </div>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => setIsBuyModalOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              Buy
            </GlassButton>
          </div>
          <p className="text-sm text-text-secondary">{token.description}</p>
        </GlassCard>

        <BuyTokensModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          userAddress={address}
          initialTokenType={tokenType}
        />
      </>
    );
  }

  return (
    <>
      <GlassCard className="p-8 hover:shadow-xl transition-all" hover>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <TokenIcon type={tokenType} size={64} />
            <div>
              <h3 className="text-2xl font-bold mb-1">{token.name}</h3>
              <p className="text-sm text-text-secondary">{token.fullName}</p>
            </div>
          </div>
          {tokenType === 'C12USD' && (
            <Badge variant="success">Stablecoin</Badge>
          )}
          {tokenType === 'C12DAO' && (
            <Badge variant="primary">Governance</Badge>
          )}
        </div>

        {/* Price */}
        {showPricing && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {token.price}
              </span>
              <span className="text-text-secondary">per token</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">Minimum: {token.minPurchase}</p>
          </div>
        )}

        {/* Description */}
        <p className="text-text-secondary mb-6">{token.description}</p>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {token.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${token.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                <feature.icon className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Buy Button */}
        <GlassButton
          variant="primary"
          className="w-full"
          size="lg"
          onClick={() => setIsBuyModalOpen(true)}
        >
          <ShoppingCart className="w-5 h-5" />
          Buy {token.name} Now
        </GlassButton>

        <p className="text-xs text-text-secondary text-center mt-3">
          Pay with Cash App or Stablecoins • Instant delivery
        </p>
      </GlassCard>

      <BuyTokensModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        userAddress={address}
        initialTokenType={tokenType}
      />
    </>
  );
};
