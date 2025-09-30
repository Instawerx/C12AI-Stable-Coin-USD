import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useChainId } from 'wagmi';
import {
  Wallet,
  ArrowUpDown,
  TrendingUp,
  Shield,
  AlertCircle,
  RefreshCw,
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react';

import TokenBalance from './TokenBalance';
import TransferForm from './TransferForm';
import RedeemForm from './RedeemForm';
import ProofOfReserves from './ProofOfReserves';
import TransactionHistory from './TransactionHistory';
import { getChainConfig } from '@/lib/wagmi';

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { address } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);

  const [activeTab, setActiveTab] = useState<'overview' | 'transfer' | 'redeem' | 'history' | 'por'>('overview');

  const tabs = [
    { id: 'overview', label: t('common:navigation.overview'), icon: BarChart3 },
    { id: 'transfer', label: t('common:navigation.transfer'), icon: ArrowUpDown },
    { id: 'redeem', label: t('common:navigation.redeem'), icon: DollarSign },
    { id: 'history', label: t('common:navigation.history'), icon: Activity },
    { id: 'por', label: t('common:navigation.reserves'), icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('dashboard:dashboard.title')}</h1>
          <p className="text-gray-400 mt-1">
            {t('dashboard:dashboard.subtitle', { network: chainConfig?.name || 'Unsupported Network' })}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <Wallet className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-mono text-gray-300">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Network Warning */}
      {!chainConfig && (
        <div className="bg-warning-900 bg-opacity-20 border border-warning-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-warning-400" />
            <div>
              <h3 className="text-warning-400 font-medium">Unsupported Network</h3>
              <p className="text-warning-300 text-sm mt-1">
                Please switch to BSC or Polygon to use C12USD services.
              </p>
            </div>
          </div>
        </div>
      )}

      {chainConfig && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left column - Token Balance */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="animate-slide-in">
                    <TokenBalance />
                  </div>

                  {/* Quick Actions */}
                  <div className="card hover-glow animate-fade-in">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        <span>{t('dashboard:dashboard.quickActions')}</span>
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setActiveTab('transfer')}
                          className="btn btn-outline hover-lift flex items-center justify-center space-x-2 py-3"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                          <span>{t('dashboard:dashboard.transferTokens')}</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('redeem')}
                          className="btn btn-primary hover-lift flex items-center justify-center space-x-2 py-3"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>{t('dashboard:dashboard.redeemToUsd')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Proof of Reserves */}
                <div className="animate-slide-in">
                  <ProofOfReserves />
                </div>
              </div>
            )}

            {activeTab === 'transfer' && (
              <div className="max-w-md mx-auto animate-slide-in">
                <div className="hover-glow">
                  <TransferForm />
                </div>
              </div>
            )}

            {activeTab === 'redeem' && (
              <div className="max-w-md mx-auto animate-slide-in">
                <div className="hover-glow">
                  <RedeemForm />
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <TransactionHistory />
            )}

            {activeTab === 'por' && (
              <ProofOfReserves detailed />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;