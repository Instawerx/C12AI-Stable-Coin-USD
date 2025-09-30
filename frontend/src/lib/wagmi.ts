import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, polygon, bscTestnet, polygonMumbai } from 'wagmi/chains';
import { http } from 'viem';

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

// Define the chains we support
const chains = process.env.NODE_ENV === 'development'
  ? [bsc, polygon, bscTestnet, polygonMumbai] as const
  : [bsc, polygon] as const;

// Wagmi configuration
export const config = getDefaultConfig({
  appName: 'C12USD Stablecoin',
  projectId,
  chains,
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org/'),
    [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com/'),
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545/'),
    [polygonMumbai.id]: http('https://rpc-mumbai.maticvigil.com/'),
  },
});

// Chain configuration mapping
export const chainConfig = {
  [bsc.id]: {
    name: 'BSC',
    tokenAddress: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_BSC_GATEWAY_ADDRESS,
    explorer: 'https://bscscan.com',
    currency: 'BNB',
  },
  [polygon.id]: {
    name: 'Polygon',
    tokenAddress: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS,
    explorer: 'https://polygonscan.com',
    currency: 'MATIC',
  },
  [bscTestnet.id]: {
    name: 'BSC Testnet',
    tokenAddress: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_BSC_GATEWAY_ADDRESS,
    explorer: 'https://testnet.bscscan.com',
    currency: 'tBNB',
  },
  [polygonMumbai.id]: {
    name: 'Mumbai',
    tokenAddress: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS,
    explorer: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
  },
} as const;

export const supportedChainIds = Object.keys(chainConfig).map(Number);

export function getChainConfig(chainId: number) {
  return chainConfig[chainId as keyof typeof chainConfig];
}

export function isSupportedChain(chainId: number): boolean {
  return chainId in chainConfig;
}