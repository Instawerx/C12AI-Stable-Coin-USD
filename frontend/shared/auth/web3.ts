import { ethers } from 'ethers';
import { WalletConnection, Chain } from '../types';

// Supported chains configuration
export const SUPPORTED_CHAINS = {
  BSC: {
    chainId: 56,
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com',
    contracts: {
      token: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
      gateway: '0x8303Ac615266d5b9940b74332503f25D092F5f13',
    },
  },
  POLYGON: {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com',
    contracts: {
      token: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811',
      gateway: '0xF3a23bbebC06435dF16370F879cD808c408f702D',
    },
  },
};

// Web3 wallet service interface
export interface Web3AuthResult {
  connection: WalletConnection | null;
  error?: string;
}

export interface SignMessageResult {
  signature: string | null;
  error?: string;
}

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Web3 authentication service
export class Web3AuthService {
  private static provider: ethers.BrowserProvider | null = null;
  private static signer: ethers.JsonRpcSigner | null = null;

  // Check if MetaMask is installed
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
  }

  // Connect to MetaMask wallet
  static async connectMetaMask(): Promise<Web3AuthResult> {
    if (!this.isMetaMaskInstalled()) {
      return {
        connection: null,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      };
    }

    try {
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        return {
          connection: null,
          error: 'No accounts found. Please make sure MetaMask is unlocked.',
        };
      }

      // Get chain ID
      const chainId = await window.ethereum!.request({
        method: 'eth_chainId',
      });

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum!);
      this.signer = await this.provider.getSigner();

      const connection: WalletConnection = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        provider: this.provider,
      };

      // Set up event listeners
      this.setupEventListeners();

      return { connection };
    } catch (error: any) {
      return {
        connection: null,
        error: error.message || 'Failed to connect to MetaMask',
      };
    }
  }

  // Disconnect wallet
  static async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.removeEventListeners();
  }

  // Get current connection status
  static async getConnection(): Promise<WalletConnection | null> {
    if (!this.isMetaMaskInstalled()) {
      return null;
    }

    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_accounts',
      });

      if (!accounts || accounts.length === 0) {
        return null;
      }

      const chainId = await window.ethereum!.request({
        method: 'eth_chainId',
      });

      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum!);
        this.signer = await this.provider.getSigner();
      }

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        provider: this.provider,
      };
    } catch (error) {
      return null;
    }
  }

  // Switch to supported chain
  static async switchChain(chain: Chain): Promise<{ success: boolean; error?: string }> {
    if (!this.isMetaMaskInstalled()) {
      return { success: false, error: 'MetaMask is not installed' };
    }

    const chainConfig = SUPPORTED_CHAINS[chain];
    const chainIdHex = `0x${chainConfig.chainId.toString(16)}`;

    try {
      // Try to switch to the chain
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      return { success: true };
    } catch (error: any) {
      // Chain not added to MetaMask, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: chainConfig.name,
                nativeCurrency: {
                  name: chainConfig.symbol,
                  symbol: chainConfig.symbol,
                  decimals: 18,
                },
                rpcUrls: [chainConfig.rpcUrl],
                blockExplorerUrls: [chainConfig.blockExplorer],
              },
            ],
          });

          return { success: true };
        } catch (addError: any) {
          return {
            success: false,
            error: addError.message || 'Failed to add chain to MetaMask',
          };
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to switch chain',
      };
    }
  }

  // Sign message for authentication
  static async signMessage(message: string): Promise<SignMessageResult> {
    if (!this.signer) {
      return {
        signature: null,
        error: 'Wallet not connected',
      };
    }

    try {
      const signature = await this.signer.signMessage(message);
      return { signature };
    } catch (error: any) {
      return {
        signature: null,
        error: error.message || 'Failed to sign message',
      };
    }
  }

  // Get token balance
  static async getTokenBalance(chainId: number, tokenAddress: string, userAddress: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address owner) view returns (uint256)'],
        this.provider
      );

      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  // Get native token balance (BNB, MATIC)
  static async getNativeBalance(userAddress: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const balance = await this.provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting native balance:', error);
      return '0';
    }
  }

  // Event listeners for account and chain changes
  private static setupEventListeners(): void {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleChainChanged);
    window.ethereum.on('disconnect', this.handleDisconnect);
  }

  private static removeEventListeners(): void {
    if (!window.ethereum) return;

    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', this.handleChainChanged);
    window.ethereum.removeListener('disconnect', this.handleDisconnect);
  }

  private static handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      // User disconnected
      window.dispatchEvent(new CustomEvent('wallet:disconnected'));
    } else {
      // User switched accounts
      window.dispatchEvent(
        new CustomEvent('wallet:accountChanged', {
          detail: { address: accounts[0] },
        })
      );
    }
  };

  private static handleChainChanged = (chainId: string): void => {
    window.dispatchEvent(
      new CustomEvent('wallet:chainChanged', {
        detail: { chainId: parseInt(chainId, 16) },
      })
    );
  };

  private static handleDisconnect = (): void => {
    window.dispatchEvent(new CustomEvent('wallet:disconnected'));
  };

  // Utility methods
  static getChainName(chainId: number): string {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chainId);
    return chain?.name || 'Unknown Chain';
  }

  static isSupportedChain(chainId: number): boolean {
    return Object.values(SUPPORTED_CHAINS).some(c => c.chainId === chainId);
  }

  static getChainByChainId(chainId: number): Chain | null {
    if (chainId === SUPPORTED_CHAINS.BSC.chainId) return 'BSC';
    if (chainId === SUPPORTED_CHAINS.POLYGON.chainId) return 'POLYGON';
    return null;
  }

  // Generate authentication message
  static generateAuthMessage(address: string, nonce: string): string {
    return `Welcome to C12USD!

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will reset after 24 hours.

Wallet address: ${address}
Nonce: ${nonce}`;
  }

  // Verify signed message
  static verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}

export default Web3AuthService;