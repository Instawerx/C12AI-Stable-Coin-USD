import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, polygon } from 'wagmi/chains';

// Get the Wagmi config for RainbowKit
export const config = getDefaultConfig({
  appName: 'C12USD',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [bsc, polygon],
  ssr: true, // If your dApp uses server side rendering (SSR)
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