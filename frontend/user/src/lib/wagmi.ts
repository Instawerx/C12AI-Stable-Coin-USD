import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, polygon, mainnet } from 'wagmi/chains';
import { http } from 'wagmi';

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id';
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;

// Build Infura RPC URLs
const getInfuraUrl = (network: string) =>
  infuraApiKey
    ? `https://${network}.infura.io/v3/${infuraApiKey}`
    : undefined;

// Get the Wagmi config for RainbowKit with Infura support
export const config = getDefaultConfig({
  appName: 'C12USD Stablecoin',
  projectId,
  chains: [bsc, polygon, mainnet],
  transports: {
    [bsc.id]: http(
      getInfuraUrl('bsc-mainnet') ||
      'https://bsc-dataseed1.binance.org/',
      {
        batch: true,
        retryCount: 3,
        timeout: 10_000,
      }
    ),
    [polygon.id]: http(
      getInfuraUrl('polygon-mainnet') ||
      'https://polygon-rpc.com/',
      {
        batch: true,
        retryCount: 3,
        timeout: 10_000,
      }
    ),
    [mainnet.id]: http(
      getInfuraUrl('mainnet') ||
      'https://eth.public-rpc.com',
      {
        batch: true,
        retryCount: 3,
        timeout: 10_000,
      }
    ),
  },
  ssr: true,
});

// Token icon
export const TOKEN_ICON = '/icons/c12usd.png';

// Contract addresses for each chain
export const CONTRACT_ADDRESSES = {
  [bsc.id]: {
    token: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
    gateway: '0x8303Ac615266d5b9940b74332503f25D092F5f13',
    icon: TOKEN_ICON,
  },
  [polygon.id]: {
    token: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811',
    gateway: '0xF3a23bbebC06435dF16370F879cD808c408f702D',
    icon: TOKEN_ICON,
  },
} as const;

// ABI for C12USD token contract
export const C12USD_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
] as const;

// ABI for Gateway contract
export const GATEWAY_ABI = [
  'function mint(address to, uint256 amount, bytes calldata signature) external',
  'function redeem(uint256 amount, address to, bytes calldata signature) external',
  'function getMintFee(uint256 amount) view returns (uint256)',
  'function getRedeemFee(uint256 amount) view returns (uint256)',
  'function isPaused() view returns (bool)',
] as const;

// Chain configuration
export const chainConfig = {
  [bsc.id]: {
    name: 'BSC',
    explorer: 'https://bscscan.com',
    currency: 'BNB',
    infuraNetwork: 'bsc-mainnet',
  },
  [polygon.id]: {
    name: 'Polygon',
    explorer: 'https://polygonscan.com',
    currency: 'MATIC',
    infuraNetwork: 'polygon-mainnet',
  },
  [mainnet.id]: {
    name: 'Ethereum',
    explorer: 'https://etherscan.io',
    currency: 'ETH',
    infuraNetwork: 'mainnet',
  },
} as const;

export function getChainConfig(chainId: number) {
  return chainConfig[chainId as keyof typeof chainConfig];
}

export function isSupportedChain(chainId: number): boolean {
  return chainId in CONTRACT_ADDRESSES;
}
