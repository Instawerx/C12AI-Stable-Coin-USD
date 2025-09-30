/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google avatars
      'graph.facebook.com',        // Facebook avatars
      'platform-lookaside.fbsbx.com', // Facebook platform images
      'avatars.githubusercontent.com', // GitHub avatars
      'ipfs.io',                   // IPFS images
      'cloudflare-ipfs.com',       // Cloudflare IPFS gateway
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'C12USD',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Cross-chain stablecoin with DAO governance',
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://c12usd-backend-prod-239414215297.us-central1.run.app'
      : 'http://localhost:3000',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Add shared directory to resolve modules for proper module resolution
    config.resolve.modules = [
      'node_modules',
      './node_modules',
      '../node_modules',
      '../../node_modules',
    ];

    return config;
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app/dashboard',
        permanent: true,
      },
      {
        source: '/wallet',
        destination: '/app/wallet',
        permanent: true,
      },
    ];
  },
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;