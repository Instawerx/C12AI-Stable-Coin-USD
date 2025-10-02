# 🚀 C12USD Smart Contract Deployment Guide

## Project Overview

**C12USD** is a cross-chain USD-pegged stablecoin deployed on **BSC** and **Polygon** networks, featuring:
- LayerZero OFT (Omnichain Fungible Token) for seamless cross-chain transfers
- ERC-3156 Flash Loans with competitive 0.05% fees
- EIP-2612 Permit functionality for gasless approvals
- Circuit breaker security mechanisms
- Role-based access control with multi-signature governance

**Contact**: admin@carnival12.com
**GCP Project**: c12ai-dao
**Networks**: BSC Mainnet (56) + Polygon Mainnet (137)

---

## 📋 Table of Contents

1. [Contract Architecture](#contract-architecture)
2. [Deployment Prerequisites](#deployment-prerequisites)
3. [Network Configuration](#network-configuration)
4. [Environment Setup](#environment-setup)
5. [Deployment Procedures](#deployment-procedures)
6. [Contract Verification](#contract-verification)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Security & Role Management](#security--role-management)
9. [Cross-Chain Setup](#cross-chain-setup)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Emergency Procedures](#emergency-procedures)
12. [Troubleshooting](#troubleshooting)

---

## 🏗️ Contract Architecture

### Core Contracts

#### 1. C12USDTokenEnhanced.sol
**Location**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\contracts\C12USDTokenEnhanced.sol`

**Features**:
- **Base**: LayerZero OFT + OpenZeppelin ERC20 + Flash Loans
- **Flash Loans**: ERC-3156 compatible with 0.05% fee (5 basis points)
- **Permit**: EIP-2612 gasless approvals
- **Security**: Circuit breaker, pausable, reentrancy protection
- **Access Control**: Role-based permissions

**Key Parameters**:
```solidity
// Supply Configuration
uint256 public constant TREASURY_INITIAL_MINT = 100_000_000 * 10**18; // 100M C12USD
uint256 public constant PILOT_MAX_SUPPLY = 100 * 10**18; // 100 C12USD (pilot phase)
uint256 public constant MAX_TRANSACTION_LIMIT = 1_000_000 * 10**18; // 1M C12USD

// Flash Loan Configuration
uint256 public flashLoanFee = 5; // 0.05% (5 basis points)
uint256 public constant MAX_FLASH_LOAN_FEE = 100; // 1.00% maximum
```

**Role Definitions**:
- `MINTER_ROLE`: Can mint new tokens
- `BURNER_ROLE`: Can burn tokens
- `PAUSER_ROLE`: Can pause/unpause contract
- `CIRCUIT_BREAKER_ROLE`: Emergency circuit breaker control
- `FLASH_LOAN_ADMIN_ROLE`: Flash loan parameter management

#### 2. MintRedeemGateway.sol
**Location**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\contracts\MintRedeemGateway.sol`

**Features**:
- Signature-based mint/redeem authorization
- ECDSA signature verification
- Nonce-based replay attack prevention
- Integration with C12USD token contract

**Role Definitions**:
- `SIGNER_ROLE`: Can sign mint/redeem receipts
- `PAUSER_ROLE`: Can pause gateway operations

---

## 🔧 Deployment Prerequisites

### System Requirements
- **Node.js**: v22.16.0+
- **Hardhat**: v2.26.3+
- **Package Manager**: pnpm v10.17.1

### Dependencies Installation
```bash
cd C12USD
pnpm install
```

### Contract Compilation
```bash
npm run compile
```

### Test Suite Verification
```bash
npm test
# Expected: 68/70 tests passing (97% success rate)
```

---

## 🌐 Network Configuration

### BSC Mainnet (Chain ID: 56)
```javascript
bsc: {
  url: "https://bsc-dataseed1.binance.org/",
  chainId: 56,
  gasPrice: 5000000000, // 5 gwei
  layerZeroEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
  layerZeroEID: 30102
}
```

### Polygon Mainnet (Chain ID: 137)
```javascript
polygon: {
  url: "https://polygon-rpc.com/",
  chainId: 137,
  gasPrice: 30000000000, // 30 gwei
  layerZeroEndpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
  layerZeroEID: 30109
}
```

### Testnet Configuration
```javascript
// BSC Testnet (Chain ID: 97)
bscTestnet: {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545",
  layerZeroEndpoint: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1"
}

// Polygon Mumbai (Chain ID: 80001)
polygonMumbai: {
  url: "https://rpc-mumbai.maticvigil.com",
  layerZeroEndpoint: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8"
}
```

---

## 🔐 Environment Setup

### Required Environment Variables

Create `.env` file based on `.env.example`:

```bash
# Network RPC URLs
BSC_RPC=https://bsc-dataseed1.binance.org/
POLYGON_RPC=https://polygon-rpc.com/

# Deployment Account
OPS_SIGNER_PRIVATE_KEY=0x...  # 64-character private key

# API Keys for Contract Verification
ETHERSCAN_API_KEY=...  # Unified Etherscan Multichain API V2 key

# Multi-Sig Addresses (Production)
SAFE_BSC=0x7903c63CB9f42284d03BC2a124474760f9C1390b
SAFE_POLYGON=0x7903c63CB9f42284d03BC2a124474760f9C1390b

# LayerZero Configuration (Auto-configured in scripts)
LZ_ENDPOINT_BSC=0x3c2269811836af69497E5F486A85D7316753cf62
LZ_ENDPOINT_POLYGON=0x3c2269811836af69497E5F486A85D7316753cf62
LZ_EID_BSC=30102
LZ_EID_POLYGON=30109
```

### Wallet Funding Requirements

**Estimated Gas Costs**:
- **BSC Deployment**: ~0.055 BNB ($38-56)
- **Polygon Deployment**: ~0.32 POL ($0.15)
- **Total**: ~$56 + buffer

**Recommended Funding**:
- **BSC**: 0.1 BNB
- **Polygon**: 1 POL

### Verification Script
```bash
npm run verify-setup
```

---

## 🚀 Deployment Procedures

### Option 1: Individual Network Deployment

#### Deploy to BSC
```bash
npm run deploy:bsc
```

#### Deploy to Polygon
```bash
npm run deploy:polygon
```

### Option 2: Production Multi-Network Deployment
```bash
npm run deploy:production
```

### Option 3: Single Wallet Deployment (Development)
```bash
npm run deploy:single
```

### Deployment Script Flow

The main deployment script (`C:\Users\tabor\Downloads\C12USD_project\C12USD\scripts\deploy.js`) performs:

1. **Network Detection**: Identifies target network and LayerZero endpoint
2. **Account Verification**: Confirms deployer wallet and balance
3. **Contract Deployment**:
   - Deploy `C12USDTokenEnhanced` with LayerZero integration
   - Deploy `MintRedeemGateway` with token reference
4. **Permission Setup**: Grant MINTER_ROLE and BURNER_ROLE to gateway
5. **Flash Loan Configuration**: Verify flash loan settings
6. **Deployment Record**: Save contract addresses to `deployments/` directory

### Expected Output
```
🚀 Starting C12USD contract deployment...
📡 Deploying to network: bsc (Chain ID: 56)
👤 Deploying with account: 0x...
💰 Account balance: 0.1 ETH

📄 Deploying C12USD Enhanced Token contract...
✅ C12USD Token deployed to: 0x...

🏗️ Deploying MintRedeemGateway contract...
✅ MintRedeemGateway deployed to: 0x...

🔑 Configuring contract permissions...
   Granting MINTER_ROLE to gateway...
   Granting BURNER_ROLE to gateway...

⚡ Configuring Flash Loan settings...
   Flash loan fee: 5 basis points (0.05%)
   Flash loans enabled: true
   Max flash loan amount: Unlimited

📋 Deployment Summary:
==================================================
Network: bsc (56)
C12USD Token: 0x...
MintRedeemGateway: 0x...
LayerZero Endpoint: 0x3c2269811836af69497E5F486A85D7316753cf62
Deployer: 0x...
==================================================

📁 Deployment info saved to: deployments/bsc-56.json

🎉 Deployment completed successfully!
```

---

## ✅ Contract Verification

### Automatic Verification Commands
After deployment, the script provides verification commands:

```bash
# BSC Verification
npx hardhat verify --network bsc 0x<TOKEN_ADDRESS> "0x3c2269811836af69497E5F486A85D7316753cf62" "0x<DEPLOYER_ADDRESS>" "0x<DEPLOYER_ADDRESS>"

# Gateway Verification
npx hardhat verify --network bsc 0x<GATEWAY_ADDRESS> "0x<TOKEN_ADDRESS>" "0x<DEPLOYER_ADDRESS>"
```

### Verification URLs
- **BSC**: https://bscscan.com/address/0x<CONTRACT_ADDRESS>
- **Polygon**: https://polygonscan.com/address/0x<CONTRACT_ADDRESS>

### API Key Setup
Use **Etherscan Multichain API V2** for unified verification across 60+ networks:
1. Get API key: https://etherscan.io/apis
2. Set `ETHERSCAN_API_KEY` in `.env`
3. Single key works for BSC, Polygon, Ethereum, and more

---

## ⚙️ Post-Deployment Configuration

### 1. Multi-Signature Role Transition

#### Setup Multi-Sig Roles
```bash
npm run setup:multisig
```

#### Role Assignment Matrix
| Role | BSC Address | Polygon Address | Responsibility |
|------|------------|----------------|----------------|
| **Admin (Treasury)** | `0x7903c63CB9f42284d03BC2a124474760f9C1390b` | `0x7903c63CB9f42284d03BC2a124474760f9C1390b` | Admin functions, flash loan parameters |
| **Treasurer (Operations)** | `0x86111914504B82eF1c487241124C02f9D09325C4` | `0x86111914504B82eF1c487241124C02f9D09325C4` | Daily minting/burning operations |
| **BU Operator (Security)** | `0x77cbC45415d570Ff6BD672c784a86d8951501B19` | `0x77cbC45415d570Ff6BD672c784a86d8951501B19` | Emergency pausing, circuit breaker |

### 2. Role Verification
```bash
npm run verify:roles
```

### 3. Finalize Security Transition
```bash
npm run finalize:roles
```

### 4. Treasury Initial Mint (Admin Only)
```javascript
// Execute once per network after deployment
await c12usdToken.treasuryMint("0x7903c63CB9f42284d03BC2a124474760f9C1390b");
// Mints 100,000,000 C12USD to treasury
```

---

## 🌉 Cross-Chain Setup

### LayerZero Peer Configuration

After both networks are deployed, configure cross-chain communication:

```javascript
// BSC Contract - Set Polygon as peer
await bscC12USDToken.setPeer(
  30109, // Polygon EID
  "0x<POLYGON_TOKEN_ADDRESS>"
);

// Polygon Contract - Set BSC as peer
await polygonC12USDToken.setPeer(
  30102, // BSC EID
  "0x<BSC_TOKEN_ADDRESS>"
);
```

### Cross-Chain Transfer Testing
```javascript
// Test cross-chain transfer
const options = {
  dstEid: 30109, // Polygon
  to: "0x<RECIPIENT_ADDRESS>",
  amountLD: ethers.utils.parseEther("10"),
  minAmountLD: ethers.utils.parseEther("10"),
  extraOptions: "0x",
  composeMsg: "0x",
  oftCmd: "0x"
};

await bscC12USDToken.send(options, { value: ethers.utils.parseEther("0.01") });
```

---

## 🔒 Security & Role Management

### Circuit Breaker System

#### Trigger Circuit Breaker
```javascript
await c12usdToken.tripCircuitBreaker("Emergency: Suspected security issue");
```

#### Reset Circuit Breaker
```javascript
await c12usdToken.resetCircuitBreaker();
```

### Pause/Unpause Contracts
```javascript
// Pause token contract
await c12usdToken.pause();

// Pause gateway
await mintRedeemGateway.pause();

// Unpause
await c12usdToken.unpause();
await mintRedeemGateway.unpause();
```

### Flash Loan Administration
```javascript
// Update flash loan fee (basis points)
await c12usdToken.setFlashLoanFee(10); // 0.1%

// Enable/disable flash loans
await c12usdToken.setFlashLoansEnabled(false);

// Set maximum flash loan amount
await c12usdToken.setMaxFlashLoanAmount(ethers.utils.parseEther("1000000"));
```

---

## 📊 Monitoring & Maintenance

### Contract Interaction Examples

#### Check Token Status
```javascript
const name = await c12usdToken.name(); // "C12USD"
const symbol = await c12usdToken.symbol(); // "C12USD"
const totalSupply = await c12usdToken.totalSupply();
const maxSupply = await c12usdToken.PILOT_MAX_SUPPLY();
const remainingSupply = await c12usdToken.remainingPilotSupply();
```

#### Flash Loan Configuration
```javascript
const config = await c12usdToken.getFlashLoanConfig();
console.log(`Fee: ${config.feeInBasisPoints} bps`);
console.log(`Max Amount: ${config.maxAmount}`);
console.log(`Enabled: ${config.enabled}`);
```

#### Gateway Status
```javascript
const version = await mintRedeemGateway.version(); // "1.0.0"
const isPaused = await mintRedeemGateway.paused();
const isNonceUsed = await mintRedeemGateway.isNonceUsed("0x...");
```

### Deployment Records Location
- **Local**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\deployments\`
- **Format**: `{network}-{chainId}.json`
- **Example**: `bsc-56.json`, `polygon

---

## 🚨 Emergency Procedures

### Emergency Contact Information
- **Primary**: admin@carnival12.com
- **Emergency Multi-Sig**: `0x86111914504B82eF1c487241124C02f9D09325C4`
- **Backup Operator**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`

### Emergency Response Protocol

#### 1. Security Incident Response
```bash
# Immediate actions
npm run emergency:pause     # Pause all contracts
npm run emergency:break     # Trip circuit breakers
```
#### 2. Flash Loan Attack Mitigation
```javascript
// Disable flash loans immediately
await c12usdToken.setFlashLoansEnabled(false);

// Trip circuit breaker
await c12usdToken.tripCircuitBreaker("Flash loan attack detected");
```

#### 3. Cross-Chain Issue Resolution
```javascript
// Pause LayerZero operations
await c12usdToken.pause();

// Check LayerZero message status
// Coordinate with LayerZero team if needed
```

### Recovery Procedures

#### 1. Post-Incident Recovery
```bash
# Verify system state
npm run verify:roles
npm run verify:setup

# Gradual re-enabling
npm run recovery:unpause
```

#### 2. Upgrade Process (Future)
- Deploy new implementation contracts
- Update multi-sig configurations
- Test on testnet first
- Coordinate cross-chain updates

---

## 🔧 Troubleshooting

### Common Deployment Issues

#### 1. Insufficient Gas/Balance
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution**: Fund deployer wallet with more BNB/POL

#### 2. LayerZero Endpoint Issues
```
Error: LayerZero endpoint not configured for chain ID
```
**Solution**: Verify network configuration in `hardhat.config.js`

#### 3. Contract Compilation Failures
```
Error: Contract compilation error
```
**Solution**:
```bash
rm -rf artifacts cache
npm run compile
```

#### 4. Verification Failures
```
Error: Contract verification failed
```
**Solutions**:
- Wait 5+ block confirmations
- Verify constructor parameters match deployment
- Check API key validity
- Use Etherscan Multichain API V2

### Network-Specific Issues

#### BSC Issues
- **RPC Limits**: Use multiple RPC endpoints if rate limited
- **Gas Price**: Adjust gas price during network congestion
- **Verification**: Use BSCScan API specifically for BSC contracts

#### Polygon Issues
- **Gas Estimation**: POL gas prices can be volatile
- **RPC Reliability**: Have backup RPC endpoints configured
- **Transaction Speed**: Account for variable block times

### Contact Support
For deployment issues or questions:
- **Email**: admin@carnival12.com
- **Documentation**: Check existing deployment guides in project
- **Emergency**: Use emergency procedures above

---

## 📚 Additional Resources

### Project Documentation Files
- **Technical Whitepaper**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\C12USD_TECHNICAL_WHITEPAPER.md`
- **Deployment Checklist**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\DEPLOYMENT_CHECKLIST.md`
- **Deployment Guide**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\DEPLOYMENT_GUIDE.md`
- **Deployment Record**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\DEPLOYMENT_RECORD.md`

### Key Script Locations
- **Main Deployment**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\scripts\deploy.js`
- **Production Deployment**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\scripts\deploy-production.js`
- **Setup Verification**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\scripts\verify-setup.js`
- **Role Management**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\scripts\role-management.js`

### Configuration Files
- **Hardhat Config**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\hardhat.config.js`
- **Package Config**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\package.json`
- **Environment Template**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\.env.example`

---

## 📄 Contract Addresses (To Be Updated Post-Deployment)

### BSC Mainnet (Chain ID: 56)
```
C12USDToken: [TO BE UPDATED]
MintRedeemGateway: [TO BE UPDATED]
Deployment TX: [TO BE UPDATED]
Block Number: [TO BE UPDATED]
Verification: [TO BE UPDATED]
```

### Polygon Mainnet (Chain ID: 137)
```
C12USDToken: [TO BE UPDATED]
MintRedeemGateway: [TO BE UPDATED]
Deployment TX: [TO BE UPDATED]
Block Number: [TO BE UPDATED]
Verification: [TO BE UPDATED]
```

---

**Document Created**: September 28, 2025
**Version**: 1.0.0
**Contact**: admin@carnival12.com
**Project**: C12USD Stablecoin - C12AI DAO
**GCP Project**: c12ai-dao

---

*This documentation provides comprehensive deployment information for the C12USD stablecoin smart contracts. For production deployments, always verify all configurations and test thoroughly on testnets first.*