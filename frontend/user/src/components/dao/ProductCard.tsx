'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Trophy,
  Crown,
  Diamond,
  Award,
  Zap,
  Check,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';

export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface ProductCardProps {
  tier: MembershipTier;
  tokenAmount: number;
  usdPrice: number;
  benefits: string[];
  featured?: boolean;
  discount?: number;
  onPurchase: (tier: MembershipTier, amount: number) => void;
}

const tierConfig = {
  BRONZE: {
    name: 'Bronze',
    icon: Award,
    gradient: 'from-orange-400 to-orange-600',
    bgGradient: 'from-orange-500/10 to-orange-600/10',
    borderColor: 'border-orange-400/50',
    textColor: 'text-orange-400',
    description: 'Perfect for getting started',
  },
  SILVER: {
    name: 'Silver',
    icon: Star,
    gradient: 'from-gray-400 to-gray-600',
    bgGradient: 'from-gray-500/10 to-gray-600/10',
    borderColor: 'border-gray-400/50',
    textColor: 'text-gray-400',
    description: 'Enhanced benefits & rewards',
  },
  GOLD: {
    name: 'Gold',
    icon: Trophy,
    gradient: 'from-yellow-400 to-yellow-600',
    bgGradient: 'from-yellow-500/10 to-yellow-600/10',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-yellow-400',
    description: 'Premium governance access',
  },
  PLATINUM: {
    name: 'Platinum',
    icon: Crown,
    gradient: 'from-blue-400 to-blue-600',
    bgGradient: 'from-blue-500/10 to-blue-600/10',
    borderColor: 'border-blue-400/50',
    textColor: 'text-blue-400',
    description: 'Elite membership status',
  },
  DIAMOND: {
    name: 'Diamond',
    icon: Diamond,
    gradient: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-500/10 to-purple-600/10',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-400',
    description: 'Ultimate exclusive tier',
  },
};

export const ProductCard: React.FC<ProductCardProps> = ({
  tier,
  tokenAmount,
  usdPrice,
  benefits,
  featured = false,
  discount = 0,
  onPurchase,
}) => {
  const config = tierConfig[tier];
  const Icon = config.icon;
  const finalPrice = discount > 0 ? usdPrice * (1 - discount / 100) : usdPrice;
  const savings = usdPrice - finalPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="primary" size="lg" className="shadow-lg">
            <Zap className="w-3 h-3" />
            Most Popular
          </Badge>
        </div>
      )}

      <GlassCard
        className={`
          p-6 h-full flex flex-col
          ${featured ? 'ring-2 ring-brand-primary shadow-xl' : ''}
          border-2 ${config.borderColor}
          bg-gradient-to-br ${config.bgGradient}
          transition-all duration-300
        `}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`
            w-20 h-20 mx-auto mb-4
            bg-gradient-to-br ${config.gradient}
            rounded-2xl
            flex items-center justify-center
            shadow-lg
            ${featured ? 'animate-pulse' : ''}
          `}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-2xl font-bold mb-2">{config.name} Tier</h3>
          <p className="text-sm text-text-secondary">{config.description}</p>
        </div>

        {/* Token Amount */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`
              w-8 h-8 rounded-full
              bg-gradient-to-br ${config.gradient}
              flex items-center justify-center
            `}>
              <span className="text-white text-xs font-bold">C12</span>
            </div>
            <span className="text-3xl font-bold">
              {tokenAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-text-secondary">C12DAO Tokens</p>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6 p-4 glass-card rounded-lg">
          {discount > 0 ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl font-bold">${finalPrice.toLocaleString()}</span>
                <span className="text-lg text-text-secondary line-through">
                  ${usdPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="success" size="sm">
                  Save ${savings.toLocaleString()} ({discount}% OFF)
                </Badge>
              </div>
            </>
          ) : (
            <div className="text-3xl font-bold">${usdPrice.toLocaleString()}</div>
          )}
          <p className="text-xs text-text-secondary mt-2">
            ${(finalPrice / tokenAmount).toFixed(4)} per token
          </p>
        </div>

        {/* Benefits */}
        <div className="flex-1 mb-6">
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide">
            Benefits Included
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.textColor}`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <GlassButton
          variant={featured ? 'primary' : 'secondary'}
          className={`
            w-full justify-center
            ${featured ? 'shadow-lg' : ''}
            bg-gradient-to-r ${config.gradient}
            text-white border-0
            hover:opacity-90
          `}
          onClick={() => onPurchase(tier, tokenAmount)}
        >
          <Zap className="w-4 h-4" />
          Quick Buy
          <ArrowRight className="w-4 h-4" />
        </GlassButton>

        {/* Additional Info */}
        <p className="text-xs text-center text-text-secondary mt-4">
          Instant delivery • Secure payment • 24/7 support
        </p>
      </GlassCard>
    </motion.div>
  );
};
