/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // Temporarily ignore type errors during build for demo purposes
    // Remove this in production
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    // Backend API URL - can be overridden by environment variables
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

    // Default contract addresses (will be overridden by actual deployed addresses)
    NEXT_PUBLIC_BSC_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_BSC_GATEWAY_ADDRESS: process.env.NEXT_PUBLIC_BSC_GATEWAY_ADDRESS || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS: process.env.NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS || '0x0000000000000000000000000000000000000000',

    // Supported chain IDs
    NEXT_PUBLIC_SUPPORTED_CHAINS: process.env.NEXT_PUBLIC_SUPPORTED_CHAINS || '56,137',
  },

  // Webpack configuration for web3 libraries
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Image optimization
  images: {
    domains: ['localhost'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;