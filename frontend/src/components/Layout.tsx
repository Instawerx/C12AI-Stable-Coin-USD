import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
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
  ExternalLink,
  User,
  Home,
  Settings,
  Info,
  Users,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireConnection?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'C12USD Stablecoin',
  description = 'Cross-chain USD stablecoin powered by LayerZero',
  requireConnection = true
}) => {
  const { t } = useTranslation('common');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);
  const router = useRouter();

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
              {/* Logo, title, and navigation */}
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gradient">C12USD</h1>
                    <p className="text-xs text-gray-400">Cross-chain Stablecoin</p>
                  </div>
                </Link>

                {/* Navigation links */}
                <nav className="hidden md:flex items-center space-x-1">
                  <Link
                    href="/"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      router.pathname === '/'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/about"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      router.pathname === '/about'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>About</span>
                  </Link>
                  <Link
                    href="/dao"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      router.pathname === '/dao'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>DAO</span>
                  </Link>
                  <Link
                    href="/docs"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      router.pathname === '/docs'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Docs</span>
                  </Link>
                  {isConnected && (
                    <>
                      <Link
                        href="/profile"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                          router.pathname === '/profile'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                          router.pathname === '/settings'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </>
                  )}
                </nav>
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

                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-medium transition-all hover-glow"
                              >
                                <div className="flex items-center justify-center w-6 h-6">
                                  <Image
                                    src="/c12usd-logo.png"
                                    alt="C12USD"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                  />
                                </div>
                                <span>Connect</span>
                              </button>
                            );
                          }

                          return (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                              >
                                <div className="flex items-center justify-center w-6 h-6">
                                  <Image
                                    src="/c12usd-logo.png"
                                    alt="C12USD"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                  />
                                </div>
                                <span className="text-sm">
                                  {account.displayName}
                                </span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="container-responsive py-6 sm:py-8">
          {!isConnected && requireConnection ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center hover-glow animate-bounce-subtle">
                    <Image
                      src="/c12usd-logo.png"
                      alt="C12USD"
                      width={64}
                      height={64}
                      className="w-16 h-16"
                    />
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
                  <div className="hover-lift flex justify-center">
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        mounted,
                      }) => {
                        const ready = mounted;
                        const connected = ready && account && chain;

                        return (
                          <div
                            {...(!ready && {
                              'aria-hidden': true,
                              style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              },
                            })}
                          >
                            {!connected && (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-bold text-lg transition-all hover-glow"
                              >
                                <div className="flex items-center justify-center w-8 h-8">
                                  <Image
                                    src="/c12usd-logo.png"
                                    alt="C12USD"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                  />
                                </div>
                                <span>Connect Wallet</span>
                              </button>
                            )}
                          </div>
                        );
                      }}
                    </ConnectButton.Custom>
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
                <Link
                  href="/about"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <Info className="w-4 h-4" />
                  <span>About</span>
                </Link>

                <Link
                  href="/dao"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <Users className="w-4 h-4" />
                  <span>Governance</span>
                </Link>

                <Link
                  href="/docs"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center space-x-1"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Documentation</span>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;