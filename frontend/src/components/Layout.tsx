import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { getChainConfig } from '@/lib/wagmi';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Coins,
  BarChart3,
  ArrowUpDown,
  Shield,
  Zap,
  ExternalLink
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'C12USD Stablecoin',
  description = 'Cross-chain USD stablecoin powered by LayerZero'
}) => {
  const { t } = useTranslation('common');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation */}
        <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and title */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">C12USD</h1>
                  <p className="text-xs text-gray-400">Cross-chain Stablecoin</p>
                </div>
              </div>

              {/* Network indicator, language switcher, and wallet connection */}
              <div className="flex items-center space-x-3">
                {isConnected && chainConfig && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">{chainConfig.name}</span>
                  </div>
                )}

                <LanguageSwitcher variant="minimal" className="hidden sm:flex" />

                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="container-responsive py-6 sm:py-8">
          {!isConnected ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center hover-glow animate-bounce-subtle">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  {t('wallet.connect')}
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Connect your wallet to access the C12USD stablecoin platform.
                  Manage your tokens, view balances, and interact with our services.
                </p>
                <div className="space-y-4">
                  <div className="hover-lift">
                    <ConnectButton />
                  </div>
                  <div className="sm:hidden flex justify-center">
                    <LanguageSwitcher variant="button" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {children}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-700 bg-gray-800/30 backdrop-blur-sm mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                © 2024 C12AI DAO. All rights reserved.
              </div>

              <div className="flex items-center space-x-6">
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <Zap className="w-4 h-4" />
                  <span>Status</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;