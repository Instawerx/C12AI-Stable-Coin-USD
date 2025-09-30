import { Contract } from 'ethers';
import { getChainConfig } from './wagmi';

// C12USD Token ABI (simplified for frontend use)
export const C12USD_TOKEN_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function PILOT_MAX_SUPPLY() view returns (uint256)',
  'function remainingPilotSupply() view returns (uint256)',
  'function paused() view returns (bool)',
  'function circuitBreakerTripped() view returns (bool)',

  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event PilotMint(address indexed to, uint256 amount, bytes32 indexed receiptHash)',
  'event PilotBurn(address indexed from, uint256 amount, bytes32 indexed receiptHash)',
] as const;

// MintRedeem Gateway ABI (simplified for frontend use)
export const MINT_REDEEM_GATEWAY_ABI = [
  // Read functions
  'function version() view returns (string)',
  'function usedNonces(bytes32 nonce) view returns (bool)',
  'function isNonceUsed(bytes32 nonce) view returns (bool)',
  'function paused() view returns (bool)',

  // Write functions - these are typically called by backend, but useful for display
  'function executeMint(address recipient, uint256 amount, bytes32 nonce, uint256 expiryTime, bytes32 receiptHash, bytes signature)',
  'function executeRedeem(address account, uint256 amount, bytes32 nonce, uint256 expiryTime, bytes32 receiptHash, bytes signature)',

  // Events
  'event MintExecuted(address indexed recipient, uint256 amount, bytes32 indexed receiptHash, bytes32 nonce)',
  'event RedeemExecuted(address indexed account, uint256 amount, bytes32 indexed receiptHash, bytes32 nonce)',
  'event NonceUsed(bytes32 indexed nonce)',
] as const;

/**
 * Get contract address for a given chain
 */
export function getContractAddress(chainId: number, contract: 'token' | 'gateway'): string | undefined {
  const config = getChainConfig(chainId);
  if (!config) return undefined;

  return contract === 'token' ? config.tokenAddress : config.gatewayAddress;
}

/**
 * Get the appropriate ABI for a contract
 */
export function getContractABI(contract: 'token' | 'gateway') {
  return contract === 'token' ? C12USD_TOKEN_ABI : MINT_REDEEM_GATEWAY_ABI;
}

/**
 * Contract interaction helpers
 */
export const ContractHelpers = {
  /**
   * Format token amount for display (assumes 18 decimals)
   */
  formatTokenAmount: (amount: bigint, decimals = 18): string => {
    const divisor = BigInt(10 ** decimals);
    const quotient = amount / divisor;
    const remainder = amount % divisor;

    if (remainder === 0n) {
      return quotient.toString();
    }

    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');

    return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString();
  },

  /**
   * Parse token amount from string input
   */
  parseTokenAmount: (amount: string, decimals = 18): bigint => {
    const [whole = '0', fractional = ''] = amount.split('.');
    const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractionalPadded || 0);
  },

  /**
   * Validate token amount input
   */
  isValidAmount: (amount: string): boolean => {
    if (!amount || amount === '0' || amount === '0.') return false;

    const regex = /^\d+\.?\d*$/;
    if (!regex.test(amount)) return false;

    const [, fractional = ''] = amount.split('.');
    return fractional.length <= 18; // Max 18 decimal places
  },

  /**
   * Format error message from contract interaction
   */
  formatError: (error: any): string => {
    if (error?.reason) return error.reason;
    if (error?.message) {
      // Extract meaningful error messages
      if (error.message.includes('user rejected')) {
        return 'Transaction was rejected by user';
      }
      if (error.message.includes('insufficient funds')) {
        return 'Insufficient funds for transaction';
      }
      if (error.message.includes('execution reverted')) {
        return 'Transaction failed: Contract execution reverted';
      }
      return error.message;
    }
    return 'An unknown error occurred';
  },

  /**
   * Get explorer URL for transaction
   */
  getTransactionUrl: (chainId: number, txHash: string): string => {
    const config = getChainConfig(chainId);
    return config ? `${config.explorer}/tx/${txHash}` : '#';
  },

  /**
   * Get explorer URL for address
   */
  getAddressUrl: (chainId: number, address: string): string => {
    const config = getChainConfig(chainId);
    return config ? `${config.explorer}/address/${address}` : '#';
  },
};