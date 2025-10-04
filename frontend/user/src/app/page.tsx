'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Users,
  TrendingUp,
  Lock,
  Smartphone,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassNavbar } from '../components/ui/GlassNavbar';
import { WalletButton } from '../components/ui/WalletButton';
import { TokenProductCard } from '../components/TokenProductCard';
import { TokenSelectorDropdown, type TokenType } from '../components/ui/TokenSelectorDropdown';
import { BuyTokensModal } from '../components/BuyTokensModal';
import { useAccount } from 'wagmi';

const features = [
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Backed by real USD reserves with full transparency and regular audits.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Cross-chain transfers in seconds with minimal fees.',
  },
  {
    icon: Globe,
    title: 'Multi-Chain',
    description: 'Available on BSC and Polygon with more chains coming soon.',
  },
  {
    icon: Users,
    title: 'DAO Governed',
    description: 'Community-driven governance with member voting rights.',
  },
  {
    icon: TrendingUp,
    title: 'Stable Value',
    description: 'Maintains 1:1 peg with USD through algorithmic stability.',
  },
  {
    icon: Lock,
    title: 'Fully Collateralized',
    description: 'Every C12USD token is backed by real USD reserves in regulated banks.',
  },
];

const stats = [
  { label: 'Total Value Locked', value: '$125M+', icon: BarChart3 },
  { label: 'Total Holders', value: '50K+', icon: Users },
  { label: 'Chains Supported', value: '2+', icon: Globe },
  { label: 'DAO Members', value: '12K+', icon: Smartphone },
];

const navItems = [
  { id: 'home', label: 'Home', href: '/', active: true },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'dao', label: 'DAO', href: '/dao' },
  { id: 'docs', label: 'Docs', href: '/docs' },
];

export default function HomePage() {
  const { user } = useAuth();
  const { address } = useAccount();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenType>('C12USD');

  const handleBuyClick = (tokenType: TokenType) => {
    setSelectedToken(tokenType);
    setIsBuyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <GlassNavbar
        items={navItems}
        logo={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C12</span>
            </div>
            <span className="text-xl font-bold text-gray-900">C12USD</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* Token Selector Dropdown */}
            <TokenSelectorDropdown onBuyClick={handleBuyClick} />

            {/* MetaMask Wallet Button */}
            <WalletButton />

            {/* Auth Actions */}
            {user ? (
              <Link href="/app/dashboard">
                <GlassButton variant="primary" size="sm">
                  Dashboard
                </GlassButton>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <GlassButton variant="ghost" size="sm">
                    Sign In
                  </GlassButton>
                </Link>
                <Link href="/auth/signup">
                  <GlassButton variant="primary" size="sm">
                    Get Started
                  </GlassButton>
                </Link>
              </>
            )}
          </div>
        }
      />

      {/* Buy Tokens Modal */}
      <BuyTokensModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        userAddress={address}
        initialTokenType={selectedToken}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              The Future of
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Stablecoins
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              C12USD is a fully-collateralized, cross-chain stablecoin governed by a decentralized
              autonomous organization. Experience the next generation of stable digital currency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user ? "/app/dashboard" : "/auth/signup"}>
                <GlassButton variant="primary" size="lg" rightIcon={<ArrowRight />}>
                  {user ? "Go to Dashboard" : "Get Started"}
                </GlassButton>
              </Link>
              <Link href="/about">
                <GlassButton variant="secondary" size="lg">
                  Learn More
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center hover" hover>
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose C12USD?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for the modern financial ecosystem with cutting-edge technology and community governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-8 hover" hover>
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Buy Tokens Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Start Using C12USD Today
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purchase tokens instantly with Cash App or stablecoins. Choose the right token for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <TokenProductCard tokenType="C12USD" />
            <TokenProductCard tokenType="C12DAO" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-12 text-center" variant="elevated">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Join the Future?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users who trust C12USD for their stablecoin needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <GlassButton variant="primary" size="lg" rightIcon={<ArrowRight />}>
                  Create Account
                </GlassButton>
              </Link>
              <Link href="/dao">
                <GlassButton variant="secondary" size="lg">
                  Join DAO
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 C12AI DAO. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ for the DeFi community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}