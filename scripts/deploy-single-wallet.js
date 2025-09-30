// C12USD Single Wallet Deployment & Role Management Script
// Deploys contracts with single wallet, then provides easy multi-sig setup

const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const { RoleManager, DEFAULT_MULTISIG_CONFIG } = require('./role-management');
require("dotenv").config({ path: '.env.production' });

class SingleWalletDeployer {
  constructor() {
    this.deployments = {};
    this.deployer = null;
    this.roleManager = null;
  }

  async initialize() {
    [this.deployer] = await ethers.getSigners();

    console.log("🚀 C12USD SINGLE WALLET DEPLOYMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 Deployer: ${this.deployer.address}`);

    const balance = await this.deployer.getBalance();
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      throw new Error("Insufficient balance for deployment. Need at least 0.01 ETH.");
    }
  }

  async deployContracts(networkName, layerZeroEndpoint) {
    console.log(`\n📄 DEPLOYING CONTRACTS ON ${networkName.toUpperCase()}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Deploy C12USD Token
    console.log("1️⃣ Deploying C12USD Token...");
    const TokenFactory = await ethers.getContractFactory("C12USDTokenEnhanced");
    const token = await TokenFactory.deploy(
      layerZeroEndpoint,     // LayerZero endpoint
      this.deployer.address, // Delegate (same as deployer initially)
      this.deployer.address  // Owner (deployer initially gets all roles)
    );
    await token.deployed();
    console.log(`   ✅ C12USD Token deployed: ${token.address}`);

    // Deploy MintRedeemGateway
    console.log("2️⃣ Deploying MintRedeemGateway...");
    const GatewayFactory = await ethers.getContractFactory("MintRedeemGateway");
    const gateway = await GatewayFactory.deploy(
      token.address,         // Token contract address
      this.deployer.address  // Owner (deployer initially gets all roles)
    );
    await gateway.deployed();
    console.log(`   ✅ MintRedeemGateway deployed: ${gateway.address}`);

    // Grant gateway permission to mint/burn on token
    console.log("3️⃣ Setting up contract permissions...");
    const MINTER_ROLE = await token.MINTER_ROLE();
    const BURNER_ROLE = await token.BURNER_ROLE();

    await token.grantRole(MINTER_ROLE, gateway.address);
    console.log("   ✅ Gateway granted MINTER_ROLE on token");

    await token.grantRole(BURNER_ROLE, gateway.address);
    console.log("   ✅ Gateway granted BURNER_ROLE on token");

    // Store deployment info
    this.deployments[networkName] = {
      deployer: this.deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        C12USDToken: token.address,
        MintRedeemGateway: gateway.address,
        LayerZeroEndpoint: layerZeroEndpoint
      },
      gasUsed: {
        token: (await token.deployTransaction.wait()).gasUsed.toString(),
        gateway: (await gateway.deployTransaction.wait()).gasUsed.toString()
      }
    };

    console.log(`\n✅ ${networkName} deployment completed successfully!`);
    return { token, gateway };
  }

  async setupRoleManager(tokenAddress, gatewayAddress) {
    this.roleManager = new RoleManager(tokenAddress, gatewayAddress, this.deployer);
    await this.roleManager.initialize();
  }

  async displayDeploymentSummary() {
    console.log("\n📊 DEPLOYMENT SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    for (const [network, deployment] of Object.entries(this.deployments)) {
      console.log(`\n🌐 ${network.toUpperCase()}:`);
      console.log(`   📄 C12USD Token: ${deployment.contracts.C12USDToken}`);
      console.log(`   🚪 MintRedeemGateway: ${deployment.contracts.MintRedeemGateway}`);
      console.log(`   ⛽ Gas Used: Token(${deployment.gasUsed.token}) Gateway(${deployment.gasUsed.gateway})`);
    }
  }

  async generateRoleSetupGuide() {
    console.log("\n📖 ROLE SETUP GUIDE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const guide = `
# C12USD Role Management Guide

## Current Status
✅ Contracts deployed successfully
⚠️  All roles currently assigned to deployer wallet: ${this.deployer.address}

## Required Multi-Sig Wallets

### 1. Treasury Multi-Sig (Most Critical)
- **Purpose**: Controls admin functions, flash loan parameters
- **Roles**: DEFAULT_ADMIN_ROLE, FLASH_LOAN_ADMIN_ROLE
- **Recommended**: 3/5 multi-sig with core team members

### 2. Operations Multi-Sig
- **Purpose**: Daily operations, minting/burning
- **Roles**: MINTER_ROLE, BURNER_ROLE
- **Recommended**: 2/3 multi-sig with operations team

### 3. Security Multi-Sig
- **Purpose**: Emergency responses, pausing
- **Roles**: PAUSER_ROLE, CIRCUIT_BREAKER_ROLE
- **Recommended**: 2/4 multi-sig with security team + external

### 4. Automated Service Wallets
- **Purpose**: Programmatic operations
- **Roles**: SIGNER_ROLE, MINTER_ROLE, BURNER_ROLE
- **Note**: Single signature wallets for automation

## Setup Steps

### Step 1: Create Multi-Sig Wallets
Create the required multi-sig wallets using Safe (formerly Gnosis Safe):
- Treasury Multi-Sig
- Operations Multi-Sig
- Security Multi-Sig

### Step 2: Configure Role Assignments
Update the configuration in role-management.js:

\`\`\`javascript
const MULTISIG_CONFIG = {
  treasury: "0x...", // Your treasury multi-sig address
  operations: "0x...", // Your operations multi-sig address
  security: "0x...", // Your security multi-sig address
  emergency: "0x...", // Emergency response address
  automatedSigner: "0x...", // Automated service wallet
  backupOperator: "0x..." // Backup operator wallet
};
\`\`\`

### Step 3: Execute Role Assignment
Run the role assignment script:
\`\`\`bash
TOKEN_ADDRESS=${this.deployments[Object.keys(this.deployments)[0]]?.contracts.C12USDToken || 'DEPLOYED_TOKEN_ADDRESS'} GATEWAY_ADDRESS=${this.deployments[Object.keys(this.deployments)[0]]?.contracts.MintRedeemGateway || 'DEPLOYED_GATEWAY_ADDRESS'} npx hardhat run scripts/setup-multisig-roles.js --network mainnet
\`\`\`

### Step 4: Revoke Deployer Access
Once multi-sig is confirmed working:
\`\`\`bash
TOKEN_ADDRESS=... GATEWAY_ADDRESS=... npx hardhat run scripts/finalize-role-transition.js --network mainnet
\`\`\`

## Emergency Procedures

### Circuit Breaker Activation
Any security multi-sig member can activate emergency stop:
- Calls \`tripCircuitBreaker(reason)\` on token contract
- Immediately pauses all operations

### Role Recovery
If multi-sig becomes unavailable:
- DEFAULT_ADMIN_ROLE can grant new roles
- Treasury multi-sig should maintain backup procedures

## Verification Commands

Check current roles:
\`\`\`bash
TOKEN_ADDRESS=... GATEWAY_ADDRESS=... npx hardhat run scripts/verify-roles.js --network mainnet
\`\`\`
`;

    // Save guide to file
    const guidePath = path.join(__dirname, '..', 'ROLE_SETUP_GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    console.log(`📝 Detailed guide saved to: ${guidePath}`);

    // Display abbreviated version
    console.log("\n🔑 NEXT STEPS:");
    console.log("1. Create multi-sig wallets using Safe (https://app.safe.global)");
    console.log("2. Update MULTISIG_CONFIG in scripts/setup-multisig-roles.js");
    console.log("3. Run: npm run setup:multisig");
    console.log("4. After verification, run: npm run finalize:roles");
    console.log("\n📖 See ROLE_SETUP_GUIDE.md for complete instructions");
  }

  async saveDeploymentData() {
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'single-wallet-deployment.json');
    const deploymentDir = path.dirname(deploymentPath);

    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(this.deployments, null, 2));
    console.log(`\n💾 Deployment data saved to: ${deploymentPath}`);

    // Also save environment file template
    const envPath = path.join(__dirname, '..', 'deployments', 'production.env.template');
    const envContent = Object.entries(this.deployments)
      .map(([network, deployment]) => `
# ${network.toUpperCase()} Contract Addresses
${network.toUpperCase()}_TOKEN_ADDRESS=${deployment.contracts.C12USDToken}
${network.toUpperCase()}_GATEWAY_ADDRESS=${deployment.contracts.MintRedeemGateway}
${network.toUpperCase()}_LZ_ENDPOINT=${deployment.contracts.LayerZeroEndpoint}
`).join('\n');

    fs.writeFileSync(envPath, envContent);
    console.log(`🔧 Environment template saved to: ${envPath}`);
  }
}

async function deployToNetwork(networkName, chainId, rpcUrl, layerZeroEndpoint) {
  const deployer = new SingleWalletDeployer();
  await deployer.initialize();

  console.log(`\n🌐 Deploying to ${networkName} (Chain ID: ${chainId})`);
  console.log(`📡 RPC: ${rpcUrl}`);
  console.log(`🔗 LayerZero Endpoint: ${layerZeroEndpoint}`);

  const { token, gateway } = await deployer.deployContracts(networkName, layerZeroEndpoint);

  // Setup role manager for immediate role inspection
  await deployer.setupRoleManager(token.address, gateway.address);
  await deployer.roleManager.displayCurrentRoles();

  return deployer;
}

async function main() {
  console.log("🚀 Starting C12USD Single Wallet Deployment...\n");

  const deployer = new SingleWalletDeployer();
  let deployments = [];

  try {
    // BSC Deployment
    console.log("🟡 DEPLOYING TO BSC MAINNET");
    const bscDeployer = await deployToNetwork(
      "bsc",
      56,
      process.env.BSC_RPC || "https://bsc-dataseed1.binance.org/",
      "0x3c2269811836af69497E5F486A85D7316753cf62"
    );
    deployments.push(bscDeployer);

    // Polygon Deployment
    console.log("\n🟣 DEPLOYING TO POLYGON MAINNET");
    const polygonDeployer = await deployToNetwork(
      "polygon",
      137,
      process.env.POLYGON_RPC || "https://polygon-rpc.com/",
      "0x3c2269811836af69497E5F486A85D7316753cf62"
    );
    deployments.push(polygonDeployer);

    // Merge deployment data
    for (const d of deployments) {
      Object.assign(deployer.deployments, d.deployments);
    }

    // Generate summary and guides
    await deployer.displayDeploymentSummary();
    await deployer.saveDeploymentData();
    await deployer.generateRoleSetupGuide();

    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ All contracts deployed with single wallet");
    console.log("✅ Initial permissions configured");
    console.log("✅ Role management system ready");
    console.log("✅ Multi-sig setup guide generated");
    console.log("\n📖 Next: Follow ROLE_SETUP_GUIDE.md to configure multi-sig wallets");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("\n🔍 Common issues:");
    console.error("- Insufficient gas/balance");
    console.error("- Network connectivity");
    console.error("- Invalid LayerZero endpoint");
    console.error("- Contract compilation errors");
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

module.exports = { SingleWalletDeployer };