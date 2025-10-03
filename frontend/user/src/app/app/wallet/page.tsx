'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Copy,
  ExternalLink,
  Send,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  QrCode,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { bsc, polygon } from 'wagmi/chains';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { Badge } from '../../../components/ui/Badge';
import { WalletButton } from '../../../components/ui/WalletButton';
import toast from 'react-hot-toast';

// Mock wallet data
const mockWalletData = {
  address: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
  balances: {
    BSC: {
      C12USD: '1,000.00',
      BNB: '0.25',
      chainId: 56,
      network: 'BSC',
    },
    POLYGON: {
      C12USD: '250.00',
      MATIC: '150.00',
      chainId: 137,
      network: 'Polygon',
    },
  },
  totalValue: '1,250.00',
  recentActivity: [
    {
      id: '1',
      type: 'receive',
      amount: '500.00',
      token: 'C12USD',
      network: 'BSC',
      from: '0x1234...5678',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'send',
      amount: '100.00',
      token: 'C12USD',
      network: 'Polygon',
      to: '0x8765...4321',
      timestamp: '2024-01-14T15:45:00Z',
    },
  ],
};

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [selectedNetwork, setSelectedNetwork] = useState<'BSC' | 'POLYGON'>('BSC');
  const [showQR, setShowQR] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } else {
      navigator.clipboard.writeText(mockWalletData.address);
      toast.success('Address copied to clipboard');
    }
  };

  const handleNetworkSwitch = async (network: 'BSC' | 'POLYGON') => {
    try {
      if (switchChain) {
        const targetChainId = network === 'BSC' ? bsc.id : polygon.id;
        await switchChain({ chainId: targetChainId });
      }
      setSelectedNetwork(network);
      toast.success(`Switched to ${network}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch network');
    }
  };

  const currentBalance = mockWalletData.balances[selectedNetwork];
  const displayAddress = address || mockWalletData.address;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Manage your C12USD and native tokens
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton variant="secondary" onClick={() => setShowQR(true)}>
            <QrCode className="w-4 h-4" />
            Receive
          </GlassButton>
          <GlassButton variant="primary">
            <Send className="w-4 h-4" />
            Send
          </GlassButton>
        </div>
      </div>

      {/* Wallet Connection Status */}
      {isConnected && address ? (
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-success/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-brand-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Wallet Connected</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-text-secondary text-sm font-mono">
                  {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                </span>
                <GlassButton variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="w-3 h-3" />
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => {
                  const explorerUrl = chainId === bsc.id
                    ? `https://bscscan.com/address/${address}`
                    : `https://polygonscan.com/address/${address}`;
                  window.open(explorerUrl, '_blank');
                }}>
                  <ExternalLink className="w-3 h-3" />
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-warning/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-brand-warning" />
            </div>
            <div className="flex-1">
              <div className="font-medium">No Wallet Connected</div>
              <div className="text-text-secondary text-sm mt-1">
                Connect your wallet to view balances and make transactions
              </div>
            </div>
            <WalletButton />
          </div>
        </GlassCard>
      )}

      {/* Network Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Network:</span>
        {Object.keys(mockWalletData.balances).map((network) => (
          <GlassButton
            key={network}
            variant={selectedNetwork === network ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleNetworkSwitch(network as 'BSC' | 'POLYGON')}
          >
            {network}
          </GlassButton>
        ))}
      </div>

      {/* Portfolio Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Portfolio Balance</h2>
              <Badge variant="primary" size="sm">
                {currentBalance.network}
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-3xl font-bold">${mockWalletData.totalValue}</div>
                <div className="text-text-secondary mt-1">Total Portfolio Value</div>
              </div>

              {/* Token Balances */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C12</span>
                    </div>
                    <div>
                      <div className="font-medium">C12USD</div>
                      <div className="text-sm text-text-secondary">Stablecoin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{currentBalance.C12USD}</div>
                    <div className="text-sm text-text-secondary">C12USD</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedNetwork === 'BSC' ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}>
                      <span className="text-white font-bold text-sm">
                        {selectedNetwork === 'BSC' ? 'BNB' : 'MATIC'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedNetwork === 'BSC' ? 'BNB' : 'MATIC'}
                      </div>
                      <div className="text-sm text-text-secondary">Native Token</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {selectedNetwork === 'BSC' ? (currentBalance as any).BNB : (currentBalance as any).MATIC}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {selectedNetwork === 'BSC' ? 'BNB' : 'MATIC'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <GlassButton variant="secondary" className="w-full justify-start">
                <ArrowDownLeft className="w-4 h-4 text-brand-success" />
                Receive
              </GlassButton>
              <GlassButton variant="secondary" className="w-full justify-start">
                <ArrowUpRight className="w-4 h-4 text-brand-primary" />
                Send
              </GlassButton>
              <GlassButton variant="secondary" className="w-full justify-start">
                <Plus className="w-4 h-4 text-brand-warning" />
                Buy C12USD
              </GlassButton>
              <GlassButton variant="secondary" className="w-full justify-start">
                <Download className="w-4 h-4 text-brand-secondary" />
                Export
              </GlassButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Network Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Chain ID</span>
                <span className="font-medium">{currentBalance.chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Network</span>
                <span className="font-medium">{currentBalance.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {mockWalletData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'receive'
                    ? 'bg-brand-success/20 text-brand-success'
                    : 'bg-brand-warning/20 text-brand-warning'
                }`}>
                  {activity.type === 'receive' ?
                    <ArrowDownLeft className="w-4 h-4" /> :
                    <ArrowUpRight className="w-4 h-4" />
                  }
                </div>
                <div>
                  <div className="font-medium capitalize">{activity.type} {activity.token}</div>
                  <div className="text-sm text-text-secondary">
                    {activity.type === 'receive' ? 'From' : 'To'}: {' '}
                    {activity.type === 'receive' ?
                      `${activity.from?.slice(0, 6)}...${activity.from?.slice(-4)}` :
                      `${activity.to?.slice(0, 6)}...${activity.to?.slice(-4)}`
                    }
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {activity.type === 'receive' ? '+' : '-'}{activity.amount} {activity.token}
                </div>
                <div className="text-sm text-text-secondary">{activity.network}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-modal p-8 max-w-sm mx-4"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Receive Tokens</h3>
              <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-gray-400">QR Code</div>
              </div>
              <div className="text-sm text-text-secondary mb-4">
                Scan this QR code to send tokens to your wallet
              </div>
              <div className="flex items-center gap-2 p-3 glass-card rounded-lg mb-4">
                <span className="text-xs font-mono flex-1 truncate">
                  {mockWalletData.address}
                </span>
                <GlassButton variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="w-3 h-3" />
                </GlassButton>
              </div>
              <GlassButton variant="secondary" onClick={() => setShowQR(false)}>
                Close
              </GlassButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}