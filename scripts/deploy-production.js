const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
require("dotenv").config({ path: '.env.production' });

async function deployToNetwork(networkName, chainId, rpcUrl, layerZeroEndpoint) {
  console.log(`\n🚀 Deploying to ${networkName} (Chain ID: ${chainId})`);
  console.log(`📡 RPC: ${rpcUrl}`);
  console.log(`🔗 LayerZero Endpoint: ${layerZeroEndpoint}`);

  // Switch to the specific network
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(process.env.OPS_SIGNER_PRIVATE_KEY, provider);

  console.log(`👤 Deploying with account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    throw new Error(`Insufficient balance for deployment. Need at least 0.01 ETH for gas fees.`);
  }

  // Deploy C12USD Token
  console.log(`\n📄 Deploying C12USD Token contract on ${networkName}...`);
  const C12USDToken = await ethers.getContractFactory("C12USDTokenEnhanced");
  C12USDToken.connect(deployer);

  const c12usdToken = await C12USDToken.deploy(
    layerZeroEndpoint,   // LayerZero endpoint
    deployer.address,    // Delegate (deployer)
    deployer.address     // Owner (deployer)
  );

  await c12usdToken.deployed();
  console.log(`✅ C12USD Token deployed to: ${c12usdToken.address}`);

  // Wait for confirmations
  console.log(`⏳ Waiting for 5 confirmations...`);
  await c12usdToken.deployTransaction.wait(5);

  // Deploy MintRedeemGateway
  console.log(`\n🏗️  Deploying MintRedeemGateway contract on ${networkName}...`);
  const MintRedeemGateway = await ethers.getContractFactory("MintRedeemGateway");
  MintRedeemGateway.connect(deployer);

  const gateway = await MintRedeemGateway.deploy(
    c12usdToken.address,  // C12USD token address
    deployer.address      // Owner (deployer)
  );

  await gateway.deployed();
  console.log(`✅ MintRedeemGateway deployed to: ${gateway.address}`);

  // Wait for confirmations
  console.log(`⏳ Waiting for 5 confirmations...`);
  await gateway.deployTransaction.wait(5);

  // Grant gateway permission to mint and burn tokens
  console.log(`\n🔑 Configuring contract permissions on ${networkName}...`);

  const MINTER_ROLE = await c12usdToken.MINTER_ROLE();
  const BURNER_ROLE = await c12usdToken.BURNER_ROLE();

  // Grant roles to the gateway
  console.log("   Granting MINTER_ROLE to gateway...");
  const mintTx = await c12usdToken.grantRole(MINTER_ROLE, gateway.address);
  await mintTx.wait(2);

  console.log("   Granting BURNER_ROLE to gateway...");
  const burnTx = await c12usdToken.grantRole(BURNER_ROLE, gateway.address);
  await burnTx.wait(2);

  // Verify deployment
  console.log(`\n🔍 Verifying deployment on ${networkName}...`);
  const tokenName = await c12usdToken.name();
  const tokenSymbol = await c12usdToken.symbol();
  const maxSupply = await c12usdToken.PILOT_MAX_SUPPLY();
  const remainingSupply = await c12usdToken.remainingPilotSupply();

  console.log(`   Token name: ${tokenName}`);
  console.log(`   Token symbol: ${tokenSymbol}`);
  console.log(`   Pilot max supply: ${ethers.utils.formatEther(maxSupply)} tokens`);
  console.log(`   Remaining supply: ${ethers.utils.formatEther(remainingSupply)} tokens`);

  // Return deployment info
  return {
    network: {
      name: networkName,
      chainId: chainId,
      rpcUrl: rpcUrl
    },
    contracts: {
      C12USDToken: c12usdToken.address,
      MintRedeemGateway: gateway.address,
      LayerZeroEndpoint: layerZeroEndpoint
    },
    transactions: {
      tokenDeployment: c12usdToken.deployTransaction.hash,
      gatewayDeployment: gateway.deployTransaction.hash,
      mintRoleGrant: mintTx.hash,
      burnRoleGrant: burnTx.hash
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await provider.getBlockNumber()
  };
}

async function main() {
  console.log("🚀 Starting C12USD Production Contract Deployment...");
  console.log("⚠️  WARNING: This will deploy to MAINNET networks with real funds!");

  // Validate environment
  if (!process.env.OPS_SIGNER_PRIVATE_KEY || process.env.OPS_SIGNER_PRIVATE_KEY.includes('REPLACE')) {
    throw new Error("❌ OPS_SIGNER_PRIVATE_KEY must be set to your actual private key");
  }

  const deployments = [];

  try {
    // Deploy to BSC Mainnet
    const bscDeployment = await deployToNetwork(
      "BSC Mainnet",
      56,
      process.env.BSC_RPC,
      process.env.LZ_ENDPOINT_BSC
    );
    deployments.push(bscDeployment);

    // Deploy to Polygon Mainnet
    const polygonDeployment = await deployToNetwork(
      "Polygon Mainnet",
      137,
      process.env.POLYGON_RPC,
      process.env.LZ_ENDPOINT_POLYGON
    );
    deployments.push(polygonDeployment);

    // Save deployment info
    const deploymentData = {
      timestamp: new Date().toISOString(),
      environment: "production",
      networks: deployments
    };

    const filename = `deployments/production-${Date.now()}.json`;
    fs.mkdirSync('deployments', { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));

    // Update deployment log
    await updateDeploymentLog(deployments);

    // Output summary
    console.log("\n" + "=" .repeat(80));
    console.log("🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(80));

    deployments.forEach(deployment => {
      console.log(`\n📍 ${deployment.network.name} (${deployment.network.chainId})`);
      console.log(`   C12USD Token: ${deployment.contracts.C12USDToken}`);
      console.log(`   MintRedeemGateway: ${deployment.contracts.MintRedeemGateway}`);
    });

    console.log(`\n📁 Full deployment info saved to: ${filename}`);
    console.log(`📝 Deployment log updated: DEPLOYMENT_LOG.md`);

    // Generate verification commands
    console.log(`\n🔍 Contract Verification Commands:`);
    deployments.forEach(deployment => {
      const networkFlag = deployment.network.chainId === 56 ? 'bsc' : 'polygon';
      console.log(`\n# ${deployment.network.name}`);
      console.log(`npx hardhat verify --network ${networkFlag} ${deployment.contracts.C12USDToken} "${deployment.contracts.LayerZeroEndpoint}" "${deployment.deployer}" "${deployment.deployer}"`);
      console.log(`npx hardhat verify --network ${networkFlag} ${deployment.contracts.MintRedeemGateway} "${deployment.contracts.C12USDToken}" "${deployment.deployer}"`);
    });

    console.log(`\n⚠️  NEXT STEPS:`);
    console.log(`1. Verify contracts on BSCScan and PolygonScan using the commands above`);
    console.log(`2. Update .env.production with the new contract addresses`);
    console.log(`3. Update GCP Secret Manager with new contract addresses`);
    console.log(`4. Deploy the backend services to Cloud Run`);
    console.log(`5. Update frontend configuration with new contract addresses`);

  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error);

    // Save failed deployment info
    const failedDeployment = {
      timestamp: new Date().toISOString(),
      environment: "production",
      status: "FAILED",
      error: error.message,
      partialDeployments: deployments
    };

    const failureFilename = `deployments/failed-production-${Date.now()}.json`;
    fs.mkdirSync('deployments', { recursive: true });
    fs.writeFileSync(failureFilename, JSON.stringify(failedDeployment, null, 2));

    console.log(`📁 Failure info saved to: ${failureFilename}`);
    process.exit(1);
  }
}

async function updateDeploymentLog(deployments) {
  const logPath = 'DEPLOYMENT_LOG.md';
  let content = fs.readFileSync(logPath, 'utf8');

  deployments.forEach(deployment => {
    const networkName = deployment.network.name;
    const chainId = deployment.network.chainId;

    // Update contract addresses
    content = content.replace(
      new RegExp(`- \\*\\*C12USD Token\\*\\*: TBD \\(To be deployed\\)`, 'g'),
      `- **C12USD Token**: ${deployment.contracts.C12USDToken}`
    );

    content = content.replace(
      new RegExp(`- \\*\\*MintRedeemGateway\\*\\*: TBD \\(To be deployed\\)`, 'g'),
      `- **MintRedeemGateway**: ${deployment.contracts.MintRedeemGateway}`
    );

    content = content.replace(
      new RegExp(`- \\*\\*Deployer Address\\*\\*: TBD`, 'g'),
      `- **Deployer Address**: ${deployment.deployer}`
    );

    content = content.replace(
      new RegExp(`- \\*\\*Transaction Hash\\*\\*: TBD`, 'g'),
      `- **Token Deploy Tx**: ${deployment.transactions.tokenDeployment}\n- **Gateway Deploy Tx**: ${deployment.transactions.gatewayDeployment}`
    );

    content = content.replace(
      new RegExp(`- \\*\\*Block Number\\*\\*: TBD`, 'g'),
      `- **Block Number**: ${deployment.blockNumber}`
    );
  });

  // Update deployment timestamp
  content = content.replace(
    /- \*\*Contract Deployment\*\*: TBD/g,
    `- **Contract Deployment**: ${new Date().toISOString()}`
  );

  fs.writeFileSync(logPath, content);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script execution failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployToNetwork, main };