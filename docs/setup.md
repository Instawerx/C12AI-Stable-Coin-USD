# C12USD Development Setup

## Prerequisites

- **Node.js**: v16+ (v22.16.0 recommended)
- **pnpm**: v10+ (package manager)
- **Python**: v3.8+ (for some native modules)

## Installation Steps

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd C12USD
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Compile contracts**:
   ```bash
   pnpm compile
   ```

5. **Run tests**:
   ```bash
   pnpm test
   ```

## Required Environment Variables

Copy `.env.example` to `.env` and fill in the following:

### Blockchain Configuration
- `BSC_RPC` - BSC mainnet RPC URL (e.g., from Alchemy/Infura)
- `POLYGON_RPC` - Polygon mainnet RPC URL
- `OPS_SIGNER_PRIVATE_KEY` - Private key for operations (signing receipts)

### LayerZero Configuration
- `LZ_ENDPOINT_BSC` - LayerZero endpoint for BSC
- `LZ_ENDPOINT_POLYGON` - LayerZero endpoint for Polygon
- `LZ_EID_BSC` - LayerZero EID for BSC
- `LZ_EID_POLYGON` - LayerZero EID for Polygon

### Chainlink Configuration
- `POR_FEED_BSC` - Proof of Reserve feed address on BSC
- `POR_FEED_POLYGON` - Proof of Reserve feed address on Polygon
- `POR_TOLERANCE_BPS` - Tolerance in basis points (default: 10)

### DAO Configuration
- `SAFE_BSC` - Gnosis Safe multisig address on BSC
- `SAFE_POLYGON` - Gnosis Safe multisig address on Polygon

### Payment Integration
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `CASHAPP_ACCESS_TOKEN` - Cash App API access token
- `CASHAPP_WEBHOOK_SECRET` - Cash App webhook secret

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Optional Configuration
- `BSCSCAN_API_KEY` - For contract verification
- `POLYGONSCAN_API_KEY` - For contract verification
- `PILOT_MAX_SUPPLY_USD` - Maximum pilot supply (default: 100)

## Development Workflow

1. **Local development**:
   ```bash
   pnpm dev  # Starts local Hardhat network
   ```

2. **Compile contracts**:
   ```bash
   pnpm compile
   ```

3. **Run tests**:
   ```bash
   pnpm test
   ```

4. **Lint code**:
   ```bash
   pnpm lint
   ```

5. **Type checking**:
   ```bash
   pnpm typecheck
   ```

6. **Deploy to testnet**:
   ```bash
   pnpm deploy:bsc    # BSC testnet
   pnpm deploy:polygon # Polygon testnet
   ```

## Security Notes

- Never commit private keys or API keys to the repository
- Use environment variables for all sensitive configuration
- The operations signer private key should be a dedicated account with limited permissions
- All deployment transactions should be reviewed before execution
- Use hardware wallets or secure key management for production deployments

## Architecture

This project implements:

- **Cross-chain stablecoin** using LayerZero OFT (Omnichain Fungible Token)
- **Proof of Reserve** using Chainlink price feeds and circuit breakers
- **Fiat on/off ramps** via Stripe and Cash App integration
- **DAO governance** using Gnosis Safe multisig wallets
- **Monitoring and observability** with comprehensive logging

The pilot is designed to test the complete flow with minimal capital ($100 max supply) before scaling to production levels.