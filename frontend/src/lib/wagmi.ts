import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, polygon, bscTestnet, polygonMumbai, mainnet } from 'wagmi/chains';
import { http } from 'viem';

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;

// Define the chains we support
const chains = process.env.NODE_ENV === 'development'
  ? [bsc, polygon, mainnet, bscTestnet, polygonMumbai] as const
  : [bsc, polygon, mainnet] as const;

// Build Infura RPC URLs
const getInfuraUrl = (network: string) =>
  infuraApiKey
    ? `https://${network}.infura.io/v3/${infuraApiKey}`
    : undefined;

const getInfuraWsUrl = (network: string) =>
  infuraApiKey
    ? `wss://${network}.infura.io/ws/v3/${infuraApiKey}`
    : undefined;

// Wagmi configuration with Infura support
export const config = getDefaultConfig({
  appName: 'C12USD Stablecoin',
  projectId,
  chains,
  transports: {
    // BSC Mainnet with Infura fallback
    [bsc.id]: http(
      getInfuraUrl('bsc-mainnet') ||
      process.env.NEXT_PUBLIC_BSC_RPC ||
      'https://bsc-dataseed1.binance.org/',
      {
        batch: true,
        retryCount: 3,
        timeout: 10_000,
      }
    ),
    // Polygon Mainnet with Infura fallback
    [polygon.id]: http(
      getInfuraUrl('polygon-mainnet') ||
      process.env.NEXT_PUBLIC_POLYGON_RPC ||
      'https://polygon-rpc.com/',
      {
        batch: true,
        retryCount: 3,
        timeout: 10_000,
      }
    ),
    // Ethereum Mainnet with Infura
    [mainnet.id]: http(
      getInfuraUrl('mainnet') ||
      'https://eth.public-rpc.com',
      {
        batch: true,
        retryCount: 3,
        timeout: 10_000,
      }
    ),
    // Testnets
    [bscTestnet.id]: http(
      getInfuraUrl('bsc-testnet') ||
      'https://data-seed-prebsc-1-s1.binance.org:8545/',
      {
        retryCount: 3,
        timeout: 10_000,
      }
    ),
    [polygonMumbai.id]: http(
      'https://rpc-mumbai.maticvigil.com/',
      {
        retryCount: 3,
        timeout: 10_000,
      }
    ),
  },
  ssr: true,
});

// Chain configuration mapping
export const chainConfig = {
  [bsc.id]: {
    name: 'BSC',
    tokenAddress: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_BSC_GATEWAY_ADDRESS,
    explorer: 'https://bscscan.com',
    currency: 'BNB',
    infuraNetwork: 'bsc-mainnet',
  },
  [polygon.id]: {
    name: 'Polygon',
    tokenAddress: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS,
    explorer: 'https://polygonscan.com',
    currency: 'MATIC',
    infuraNetwork: 'polygon-mainnet',
  },
  [mainnet.id]: {
    name: 'Ethereum',
    tokenAddress: undefined,
    gatewayAddress: undefined,
    explorer: 'https://etherscan.io',
    currency: 'ETH',
    infuraNetwork: 'mainnet',
  },
  [bscTestnet.id]: {
    name: 'BSC Testnet',
    tokenAddress: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_BSC_GATEWAY_ADDRESS,
    explorer: 'https://testnet.bscscan.com',
    currency: 'tBNB',
    infuraNetwork: 'bsc-testnet',
  },
  [polygonMumbai.id]: {
    name: 'Mumbai',
    tokenAddress: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS,
    gatewayAddress: process.env.NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS,
    explorer: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
    infuraNetwork: undefined,
  },
} as const;

export const supportedChainIds = Object.keys(chainConfig).map(Number);

export function getChainConfig(chainId: number) {
  return chainConfig[chainId as keyof typeof chainConfig];
}

export function isSupportedChain(chainId: number): boolean {
  return chainId in chainConfig;
}

export function getInfuraRpcUrl(chainId: number): string | undefined {
  const config = getChainConfig(chainId);
  if (!config?.infuraNetwork || !infuraApiKey) return undefined;
  return getInfuraUrl(config.infuraNetwork);
}

export function getInfuraWsRpcUrl(chainId: number): string | undefined {
  const config = getChainConfig(chainId);
  if (!config?.infuraNetwork || !infuraApiKey) return undefined;
  return getInfuraWsUrl(config.infuraNetwork);
}
