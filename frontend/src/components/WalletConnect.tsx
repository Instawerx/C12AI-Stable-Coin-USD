'use client';

import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useMetaMask, addTokenToMetaMask } from '../hooks/useMetaMask';
import { bsc, polygon } from 'wagmi/chains';

interface WalletConnectProps {
  className?: string;
  showChainInfo?: boolean;
  showAddToken?: boolean;
}

export function WalletConnect({
  className = '',
  showChainInfo = true,
  showAddToken = true,
}: WalletConnectProps) {
  const {
    isConnected,
    address,
    chainId,
    isCorrectChain,
    isMetaMaskInstalled,
    currentChainConfig,
    switchToChain,
    error,
  } = useMetaMask();

  useEffect(() => {
    if (error) {
      console.error('Wallet error:', error);
    }
  }, [error]);

  const handleAddC12USDToken = async () => {
    if (!currentChainConfig?.tokenAddress) {
      alert('C12USD token is not deployed on this network');
      return;
    }

    try {
      await addTokenToMetaMask(
        currentChainConfig.tokenAddress,
        'C12USD',
        18,
        '/icons/c12usd-icon.png' // Update with your token icon URL
      );
      alert('C12USD token added to MetaMask!');
    } catch (err) {
      console.error('Failed to add token:', err);
      alert('Failed to add C12USD token to MetaMask');
    }
  };

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchToChain(targetChainId);
    } catch (err) {
      console.error('Failed to switch chain:', err);
    }
  };

  return (
    <div className={`wallet-connect ${className}`}>
      {/* Main Connect Button (RainbowKit) */}
      <ConnectButton
        chainStatus="icon"
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
      />

      {/* Additional Info */}
      {isConnected && (
        <div className="mt-4 space-y-2">
          {/* Chain Info */}
          {showChainInfo && currentChainConfig && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Connected to</p>
                  <p className="text-lg font-bold">{currentChainConfig.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chain ID: {chainId}
                  </p>
                  {!isCorrectChain && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Unsupported Chain
                    </span>
                  )}
                </div>
              </div>

              {/* Token Address */}
              {currentChainConfig.tokenAddress && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    C12USD Token:
                    <a
                      href={`${currentChainConfig.explorer}/address/${currentChainConfig.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline"
                    >
                      {currentChainConfig.tokenAddress.slice(0, 6)}...{currentChainConfig.tokenAddress.slice(-4)}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Wrong Network Warning */}
          {isConnected && !isCorrectChain && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Please switch to a supported network
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSwitchChain(bsc.id)}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
                >
                  Switch to BSC
                </button>
                <button
                  onClick={() => handleSwitchChain(polygon.id)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                >
                  Switch to Polygon
                </button>
              </div>
            </div>
          )}

          {/* Add Token Button */}
          {showAddToken && isCorrectChain && currentChainConfig?.tokenAddress && (
            <button
              onClick={handleAddC12USDToken}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              ➕ Add C12USD to MetaMask
            </button>
          )}

          {/* MetaMask Not Installed Warning */}
          {!isMetaMaskInstalled && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                MetaMask Not Detected
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                Please install MetaMask extension to connect your wallet
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
              >
                Install MetaMask
              </a>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-xs text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for headers/nav
export function WalletConnectCompact() {
  return (
    <WalletConnect
      showChainInfo={false}
      showAddToken={false}
      className="wallet-connect-compact"
    />
  );
}

// Full featured version for dedicated wallet page
export function WalletConnectFull() {
  const { isConnected, address, currentChainConfig } = useMetaMask();

  return (
    <div className="wallet-connect-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>

        <WalletConnect
          showChainInfo={true}
          showAddToken={true}
        />

        {isConnected && address && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Wallet Information</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Address:</span>
                <span className="font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>

              {currentChainConfig && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="font-medium">{currentChainConfig.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                    <span className="font-medium">{currentChainConfig.currency}</span>
                  </div>

                  {currentChainConfig.tokenAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">C12USD Contract:</span>
                      <a
                        href={`${currentChainConfig.explorer}/address/${currentChainConfig.tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-600 hover:underline text-xs"
                      >
                        {currentChainConfig.tokenAddress.slice(0, 8)}...
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
