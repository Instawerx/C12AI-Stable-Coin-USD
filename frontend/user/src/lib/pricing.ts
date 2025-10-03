/**
 * Pricing utilities for C12USD Manual Payment System
 * Handles token price calculations and conversions
 */

import { getFunctions, httpsCallable } from 'firebase/functions';

// Official pricing constants (fallback if Firebase config unavailable)
export const PRICING = {
  C12USD: {
    priceUSD: 1.0,
    symbol: 'C12USD',
    icon: '💵',
    name: 'C12USD Stablecoin',
    description: '1:1 USD Backed',
    decimals: 18,
    minPurchase: 10.0,
  },
  C12DAO: {
    priceUSD: 3.3,
    symbol: 'C12DAO',
    icon: '💧',
    name: 'C12DAO Governance',
    description: 'Blue-Pink Gradient Droplet',
    decimals: 18,
    minPurchase: 3.3,
  },
} as const;

export type TokenType = keyof typeof PRICING;

// Payment configuration
export const PAYMENT_CONFIG = {
  ADMIN_WALLET_ADDRESS: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
  CASH_APP_CASHTAG: '$C12Ai',
  CASH_APP_URL: 'https://cash.app/$C12Ai',
  MIN_PURCHASE_USD: 10.0,
  MAX_PURCHASE_USD: 50000.0,
  EXPIRY_HOURS: 24,
};

// Supported stablecoins
export const STABLECOINS = {
  BUSD: { name: 'Binance USD', symbol: 'BUSD', decimals: 18 },
  USDT: { name: 'Tether', symbol: 'USDT', decimals: 6 },
  USDC: { name: 'USD Coin', symbol: 'USDC', decimals: 6 },
} as const;

export type StablecoinType = keyof typeof STABLECOINS;

// Supported chains
export const CHAINS = {
  BSC: { name: 'BNB Chain', symbol: 'BSC', chainId: 56, explorer: 'https://bscscan.com' },
  POLYGON: { name: 'Polygon', symbol: 'MATIC', chainId: 137, explorer: 'https://polygonscan.com' },
} as const;

export type ChainType = keyof typeof CHAINS;

/**
 * Calculate token amount from USD
 */
export function calculateTokenAmount(usdAmount: number, tokenType: TokenType): number {
  const price = PRICING[tokenType].priceUSD;
  return usdAmount / price;
}

/**
 * Calculate USD from token amount
 */
export function calculateUSDAmount(tokenAmount: number, tokenType: TokenType): number {
  const price = PRICING[tokenType].priceUSD;
  return tokenAmount * price;
}

/**
 * Format token amount for display (2 decimals)
 */
export function formatTokenAmount(amount: number, tokenType: TokenType): string {
  return `${amount.toFixed(2)} ${PRICING[tokenType].symbol}`;
}

/**
 * Format USD amount for display
 */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Validate purchase amount
 */
export function validatePurchaseAmount(
  amount: number,
  tokenType: TokenType
): { valid: boolean; error?: string } {
  const minPurchase = PRICING[tokenType].minPurchase;
  const maxPurchase = PAYMENT_CONFIG.MAX_PURCHASE_USD;

  if (amount < minPurchase) {
    return {
      valid: false,
      error: `Minimum purchase is ${formatUSD(minPurchase)}`,
    };
  }

  if (amount > maxPurchase) {
    return {
      valid: false,
      error: `Maximum purchase is ${formatUSD(maxPurchase)} without enhanced KYC`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique reference ID
 */
export function generateReferenceId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `C12-${timestamp}${random}`;
}

/**
 * Get token price from Firebase (real-time pricing)
 * Falls back to hardcoded pricing if unavailable
 */
export async function getTokenPrice(tokenType: TokenType): Promise<number> {
  try {
    // In production, fetch from Firebase system_config
    // For now, return hardcoded pricing
    return PRICING[tokenType].priceUSD;

    // TODO: Implement Firebase system_config fetch
    // const functions = getFunctions();
    // const getConfig = httpsCallable(functions, 'systemConfig.get');
    // const result = await getConfig({ key: `${tokenType}_PRICE_USD` });
    // return parseFloat(result.data.value);
  } catch (error) {
    console.error('Error fetching token price:', error);
    return PRICING[tokenType].priceUSD; // Fallback
  }
}

/**
 * Get all pricing configuration
 */
export async function getPricingConfig(): Promise<typeof PAYMENT_CONFIG> {
  try {
    // In production, fetch from Firebase system_config
    // For now, return hardcoded config
    return PAYMENT_CONFIG;

    // TODO: Implement Firebase system_config fetch
  } catch (error) {
    console.error('Error fetching pricing config:', error);
    return PAYMENT_CONFIG; // Fallback
  }
}

/**
 * Calculate purchase preview
 */
export interface PurchasePreview {
  tokenType: TokenType;
  usdAmount: number;
  tokenAmount: number;
  pricePerToken: number;
  chain: ChainType;
  displayTokenAmount: string;
  displayUSDAmount: string;
  displayPricePerToken: string;
}

export function calculatePurchasePreview(
  usdAmount: number,
  tokenType: TokenType,
  chain: ChainType
): PurchasePreview {
  const pricePerToken = PRICING[tokenType].priceUSD;
  const tokenAmount = calculateTokenAmount(usdAmount, tokenType);

  return {
    tokenType,
    usdAmount,
    tokenAmount,
    pricePerToken,
    chain,
    displayTokenAmount: formatTokenAmount(tokenAmount, tokenType),
    displayUSDAmount: formatUSD(usdAmount),
    displayPricePerToken: formatUSD(pricePerToken),
  };
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Open URL in new tab
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Get blockchain explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, chain: ChainType): string {
  return `${CHAINS[chain].explorer}/tx/${txHash}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Format time remaining until expiry
 */
export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Parse Firebase timestamp to Date
 */
export function parseFirebaseTimestamp(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date(timestamp);
}

/**
 * Manual Payment Status Display Configuration
 */
export const PAYMENT_STATUS_CONFIG = {
  PENDING_SUBMISSION: {
    label: 'Awaiting Payment',
    color: 'warning',
    description: 'Please complete payment and submit proof',
  },
  PENDING_VERIFICATION: {
    label: 'Verifying',
    color: 'info',
    description: 'Payment is being verified by our team',
  },
  VERIFYING: {
    label: 'Under Review',
    color: 'info',
    description: 'Admin is reviewing your payment',
  },
  APPROVED: {
    label: 'Approved',
    color: 'success',
    description: 'Payment approved, preparing tokens',
  },
  DISTRIBUTING: {
    label: 'Distributing',
    color: 'info',
    description: 'Tokens are being sent to your wallet',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'success',
    description: 'Tokens delivered successfully',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'danger',
    description: 'Payment was rejected',
  },
  EXPIRED: {
    label: 'Expired',
    color: 'default',
    description: 'Submission window expired',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'default',
    description: 'Payment has been refunded',
  },
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_CONFIG;

/**
 * Get status configuration
 */
export function getStatusConfig(status: PaymentStatus) {
  return PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING_SUBMISSION;
}
