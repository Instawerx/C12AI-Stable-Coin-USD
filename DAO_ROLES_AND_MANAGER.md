# 💧 C12DAO Governance - Roles & Management Guide

![C12DAO Token Icon](assets/icons/c12dao-icon.png)

**Token Name:** C12AI DAO
**Token Symbol:** C12DAO
**Token Icon:** 💧 Blue-Pink Gradient Droplet
**Date Created:** October 2, 2025
**Network:** Polygon Mainnet (Chain ID: 137)
**Status:** ✅ Deployed & Operational

---

## 📋 Table of Contents

1. [Contract Addresses](#contract-addresses)
2. [Wallet Addresses & Roles](#wallet-addresses--roles)
3. [Token Distribution](#token-distribution)
4. [Deployment Status](#deployment-status)
5. [Initial Setup Roadmap](#initial-setup-roadmap)
6. [Governance Parameters](#governance-parameters)
7. [Management Instructions](#management-instructions)
8. [Security & Best Practices](#security--best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## 📍 Contract Addresses

### Core DAO Contracts (Polygon Mainnet)

| Contract | Address | Status | Purpose |
|----------|---------|--------|---------|
| **C12DAO Token** | `0x26F3d3c2C759acE462882864aa692FBa4512e38B` | ✅ Deployed | Governance token (ERC20 + ERC20Votes) |
| **C12DAOTimelock** | `0xC6C82F86Dc4b2ab0239311D01ABa5907bB907B66` | ⏳ Confirming | 48-hour timelock for governance actions |
| **C12DAOGovernor** | `0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a` | ⏳ Confirming | On-chain governance (proposals & voting) |
| **C12DAOTreasury** | `0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83` | ✅ Deployed | Treasury management contract |
| **C12DAOStaking** | `0x26F5470B289dE63a3B1b726cE3DCe2EaEB3471ee` | ⏳ Confirming | 5-tier staking system |

### Related Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **C12USD (Polygon)** | `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811` | C12USD stablecoin on Polygon |

**View on Polygonscan:**
- Token: https://polygonscan.com/address/0x26F3d3c2C759acE462882864aa692FBa4512e38B
- Treasury: https://polygonscan.com/address/0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83

### 🦊 Adding C12DAO Token to MetaMask

**Token Contract Address:**
```
0x26F3d3c2C759acE462882864aa692FBa4512e38B
```

**Token Icon:** 💧 Blue-Pink Gradient Droplet
**Icon Location:** `assets/icons/c12dao-icon.png`

**Quick Add Steps:**
1. Open MetaMask wallet
2. Switch to **Polygon Mainnet** network (Chain ID: 137)
3. Click "Import tokens" at the bottom
4. Select "Custom token" tab
5. Paste Token Address: `0x26F3d3c2C759acE462882864aa692FBa4512e38B`
6. Token Symbol will auto-fill: **C12DAO**
7. Token Decimals will auto-fill: **18**
8. **Important:** Upload the C12DAO icon from `assets/icons/c12dao-icon.png`
9. Click "Add Custom Token"
10. Confirm by clicking "Import Tokens"

**Token Details:**
- **Name:** C12AI DAO
- **Symbol:** C12DAO
- **Icon:** 💧 Blue-Pink Gradient Droplet (circle with water drop)
- **Decimals:** 18
- **Network:** Polygon Mainnet
- **Total Supply:** 1,000,000,000 C12DAO (1 billion max)
- **Contract Standard:** ERC20 + ERC20Votes

**Direct Link to Add Token:**
https://polygonscan.com/token/0x26F3d3c2C759acE462882864aa692FBa4512e38B

**Branding Note:**
- C12DAO uses the blue-pink gradient droplet icon 💧
- C12USD stablecoin uses its separate branding
- Do not mix the two token brands

---

## 👥 Wallet Addresses & Roles

### Key Personnel

| Role | Address | Responsibilities |
|------|---------|------------------|
| **Admin / Deployer** | `0x7903c63CB9f42284d03BC2a124474760f9C1390b` | Contract deployment, initial setup, minter role |
| **Treasurer** | `0x86111914504B82eF1c487241124C02f9D09325C4` | Treasury management, fund allocation |

### Smart Contract Roles

#### C12DAO Token Roles
- **DEFAULT_ADMIN_ROLE**: Admin (`0x7903c63CB9f42284d03BC2a124474760f9C1390b`)
- **MINTER_ROLE**: Admin (can mint new tokens up to 1B max supply)
- **Token Holders**: Anyone with C12DAO tokens (can vote when delegated)

#### C12DAOTimelock Roles
- **TIMELOCK_ADMIN_ROLE**: Admin (initial)
- **PROPOSER_ROLE**: Governor contract (pending configuration)
- **EXECUTOR_ROLE**: `AddressZero` (anyone can execute after timelock)
- **CANCELLER_ROLE**: Admin

#### C12DAOGovernor Roles
- Governor contract itself proposes to Timelock
- Token holders vote on proposals

#### C12DAOTreasury Roles
- **Owner**: Admin (`0x7903c63CB9f42284d03BC2a124474760f9C1390b`)
- **Staking Contract**: Will be set to C12DAOStaking address

#### C12DAOStaking Roles
- **Owner**: Admin (`0x7903c63CB9f42284d03BC2a124474760f9C1390b`)
- **Stakers**: Any C12DAO token holder can stake

---

## 💰 Token Distribution

### Current Token Allocation

| Holder | Address | Amount | Percentage | Purpose |
|--------|---------|--------|------------|---------|
| **Admin** | `0x7903c63CB9f42284d03BC2a124474760f9C1390b` | 400,000,000 C12DAO | 40% | Initial distribution, team allocation |
| **Treasury** | `0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83` | 200,000,000 C12DAO | 20% | DAO treasury for rewards, grants |
| **Unminted** | — | 400,000,000 C12DAO | 40% | Future minting (community, liquidity, etc.) |
| **TOTAL SUPPLY** | — | **1,000,000,000 C12DAO** | **100%** | Max supply (hard cap) |

### Minting Transactions

| Transaction | Recipient | Amount | Block | Status |
|-------------|-----------|--------|-------|--------|
| `0xd842a84c...` | Admin | 100M C12DAO | 77175626 | ✅ Success |
| `0xc025e77f...` | Admin | 100M C12DAO | 77175626 | ✅ Success |
| `0x313b1638...` | Admin | 100M C12DAO | 77175626 | ✅ Success |
| `0x79b58e99...` | Admin | 100M C12DAO | 77175626 | ✅ Success |
| `0xa093526c...` | Treasury | 200M C12DAO | 77175656 | ✅ Success |

---

## 📊 Deployment Status

### Deployment Summary

**Date:** October 2, 2025
**Deployer:** `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
**Network:** Polygon Mainnet (137)
**RPC Endpoint:** `https://polygon-bor-rpc.publicnode.com`

### Contract Deployment Transactions

| Contract | Transaction Hash | Block | Gas Used |
|----------|------------------|-------|----------|
| C12DAO Token | `0x55c62917ec601b0ae09b296c4a3cc567678a323f8a72b94686c1bb2cfc441911` | 77172900 | ✅ Confirmed |
| Treasury | `0x72d428287738fd8eac11ab3a208861443f10ed51278a935e1daabbdbe97a4e6f` | 77173264 | ✅ Confirmed |
| Timelock | `0x347624fc7b8c326643461d57f3f62c64c63893489b92c32acf313fd4af707d59` | — | ⏳ Pending |
| Governor | `0x33f8a40fb1b4e5e7c37ec5750e1387c6c493c8a1f08f742e5e8dcf24d447b601` | — | ⏳ Pending |
| Staking | `0x4e1ed844ebb8db0b86a2a590f484088461827c3c2835133867b106958a4e4f82` | — | ⏳ Pending |

### Current Status

✅ **Completed:**
- C12DAO Token deployed and verified
- Treasury contract deployed
- 600M tokens minted (400M Admin, 200M Treasury)

⏳ **In Progress:**
- Timelock, Governor, Staking contracts confirming (Polygon network congestion)

❌ **Pending:**
- Grant PROPOSER_ROLE to Governor on Timelock
- Set staking contract address in Treasury
- Contract verification on Polygonscan

---

## 🗺️ Initial Setup Roadmap

### Phase 1: Contract Deployment ✅ COMPLETE

- [x] Deploy C12DAO Token
- [x] Deploy C12DAOTreasury
- [x] Deploy C12DAOTimelock
- [x] Deploy C12DAOGovernor
- [x] Deploy C12DAOStaking
- [x] Mint initial tokens to Admin (400M)
- [x] Mint treasury allocation (200M)

### Phase 2: Configuration ⏳ IN PROGRESS

**Status:** Waiting for Timelock, Governor, and Staking contract confirmations

**To Do (After Confirmations):**

1. **Grant Governor PROPOSER_ROLE on Timelock**
   ```bash
   cd C12USD
   npx hardhat run scripts/dao/configure-roles.js --network polygon
   ```

2. **Set Staking Contract in Treasury**
   ```javascript
   // This allows staking contract to interact with treasury for rewards
   await treasury.setStakingContract(STAKING_ADDRESS);
   ```

3. **Verify Contracts on Polygonscan**
   ```bash
   # C12DAO Token
   npx hardhat verify --network polygon 0x26F3d3c2C759acE462882864aa692FBa4512e38B "0x7903c63CB9f42284d03BC2a124474760f9C1390b"

   # Timelock (after confirmation)
   npx hardhat verify --network polygon 0xC6C82F86Dc4b2ab0239311D01ABa5907bB907B66 \
     "172800" "[]" '["0x0000000000000000000000000000000000000000"]' "0x7903c63CB9f42284d03BC2a124474760f9C1390b"

   # Governor (after confirmation)
   npx hardhat verify --network polygon 0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a \
     "0x26F3d3c2C759acE462882864aa692FBa4512e38B" "0xC6C82F86Dc4b2ab0239311D01ABa5907bB907B66"

   # Treasury
   npx hardhat verify --network polygon 0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83 \
     "0x26F3d3c2C759acE462882864aa692FBa4512e38B" "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811" "0x7903c63CB9f42284d03BC2a124474760f9C1390b"

   # Staking (after confirmation)
   npx hardhat verify --network polygon 0x26F5470B289dE63a3B1b726cE3DCe2EaEB3471ee \
     "0x26F3d3c2C759acE462882864aa692FBa4512e38B" "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83" "0x7903c63CB9f42284d03BC2a124474760f9C1390b"
   ```

### Phase 3: Token Distribution 📅 PLANNED

1. **Delegate Voting Power**
   - Admin should delegate their 400M tokens to themselves or a voting address
   - Treasury tokens delegated to governance multisig or DAO

2. **Initial Liquidity Provision**
   - Allocate tokens for DEX liquidity (Uniswap, Quickswap)
   - Suggested: 50-100M C12DAO + paired assets

3. **Community Distribution**
   - Airdrops to early supporters
   - Liquidity mining rewards
   - Community grants program

### Phase 4: Governance Activation 📅 PLANNED

1. **Create Test Proposal**
   - Submit a simple test proposal
   - Verify voting works correctly
   - Ensure timelock execution works

2. **Transition to Full DAO Governance**
   - Gradually transfer admin powers to Governor
   - Consider renouncing certain admin roles
   - Set up multisig for emergency actions

3. **Activate Staking Rewards**
   - Fund staking rewards in Treasury
   - Set reward rates for each tier
   - Enable staking for community

---

## ⚙️ Governance Parameters

### C12DAOGovernor Settings

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Voting Delay** | 1 day (7,200 blocks) | Time after proposal creation before voting starts |
| **Voting Period** | 7 days (50,400 blocks) | Duration of voting period |
| **Proposal Threshold** | 100,000 C12DAO | Minimum tokens needed to create proposal |
| **Quorum** | 4% of total supply | Minimum votes needed for proposal to pass |
| **Quorum Numerator** | 4 | Used in quorum calculation |
| **Timelock Delay** | 48 hours (172,800 seconds) | Delay before executing passed proposals |

### Voting Math

- **Quorum Required**: 40,000,000 C12DAO (4% of 1B)
- **Proposal Threshold**: 100,000 C12DAO (0.01% of supply)
- **Block Time**: ~2 seconds per block on Polygon

### Staking Tiers

| Tier | Lock Period | APY Boost | Voting Weight |
|------|-------------|-----------|---------------|
| **Flexible** | None | 1x | 1x |
| **Bronze** | 30 days | 1.2x | 1.2x |
| **Silver** | 90 days | 1.5x | 1.5x |
| **Gold** | 180 days | 2x | 2x |
| **Platinum** | 365 days | 3x | 3x |

---

## 📘 Management Instructions

### 1. Checking Token Balances

```bash
cd C12USD
node scripts/dao/check-balances.js
```

### 2. Checking Deployment Status

```bash
cd C12USD
node scripts/dao/check-deployment-status.js
```

### 3. Creating a Governance Proposal

**Prerequisites:**
- Must hold at least 100,000 C12DAO tokens
- Tokens must be delegated (self-delegate if needed)
- Governor and Timelock must be fully configured

**Steps:**

```javascript
// 1. Connect to network
const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 2. Get Governor contract
const governor = await ethers.getContractAt("C12DAOGovernor", GOVERNOR_ADDRESS, wallet);

// 3. Prepare proposal
const targets = [TARGET_CONTRACT_ADDRESS]; // Contract to call
const values = [0]; // ETH to send (usually 0)
const calldatas = [encodedFunctionCall]; // Encoded function call
const description = "Proposal: Do something important";

// 4. Submit proposal
const proposeTx = await governor.propose(targets, values, calldatas, description);
await proposeTx.wait();

console.log("Proposal created!");
```

### 4. Voting on a Proposal

```javascript
// Get proposal ID from creation event
const proposalId = "0x...";

// Vote: 0 = Against, 1 = For, 2 = Abstain
const voteTx = await governor.castVote(proposalId, 1); // Vote "For"
await voteTx.wait();
```

### 5. Executing a Passed Proposal

**After voting period ends and proposal passes:**

```javascript
// Wait for timelock delay (48 hours)
// Then execute:

const executeTx = await governor.execute(
  targets,
  values,
  calldatas,
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description))
);
await executeTx.wait();
```

### 6. Delegating Voting Power

**Important:** You must delegate your tokens to vote (even to yourself!)

```javascript
const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS, wallet);

// Delegate to yourself
await c12dao.delegate(wallet.address);

// OR delegate to another address
await c12dao.delegate(DELEGATEE_ADDRESS);
```

### 7. Staking C12DAO Tokens

```javascript
const staking = await ethers.getContractAt("C12DAOStaking", STAKING_ADDRESS, wallet);
const amount = ethers.utils.parseEther("1000"); // 1000 C12DAO
const tier = 3; // 0=Flexible, 1=Bronze, 2=Silver, 3=Gold, 4=Platinum

// Approve staking contract
const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS, wallet);
await c12dao.approve(STAKING_ADDRESS, amount);

// Stake tokens
await staking.stake(amount, tier);
```

### 8. Managing Treasury

```javascript
const treasury = await ethers.getContractAt("C12DAOTreasury", TREASURY_ADDRESS, wallet);

// Check treasury balance
const balance = await c12dao.balanceOf(TREASURY_ADDRESS);
console.log("Treasury:", ethers.utils.formatEther(balance), "C12DAO");

// Withdraw (only owner or via governance)
await treasury.withdraw(RECIPIENT, AMOUNT);
```

### 9. Minting Additional Tokens

**Only possible if total supply < 1B**

```javascript
const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS, wallet);
const amount = ethers.utils.parseEther("1000000"); // 1M tokens

await c12dao.mint(RECIPIENT_ADDRESS, amount);
```

---

## 🔒 Security & Best Practices

### Private Key Management

**⚠️ CRITICAL: Never commit private keys to version control!**

- Store `PRIVATE_KEY` and `OPS_SIGNER_PRIVATE_KEY` only in `.env` (gitignored)
- For production, use:
  - Hardware wallets (Ledger, Trezor)
  - Multisig wallets (Gnosis Safe)
  - Secret management services (Google Secret Manager, AWS Secrets Manager)

### Role Management

1. **Admin Role**
   - Most powerful role - can mint tokens and manage contracts
   - Consider using a multisig for this role
   - Plan to transfer to DAO governance eventually

2. **Timelock Admin**
   - Can manage timelock roles
   - Should be transferred to Governor after testing

3. **Emergency Procedures**
   - Document emergency contacts
   - Set up 24/7 monitoring
   - Have pause mechanisms ready

### Governance Best Practices

1. **Proposal Creation**
   - Test proposals on testnet first
   - Include detailed documentation
   - Allow community discussion period

2. **Voting**
   - Encourage wide participation
   - Provide voting guides
   - Monitor for voting attacks

3. **Execution**
   - Verify proposal details before execution
   - Monitor execution transactions
   - Have rollback plans

### Smart Contract Interactions

1. **Gas Management**
   - Always check gas prices before transactions
   - Set appropriate gas limits
   - Use gas price multipliers for priority (e.g., 150-300%)

2. **Transaction Monitoring**
   - Monitor all transactions on Polygonscan
   - Save transaction hashes
   - Keep deployment logs

---

## 🔧 Troubleshooting

### Issue: Transactions Stuck Pending

**Symptoms:** Transaction shows "Pending" for >10 minutes on Polygonscan

**Solutions:**
1. Check Polygon network status: https://polygon.technology/network-status
2. Replace transaction with higher gas price
3. Wait longer (during congestion, can take 30-60+ minutes)

### Issue: Cannot Create Proposal

**Possible Causes:**
- Don't have 100,000 C12DAO tokens
- Tokens not delegated
- Governor not configured correctly

**Solutions:**
```javascript
// Check balance
const balance = await c12dao.balanceOf(yourAddress);

// Check delegation
const delegatee = await c12dao.delegates(yourAddress);
if (delegatee === ethers.constants.AddressZero) {
  await c12dao.delegate(yourAddress); // Self-delegate
}
```

### Issue: Contract Call Reverts

**Error:** `call revert exception`

**Causes:**
- Contract not deployed yet (check bytecode)
- Wrong contract address
- Function doesn't exist or wrong parameters
- Insufficient permissions

**Solutions:**
1. Verify contract is deployed:
   ```javascript
   const code = await provider.getCode(contractAddress);
   console.log("Has code:", code !== '0x');
   ```

2. Check contract on Polygonscan
3. Verify you have required role/permission

### Issue: RPC Connection Errors

**Error:** `could not detect network` or `ENOTFOUND`

**Solutions:**
1. Try different RPC endpoints:
   - `https://polygon-bor-rpc.publicnode.com`
   - `https://polygon-rpc.com`
   - Get Alchemy API key: https://www.alchemy.com/

2. Update `.env`:
   ```
   POLYGON_RPC=https://your-new-rpc-endpoint
   ```

### Checking Contract Confirmations

```bash
cd C12USD
node scripts/dao/check-deployment-status.js
```

This shows which contracts are confirmed vs pending.

---

## 📚 Resources

### Documentation

- **OpenZeppelin Governance**: https://docs.openzeppelin.com/contracts/4.x/governance
- **Polygon Network**: https://docs.polygon.technology/
- **Hardhat**: https://hardhat.org/docs
- **Ethers.js**: https://docs.ethers.org/v5/

### Network Information

- **Polygon Mainnet RPC**: `https://polygon-bor-rpc.publicnode.com`
- **Chain ID**: 137
- **Block Explorer**: https://polygonscan.com/
- **Gas Tracker**: https://polygonscan.com/gastracker
- **Network Status**: https://polygon.technology/network-status

### Useful Tools

- **Polygonscan**: View all contracts and transactions
- **Gnosis Safe**: Multisig wallet for DAO management
- **Tally**: Governance UI (https://www.tally.xyz/)
- **Snapshot**: Off-chain voting (https://snapshot.org/)

### API Keys

- **Etherscan Multichain API**: `3R637V9YYHQMIB4HCXWMISAU92P9R2E5FU`
  - Works for BSC, Polygon, and 60+ networks
  - Get yours: https://etherscan.io/apis

### Support & Community

- **GitHub Issues**: Report bugs and issues
- **Discord**: Community discussions
- **Twitter**: Updates and announcements

---

## ✅ Deployment Checklist

Use this checklist to track your DAO setup progress:

### Pre-Deployment
- [x] Contracts compiled successfully
- [x] Tests passed
- [x] Deployment scripts reviewed
- [x] RPC endpoint configured
- [x] Deployer wallet funded with MATIC

### Deployment
- [x] C12DAO Token deployed
- [x] C12DAOTreasury deployed
- [x] C12DAOTimelock deployed (confirming)
- [x] C12DAOGovernor deployed (confirming)
- [x] C12DAOStaking deployed (confirming)

### Token Distribution
- [x] 400M C12DAO minted to Admin
- [x] 200M C12DAO minted to Treasury
- [ ] Tokens delegated for voting
- [ ] Initial liquidity provided

### Configuration
- [ ] Wait for all contract confirmations
- [ ] Grant PROPOSER_ROLE to Governor
- [ ] Set Staking contract in Treasury
- [ ] Verify contracts on Polygonscan

### Testing
- [ ] Create test governance proposal
- [ ] Vote on test proposal
- [ ] Execute test proposal via timelock
- [ ] Test staking functionality
- [ ] Test delegation

### Production Ready
- [ ] All contracts verified
- [ ] Governance fully functional
- [ ] Admin keys secured (multisig/hardware wallet)
- [ ] Emergency procedures documented
- [ ] Community onboarding materials ready

---

## 📊 Quick Reference Commands

### Check Balances
```bash
node scripts/dao/check-balances.js
```

### Check Deployment Status
```bash
node scripts/dao/check-deployment-status.js
```

### Verify Contract
```bash
npx hardhat verify --network polygon <ADDRESS> <CONSTRUCTOR_ARGS>
```

### Mint Tokens (if needed)
```bash
npx hardhat run scripts/dao/mint-tokens-only.js --network polygon
```

### Configure Roles (after confirmations)
```bash
npx hardhat run scripts/dao/configure-and-mint.js --network polygon
```

---

**Last Updated:** October 2, 2025
**Document Version:** 1.0
**Maintained By:** C12DAO Team

---

## 🚨 Important Notes

1. **Timelock Delay**: All governance actions have a **48-hour delay** after passing. Plan accordingly.

2. **Proposal Threshold**: You need **100,000 C12DAO** tokens to create proposals.

3. **Voting Power**: Must delegate tokens to yourself or another address to vote.

4. **Max Supply**: Hard cap of **1 billion C12DAO** tokens. No more can be minted after reaching this limit.

5. **Network Congestion**: Polygon mainnet can experience delays. Use high gas prices (200-300% of base) for important transactions.

6. **Security**: Always verify contract addresses on Polygonscan before interacting. Never share private keys.

---

*This document is a living guide and should be updated as the DAO evolves.*
