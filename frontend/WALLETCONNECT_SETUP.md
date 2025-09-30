# WalletConnect Project ID Setup

## Overview
WalletConnect v2 requires a Project ID for your application. This guide will help you obtain and configure your WalletConnect Project ID for the C12USD platform.

## Steps to Get Your Project ID

### 1. Create a WalletConnect Cloud Account
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up for a free account or log in if you already have one

### 2. Create a New Project
1. Click "Create Project" or "New Project"
2. Fill in the project details:
   - **Project Name**: C12USD Stablecoin Platform
   - **Homepage URL**: Your production URL (e.g., `https://c12usd.com`)
   - **App Description**: Cross-chain USD stablecoin powered by LayerZero
   - **Category**: DeFi / Finance

3. Click "Create"

### 3. Get Your Project ID
1. Once created, you'll see your **Project ID** on the project dashboard
2. Copy this ID - it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

## Configuration

### Local Development (.env.local)
Update the `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` in your `.env.local` file:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Production (.env.production)
For production deployment, set the environment variable in your hosting platform:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Verification
After setting the Project ID, restart your development server:

```bash
npm run dev
```

The WalletConnect integration should now work properly with wallet apps like:
- MetaMask Mobile
- Rainbow Wallet
- Trust Wallet
- Coinbase Wallet
- And many more...

## Current Configuration

The Project ID is already integrated in the wagmi configuration (`src/lib/wagmi.ts`):

```typescript
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

export const config = getDefaultConfig({
  appName: 'C12USD Stablecoin',
  projectId,
  chains,
  // ...
});
```

## Testing WalletConnect

1. **Mobile Wallet Testing**:
   - Open your DApp in a mobile browser
   - Click "Connect Wallet"
   - Select "WalletConnect"
   - Scan QR code with your mobile wallet
   - Approve the connection

2. **Desktop Testing**:
   - Open your DApp in a desktop browser
   - Click "Connect Wallet"
   - Select a WalletConnect-compatible wallet (e.g., MetaMask Mobile)
   - Scan the QR code displayed
   - Approve the connection on your mobile device

## Supported Networks

The C12USD platform supports the following networks via WalletConnect:
- **Binance Smart Chain (BSC)** - Chain ID: 56
- **Polygon** - Chain ID: 137
- **Ethereum Mainnet** - Chain ID: 1
- **BSC Testnet** - Chain ID: 97 (development only)
- **Polygon Mumbai** - Chain ID: 80001 (development only)

## Troubleshooting

### Issue: "Invalid Project ID"
**Solution**: Ensure your Project ID is correctly copied without extra spaces or characters.

### Issue: WalletConnect QR Code Not Displaying
**Solution**:
1. Check that the Project ID is set in your environment variables
2. Restart your development server
3. Clear browser cache and reload

### Issue: Connection Timeout
**Solution**:
1. Ensure your mobile device and computer are on the same network
2. Check firewall settings
3. Try a different wallet app

### Issue: Using Demo Project ID
**Solution**: The demo Project ID (`demo-project-id`) has rate limits. Replace it with your own Project ID from WalletConnect Cloud for production use.

## Rate Limits

- **Free Tier**: Up to 1 million requests per month
- **Pro Tier**: Up to 10 million requests per month
- **Enterprise**: Unlimited requests

For the C12USD platform, the free tier should be sufficient for initial launch and testing.

## Security Best Practices

1. **Never commit** your Project ID to public repositories (it's already in `.env.local` which is gitignored)
2. **Use environment variables** for all sensitive configuration
3. **Monitor usage** via the WalletConnect Cloud dashboard
4. **Rotate Project IDs** if you suspect unauthorized use

## Additional Resources

- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [Wagmi Documentation](https://wagmi.sh/)

## Support

If you encounter issues:
1. Check the [WalletConnect Discord](https://discord.gg/walletconnect)
2. Review [GitHub Issues](https://github.com/WalletConnect/walletconnect-monorepo/issues)
3. Contact support via WalletConnect Cloud dashboard
