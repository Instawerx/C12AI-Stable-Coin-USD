'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getChainConfig, isSupportedChain } from '../lib/wagmi';

export interface MetaMaskState {
  isConnected: boolean;
  address: string | undefined;
  chainId: number | undefined;
  isCorrectChain: boolean;
  isMetaMaskInstalled: boolean;
  isConnecting: boolean;
  error: Error | null;
}

export function useMetaMask() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined') {
        setIsMetaMaskInstalled(
          typeof window.ethereum !== 'undefined' &&
          (window.ethereum.isMetaMask === true)
        );
      }
    };

    checkMetaMask();

    // Listen for MetaMask installation
    const handleEthereum = () => checkMetaMask();
    window.addEventListener('ethereum#initialized', handleEthereum);

    return () => {
      window.removeEventListener('ethereum#initialized', handleEthereum);
    };
  }, []);

  // Update error state
  useEffect(() => {
    if (connectError) {
      setError(connectError);
    }
  }, [connectError]);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    try {
      setError(null);

      if (!isMetaMaskInstalled) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      const metaMaskConnector = connectors.find(
        (connector) => connector.id === 'injected' || connector.name.toLowerCase().includes('metamask')
      );

      if (!metaMaskConnector) {
        throw new Error('MetaMask connector not found');
      }

      await connect({ connector: metaMaskConnector });
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to connect to MetaMask:', error);
    }
  }, [connect, connectors, isMetaMaskInstalled]);

  // Disconnect from MetaMask
  const disconnectMetaMask = useCallback(async () => {
    try {
      setError(null);
      await disconnect();
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to disconnect from MetaMask:', error);
    }
  }, [disconnect]);

  // Switch to a specific chain
  const switchToChain = useCallback(async (targetChainId: number) => {
    try {
      setError(null);

      if (!isSupportedChain(targetChainId)) {
        throw new Error(`Chain ID ${targetChainId} is not supported`);
      }

      await switchChain({ chainId: targetChainId });
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to switch chain:', error);
    }
  }, [switchChain]);

  // Get current chain configuration
  const currentChainConfig = chainId ? getChainConfig(chainId) : undefined;

  // Check if on correct chain (BSC or Polygon)
  const isCorrectChain = chainId ? isSupportedChain(chainId) : false;

  const state: MetaMaskState = {
    isConnected,
    address,
    chainId,
    isCorrectChain,
    isMetaMaskInstalled,
    isConnecting,
    error,
  };

  return {
    ...state,
    connectMetaMask,
    disconnectMetaMask,
    switchToChain,
    currentChainConfig,
  };
}

// Utility function to add token to MetaMask
export async function addTokenToMetaMask(
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number = 18,
  tokenImage?: string
) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    });

    return wasAdded;
  } catch (error) {
    console.error('Failed to add token to MetaMask:', error);
    throw error;
  }
}

// Utility function to switch chain in MetaMask
export async function switchChainInMetaMask(chainId: number) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error('Please add this network to MetaMask first');
    }
    throw error;
  }
}

// TypeScript augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] | object }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
