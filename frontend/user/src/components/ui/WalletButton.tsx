'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { bsc, polygon } from 'wagmi/chains';
import { Wallet, ChevronDown, Check, ExternalLink, LogOut, Copy, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export const WalletButton: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

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

      // Use injected connector for MetaMask
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
      if (!target.closest('.wallet-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isPending}
        className={`
          relative inline-flex items-center justify-center gap-2
          px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-300 ease-out
          bg-gradient-to-r from-blue-500 to-blue-600 text-white
          hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          backdrop-blur-md border border-blue-500/30
          group overflow-hidden
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] skew-x-12 group-hover:animate-pulse" />

        {/* C12USD Logo */}
        <div className="relative z-10 w-5 h-5 flex items-center justify-center">
          <Image
            src="/c12usd-logo.png"
            alt="C12USD"
            width={20}
            height={20}
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>

        <span className="relative z-10">
          {!isMetaMaskInstalled ? 'Install MetaMask' : isPending ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>
    );
  }

  // Connected - show wallet info with dropdown
  return (
    <div className="relative wallet-dropdown">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`
          relative inline-flex items-center justify-center gap-2
          px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-300 ease-out
          ${currentChain.supported
            ? 'bg-white/80 text-gray-900 border border-gray-200/50'
            : 'bg-red-50/80 text-red-900 border border-red-200/50'
          }
          hover:shadow-lg hover:scale-105 active:scale-95
          backdrop-blur-md
        `}
      >
        {/* C12USD Logo */}
        <div className="w-5 h-5 flex items-center justify-center">
          <Image
            src="/c12usd-logo.png"
            alt="C12USD"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>

        {/* Chain indicator */}
        <div className={`w-2 h-2 rounded-full ${
          currentChain.supported ? 'bg-green-500' : 'bg-red-500'
        } animate-pulse`} />

        {/* Address */}
        <span className="font-mono text-sm">
          {address && formatAddress(address)}
        </span>

        {/* Chain badge */}
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          currentChain.supported
            ? 'bg-blue-100 text-blue-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {currentChain.name}
        </span>

        <ChevronDown className={`w-4 h-4 transition-transform ${
          isDropdownOpen ? 'rotate-180' : ''
        }`} />
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
          <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Wallet Info */}
            <div className="p-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/c12usd-logo.png"
                    alt="C12USD"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                  <span className="text-xs text-gray-600 font-medium">Connected Wallet</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    currentChain.supported ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <span className={`text-xs font-medium ${currentChain.color}`}>
                    {currentChain.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-900">
                  {formatAddress(address!)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>

              <button
                onClick={viewOnExplorer}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View on Explorer
              </button>
            </div>

            {/* Wrong Network Warning */}
            {!currentChain.supported && (
              <div className="p-4 bg-red-50/50 border-b border-red-200/50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-900 mb-1">
                      Unsupported Network
                    </p>
                    <p className="text-xs text-red-700">
                      Please switch to BSC or Polygon
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Switch Network */}
            <div className="p-2 border-b border-gray-200/50">
              <p className="px-2 py-1 text-xs text-gray-600 font-medium">Switch Network</p>

              <button
                onClick={() => handleSwitchChain(bsc.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  chainId === bsc.id
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-700">B</span>
                  </div>
                  <span className="font-medium">BSC Mainnet</span>
                </div>
                {chainId === bsc.id && <Check className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                onClick={() => handleSwitchChain(polygon.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  chainId === polygon.id
                    ? 'bg-purple-50 text-purple-900'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-700">P</span>
                  </div>
                  <span className="font-medium">Polygon Mainnet</span>
                </div>
                {chainId === polygon.id && <Check className="w-4 h-4 text-purple-600" />}
              </button>
            </div>

            {/* Disconnect */}
            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletButton;
