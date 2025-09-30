# 🚀 C12USD Production Deployment Record

## Deployment Overview
- **Date**: September 26, 2024
- **Deployer Wallet**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
- **Deployment Strategy**: Single wallet deployment with multi-sig transition
- **Networks**: BSC Mainnet (56) + Polygon Mainnet (137)

---

## 🔑 Multi-Sig Configuration

### Role Assignments
- **🏦 Treasury (Admin)**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
  - Controls: Admin functions, flash loan parameters, major decisions
- **🛠️ Operations (Treasurer)**: `0x86111914504B82eF1c487241124C02f9D09325C4`
  - Controls: Daily minting/burning operations
- **🛡️ Security (BU Operator)**: `0x77cbC45415d570Ff6BD672c784a86d8951501B19`
  - Controls: Emergency pausing, circuit breaker
- **🚨 Emergency Contact**: `0x86111914504B82eF1c487241124C02f9D09325C4` (Treasurer)
- **🤖 Automated Signer**: `0x77cbC45415d570Ff6BD672c784a86d8951501B19` (BU Operator)
- **👤 Backup Operator**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b` (Admin)

---

## 📋 Pre-Deployment Checklist

### ✅ Environment Verification
- [x] Node.js v22.16.0 installed
- [x] Hardhat v2.26.3 configured
- [x] All dependencies installed
- [x] Contracts compiled successfully
- [x] Test suite passing (68/70 tests - 97% success)

### ✅ Network Configuration
- [x] BSC RPC: `https://bsc-dataseed1.binance.org/`
- [x] Polygon RPC: `https://polygon-rpc.com/`
- [x] LayerZero endpoints configured
- [x] Network connectivity verified

### ✅ Security Setup
- [x] Private key configured: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
- [x] Multi-sig addresses validated
- [x] Role management scripts ready
- [x] Circuit breaker functionality tested

### ✅ API Configuration
- [x] Etherscan Multichain API V2 key: `3R637V9YYHQMIB4HCXWMISAU92P9R2E5FU`
- [x] Contract verification ready

---

## 💰 Funding Requirements

### Estimated Gas Costs
- **BSC Deployment**: ~0.055 BNB ($38-56)
- **Polygon Deployment**: ~0.32 POL ($0.15)
- **Total Cost**: ~$56

### Wallet Funding Status
- **Required**: 0.1 BNB + 1 POL
- **Status**: ✅ FUNDED

---

## 🏗️ Contract Specifications

### C12USDTokenEnhanced
- **Type**: LayerZero OFT + ERC20 + Flash Loans
- **Features**:
  - Cross-chain transfers via LayerZero
  - ERC-3156 Flash Loans (0.05% fee)
  - EIP-2612 Permit functionality
  - Circuit breaker security
  - Role-based access control
- **Supply Limits**:
  - Pilot Max Supply: 100 C12USD
  - Treasury Initial: 100,000,000 C12USD
  - Max Transaction: 1,000,000 C12USD

### MintRedeemGateway
- **Type**: Signature-based gateway
- **Features**:
  - ECDSA signature verification
  - Nonce-based replay protection
  - Integration with C12USD token
  - Pausable operations

---

## 🌐 LayerZero Configuration

### Mainnet Endpoints
- **BSC**: `0x3c2269811836af69497E5F486A85D7316753cf62`
- **Polygon**: `0x3c2269811836af69497E5F486A85D7316753cf62`

### Chain IDs
- **BSC EID**: 30102
- **Polygon EID**: 30109

---

## 📊 Deployment Results

### BSC Mainnet (Chain ID: 56) ✅ OPERATIONAL
- **C12USDToken Address**: `0x6fa920C5c676ac15AF6360D9D755187a6C87bd58`
- **MintRedeemGateway Address**: `0x8303Ac615266d5b9940b74332503f25D092F5f13`
- **Deployment Date**: September 28, 2025
- **Deployer**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
- **Verification Status**: ✅ DEPLOYED
- **Initial Mint**: ✅ 100,000,000 C12USD (September 30, 2025)
- **Mint Transaction**: `0x79f99cb4b21a0bc926bd5ef9dcfe52ca450ee23218b8a74ce4fce1c8084cc564`
- **Mint Block**: 62895356
- **Total Supply**: 100,000,000 C12USD
- **Treasury Balance**: 100,000,000 C12USD
- **Explorer**: https://bscscan.com/address/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58

### Polygon Mainnet (Chain ID: 137) ✅ OPERATIONAL
- **C12USDToken Address**: `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811`
- **MintRedeemGateway Address**: `0xF3a23bbebC06435dF16370F879cD808c408f702D`
- **Deployment Date**: September 28, 2025
- **Block Number**: 77016778
- **Deployer**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
- **Verification Status**: ⚠️ NOT VERIFIED (should verify for transparency)
- **Initial Mint**: ✅ 100,000,000 C12USD (September 30, 2025)
- **Total Supply**: 100,000,000 C12USD
- **Treasury Balance**: 100,000,000 C12USD
- **Explorer**: https://polygonscan.com/address/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

---

## 🔐 Post-Deployment Security Steps

### 1. Multi-Sig Role Assignment
```bash
npm run setup:multisig
```

### 2. Role Verification
```bash
npm run verify:roles
```

### 3. Final Security Transition
```bash
npm run finalize:roles
```

---

## 📝 Important Notes

### Contract Verification URLs
- **BSC**: `https://bscscan.com/address/[CONTRACT_ADDRESS]`
- **Polygon**: `https://polygonscan.com/address/[CONTRACT_ADDRESS]`

### LayerZero Peer Configuration
After deployment, configure cross-chain communication:
```solidity
// Set BSC → Polygon peer
C12USDToken.setPeer(polygonEid, polygonTokenAddress)

// Set Polygon → BSC peer
C12USDToken.setPeer(bscEid, bscTokenAddress)
```

### Emergency Procedures
- **Circuit Breaker**: `C12USDToken.tripCircuitBreaker("reason")`
- **Pause Contracts**: `C12USDToken.pause()` + `MintRedeemGateway.pause()`
- **Emergency Contact**: `0x86111914504B82eF1c487241124C02f9D09325C4`

---

## 🎯 Success Criteria

- [ ] Both contracts deployed successfully
- [ ] Contract verification completed
- [ ] Multi-sig roles assigned
- [ ] Cross-chain functionality tested
- [ ] Security features operational
- [ ] Monitoring systems active

---

## 📞 Team Contacts

- **Admin Multi-Sig**: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
- **Treasurer Multi-Sig**: `0x86111914504B82eF1c487241124C02f9D09325C4`
- **BU Operator Multi-Sig**: `0x77cbC45415d570Ff6BD672c784a86d8951501B19`

---

*Document created: September 26, 2024*
*Last updated: [TO BE UPDATED AFTER DEPLOYMENT]*