# Manual Deployment Guide - C12DAO Contracts

**Issue:** Automated deployment scripts are hanging during C12DAO token deployment.
**Root Cause:** Gas estimation failing for large contracts on Polygon mainnet.
**Solution:** Manual deployment with explicit gas settings.

## Quick Manual Deployment (Recommended)

### Step 1: Deploy C12DAO Token

Open Hardhat console:
```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD
npx hardhat console --network polygon
```

Then run these commands one by one:

```javascript
// Get deployer
const [deployer] = await ethers.getSigners();
console.log("Deployer:", deployer.address);
console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()), "MATIC");

// Set gas settings
const gasPrice = await ethers.provider.getGasPrice();
const gasSettings = {
  gasPrice: gasPrice.mul(120).div(100), // 120% of current
  gasLimit: 5000000 // 5M gas for large contract
};

console.log("Gas price:", ethers.utils.formatUnits(gasSettings.gasPrice, "gwei"), "gwei");

// Deploy C12DAO Token
const ADMIN = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
const C12DAOFactory = await ethers.getContractFactory("C12DAO");

console.log("Deploying C12DAO token...");
const c12dao = await C12DAOFactory.deploy(ADMIN, gasSettings);
console.log("TX sent:", c12dao.deployTransaction.hash);
console.log("Waiting for confirmation...");

await c12dao.deployed();
console.log("✅ C12DAO deployed:", c12dao.address);

// Mint 100M to admin
console.log("Minting 100M tokens to admin...");
const mintTx = await c12dao.mint(ADMIN, ethers.utils.parseEther("100000000"), gasSettings);
await mintTx.wait();
console.log("✅ Minted! TX:", mintTx.hash);

// Save address
console.log("\n📋 SAVE THIS ADDRESS:");
console.log("C12DAO_ADDRESS=" + c12dao.address);
```

### Step 2: Deploy Timelock

```javascript
// Deploy Timelock
const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");

console.log("Deploying Timelock...");
const timelock = await TimelockFactory.deploy(
  172800, // 48 hours
  [], // Proposers (will add governor later)
  [ethers.constants.AddressZero], // Executors (anyone)
  ADMIN,
  { ...gasSettings, gasLimit: 3000000 }
);

console.log("TX sent:", timelock.deployTransaction.hash);
await timelock.deployed();
console.log("✅ Timelock deployed:", timelock.address);
console.log("TIMELOCK_ADDRESS=" + timelock.address);
```

### Step 3: Deploy Governor

```javascript
// Deploy Governor
const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");

console.log("Deploying Governor...");
const governor = await GovernorFactory.deploy(
  c12dao.address,
  timelock.address,
  { ...gasSettings, gasLimit: 4000000 }
);

console.log("TX sent:", governor.deployTransaction.hash);
await governor.deployed();
console.log("✅ Governor deployed:", governor.address);
console.log("GOVERNOR_ADDRESS=" + governor.address);
```

### Step 4: Deploy Treasury

```javascript
// Deploy Treasury
const C12USD_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";
const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");

console.log("Deploying Treasury...");
const treasury = await TreasuryFactory.deploy(
  c12dao.address,
  C12USD_ADDRESS,
  ADMIN,
  { ...gasSettings, gasLimit: 3000000 }
);

console.log("TX sent:", treasury.deployTransaction.hash);
await treasury.deployed();
console.log("✅ Treasury deployed:", treasury.address);

// Mint 200M to treasury
console.log("Minting 200M tokens to treasury...");
const treasuryMintTx = await c12dao.mint(treasury.address, ethers.utils.parseEther("200000000"), gasSettings);
await treasuryMintTx.wait();
console.log("✅ Minted! TX:", treasuryMintTx.hash);

console.log("TREASURY_ADDRESS=" + treasury.address);
```

### Step 5: Deploy Staking

```javascript
// Deploy Staking
const StakingFactory = await ethers.getContractFactory("C12DAOStaking");

console.log("Deploying Staking...");
const staking = await StakingFactory.deploy(
  c12dao.address,
  treasury.address,
  ADMIN,
  { ...gasSettings, gasLimit: 4000000 }
);

console.log("TX sent:", staking.deployTransaction.hash);
await staking.deployed();
console.log("✅ Staking deployed:", staking.address);
console.log("STAKING_ADDRESS=" + staking.address);
```

### Step 6: Configure Roles

```javascript
// Grant Governor PROPOSER_ROLE on Timelock
console.log("Granting PROPOSER_ROLE to Governor...");
const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
const grantTx = await timelock.grantRole(PROPOSER_ROLE, governor.address, gasSettings);
await grantTx.wait();
console.log("✅ Role granted! TX:", grantTx.hash);

// Set staking in treasury
console.log("Setting staking contract in treasury...");
const setStakingTx = await treasury.setStakingContract(staking.address, gasSettings);
await setStakingTx.wait();
console.log("✅ Staking set! TX:", setStakingTx.hash);

// Print summary
console.log("\n🎉 Deployment Complete!");
console.log("========================");
console.log("C12DAO:    ", c12dao.address);
console.log("Timelock:  ", timelock.address);
console.log("Governor:  ", governor.address);
console.log("Treasury:  ", treasury.address);
console.log("Staking:   ", staking.address);
```

## Alternative: Use Remix IDE

If Hardhat console also has issues:

1. Go to https://remix.ethereum.org
2. Upload contracts from `C12USD/contracts/dao/`
3. Compile all contracts
4. Connect MetaMask to Polygon mainnet
5. Deploy in order with these constructor parameters:

**C12DAO:**
- admin: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`

**C12DAOTimelock:**
- minDelay: `172800`
- proposers: `[]`
- executors: `["0x0000000000000000000000000000000000000000"]`
- admin: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`

**C12DAOGovernor:**
- _token: `<C12DAO_ADDRESS>`
- _timelock: `<TIMELOCK_ADDRESS>`

**C12DAOTreasury:**
- _c12daoToken: `<C12DAO_ADDRESS>`
- _c12usdToken: `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811`
- _admin: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`

**C12DAOStaking:**
- _c12daoToken: `<C12DAO_ADDRESS>`
- _treasury: `<TREASURY_ADDRESS>`
- _admin: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`

## After Deployment

Save all addresses and run verification:

```bash
# Verify on PolygonScan
npx hardhat verify --network polygon <C12DAO_ADDRESS> 0x7903c63CB9f42284d03BC2a124474760f9C1390b
npx hardhat verify --network polygon <TIMELOCK_ADDRESS> "172800" "[]" "[0x0000000000000000000000000000000000000000]" 0x7903c63CB9f42284d03BC2a124474760f9C1390b
npx hardhat verify --network polygon <GOVERNOR_ADDRESS> <C12DAO_ADDRESS> <TIMELOCK_ADDRESS>
npx hardhat verify --network polygon <TREASURY_ADDRESS> <C12DAO_ADDRESS> 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811 0x7903c63CB9f42284d03BC2a124474760f9C1390b
npx hardhat verify --network polygon <STAKING_ADDRESS> <C12DAO_ADDRESS> <TREASURY_ADDRESS> 0x7903c63CB9f42284d03BC2a124474760f9C1390b
```

---

**Summary:** Use Hardhat console for manual deployment with explicit gas limits to avoid estimation issues.
