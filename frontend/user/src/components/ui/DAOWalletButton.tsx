'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { bsc, polygon } from 'wagmi/chains';
import { Crown, ChevronDown, Check, ExternalLink, LogOut, Copy, AlertCircle, Vote, Trophy, Shield } from 'lucide-react';
import Image from 'next/image';

interface DAOWalletButtonProps {
  showVotingPower?: boolean;
  showTier?: boolean;
  variant?: 'default' | 'compact';
}

export const DAOWalletButton: React.FC<DAOWalletButtonProps> = ({
  showVotingPower = true,
  showTier = true,
  variant = 'default'
}) => {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Mock DAO data - replace with real data from context/API
  const [daoData, setDaoData] = useState({
    votingPower: 1250,
    tier: 'GOLD',
    tierColor: 'from-yellow-400 to-yellow-600',
    totalProposals: 23,
    votescast: 18
  });

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined') {
        setIsMetaMaskInstalled(
          typeof window.ethereum !== 'undefined' &&
          window.ethereum.isMetaMask === true
        );
      }
    };
    checkMetaMask();
  }, []);

  // Get current chain info
  const getCurrentChain = () => {
    if (chainId === bsc.id) return { name: 'BSC', color: 'text-yellow-600', supported: true };
    if (chainId === polygon.id) return { name: 'Polygon', color: 'text-purple-600', supported: true };
    return { name: 'Unsupported', color: 'text-red-600', supported: false };
  };

  const currentChain = getCurrentChain();

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Connect wallet
  const handleConnect = async () => {
    try {
      if (!isMetaMaskInstalled) {
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      await connect({
        connector: injected(),
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  // Switch chain
  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  // View on explorer
  const viewOnExplorer = () => {
    if (!address) return;
    const explorerUrl = chainId === bsc.id
      ? `https://bscscan.com/address/${address}`
      : `https://polygonscan.com/address/${address}`;
    window.open(explorerUrl, '_blank');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dao-wallet-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Get tier icon
  const getTierIcon = () => {
    switch (daoData.tier) {
      case 'BRONZE': return <Shield className="w-4 h-4" />;
      case 'SILVER': return <Shield className="w-4 h-4" />;
      case 'GOLD': return <Trophy className="w-4 h-4" />;
      case 'PLATINUM': return <Crown className="w-4 h-4" />;
      case 'DIAMOND': return <Crown className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  // Get tier color
  const getTierColor = () => {
    switch (daoData.tier) {
      case 'BRONZE': return 'from-orange-400 to-orange-600';
      case 'SILVER': return 'from-gray-400 to-gray-600';
      case 'GOLD': return 'from-yellow-400 to-yellow-600';
      case 'PLATINUM': return 'from-blue-400 to-blue-600';
      case 'DIAMOND': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Not connected - show connect button with DAO branding
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isPending}
        className={`
          relative inline-flex items-center justify-center gap-2
          px-5 py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-300 ease-out
          bg-gradient-to-r ${getTierColor()} text-white
          hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-105
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          backdrop-blur-md border-2 border-yellow-400/50
          group overflow-hidden
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] skew-x-12 group-hover:animate-pulse" />

        {/* DAO Crown Icon */}
        <div className="relative z-10 w-5 h-5 flex items-center justify-center">
          <Crown className="w-5 h-5 drop-shadow-lg" />
        </div>

        <span className="relative z-10 tracking-wide">
          {!isMetaMaskInstalled ? 'Install MetaMask' : isPending ? 'Connecting...' : 'Connect DAO Wallet'}
        </span>

        {/* Decorative shine effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </button>
    );
  }

  // Compact variant (for smaller spaces)
  if (variant === 'compact') {
    return (
      <div className="relative dao-wallet-dropdown">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            relative inline-flex items-center justify-center gap-2
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-300 ease-out
            bg-gradient-to-r ${getTierColor()} text-white
            hover:shadow-lg hover:scale-105 active:scale-95
            border border-white/30 backdrop-blur-md
          `}
        >
          <Crown className="w-4 h-4" />
          <span className="font-mono text-xs">
            {address && formatAddress(address)}
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>
        {/* Dropdown menu will be added here */}
      </div>
    );
  }

  // Connected - show wallet info with DAO branding
  return (
    <div className="relative dao-wallet-dropdown">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`
          relative inline-flex items-center justify-center gap-3
          px-5 py-3 rounded-xl text-sm font-medium
          transition-all duration-300 ease-out
          bg-gradient-to-r ${getTierColor()}
          text-white shadow-lg
          hover:shadow-xl hover:scale-105 active:scale-95
          border-2 border-white/30 backdrop-blur-md
          group
        `}
      >
        {/* DAO Crown Icon */}
        <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-lg">
          <Crown className="w-4 h-4" />
        </div>

        {/* Chain indicator */}
        <div className={`w-2 h-2 rounded-full ${
          currentChain.supported ? 'bg-green-400' : 'bg-red-400'
        } animate-pulse ring-2 ring-white/50`} />

        {/* Address */}
        <span className="font-mono text-sm font-semibold">
          {address && formatAddress(address)}
        </span>

        {/* Tier Badge */}
        {showTier && (
          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg">
            {getTierIcon()}
            <span className="text-xs font-bold">{daoData.tier}</span>
          </div>
        )}

        {/* Voting Power */}
        {showVotingPower && (
          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg">
            <Vote className="w-3 h-3" />
            <span className="text-xs font-bold">{daoData.votingPower.toLocaleString()}</span>
          </div>
        )}

        <ChevronDown className={`w-4 h-4 transition-transform ${
          isDropdownOpen ? 'rotate-180' : ''
        }`} />

        {/* Decorative shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-3 w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-2 border-yellow-400/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* DAO Header */}
            <div className={`p-4 bg-gradient-to-r ${getTierColor()} border-b border-white/20`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-white font-bold">DAO Member</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTierIcon()}
                  <span className="text-sm font-bold text-white">{daoData.tier}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white font-semibold">
                  {formatAddress(address!)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* DAO Stats */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Voting Power</div>
                  <div className="text-lg font-bold text-white">{daoData.votingPower.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Votes Cast</div>
                  <div className="text-lg font-bold text-white">{daoData.votescast}/{daoData.totalProposals}</div>
                </div>
              </div>

              <button
                onClick={viewOnExplorer}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-gray-700/50 rounded-lg transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            </div>

            {/* Wrong Network Warning */}
            {!currentChain.supported && (
              <div className="p-4 bg-red-900/30 border-b border-red-700/50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-200 mb-1">
                      Unsupported Network
                    </p>
                    <p className="text-xs text-red-300">
                      Please switch to BSC or Polygon
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Switch Network */}
            <div className="p-3 border-b border-gray-700">
              <p className="px-2 py-1 text-xs text-gray-400 font-medium">Switch Network</p>

              <button
                onClick={() => handleSwitchChain(bsc.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  chainId === bsc.id
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-400">B</span>
                  </div>
                  <span className="font-medium">BSC Mainnet</span>
                </div>
                {chainId === bsc.id && <Check className="w-4 h-4 text-yellow-400" />}
              </button>

              <button
                onClick={() => handleSwitchChain(polygon.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors mt-2 ${
                  chainId === polygon.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-400">P</span>
                  </div>
                  <span className="font-medium">Polygon Mainnet</span>
                </div>
                {chainId === polygon.id && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            </div>

            {/* Disconnect */}
            <div className="p-3">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors font-medium border border-red-700/30"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DAOWalletButton;
