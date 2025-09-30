const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting C12USD contract deployment...");

  // Get deployment parameters from environment
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  // Network-specific LayerZero V2 endpoints
  const layerZeroEndpoints = {
    // Mainnets (LayerZero V2)
    56: "0x1a44076050125825900e736c501f859c50fE728c",    // BSC Mainnet V2
    137: "0x1a44076050125825900e736c501f859c50fE728c",   // Polygon Mainnet V2

    // Testnets (LayerZero V2)
    97: "0x6EDCE65403992e310A62460808c4b910D972f10f",    // BSC Testnet V2
    80001: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Polygon Mumbai V2 (deprecated)
    80002: "0x6EDCE65403992e310A62460808c4b910D972f10f", // Polygon Amoy V2

    // Local development
    31337: deployer.address // Use deployer as mock endpoint for local testing
  };

  const lzEndpoint = layerZeroEndpoints[network.chainId];
  if (!lzEndpoint) {
    throw new Error(`LayerZero endpoint not configured for chain ID ${network.chainId}`);
  }

  console.log(`🔗 LayerZero V2 endpoint: ${lzEndpoint}`);

  // Gas configuration for BSC
  const gasConfig = network.chainId === 56 ? {
    gasLimit: 8000000,  // 8M gas limit for BSC mainnet
    gasPrice: ethers.utils.parseUnits("5", "gwei") // 5 gwei
  } : {};

  // Deploy C12USD Token (Enhanced with Flash Loans)
  console.log("\n📄 Deploying C12USD Enhanced Token contract...");
  const C12USDToken = await ethers.getContractFactory("C12USDTokenEnhanced");

  console.log("   Constructor parameters:");
  console.log(`   - LayerZero Endpoint: ${lzEndpoint}`);
  console.log(`   - Delegate: ${deployer.address}`);
  console.log(`   - Owner: ${deployer.address}`);

  const c12usdToken = await C12USDToken.deploy(
    lzEndpoint,        // LayerZero V2 endpoint
    deployer.address,  // Delegate (deployer)
    deployer.address,  // Owner (deployer)
    gasConfig          // Gas configuration
  );

  await c12usdToken.deployed();
  console.log(`✅ C12USD Token deployed to: ${c12usdToken.address}`);

  // Deploy MintRedeemGateway
  console.log("\n🏗️  Deploying MintRedeemGateway contract...");
  const MintRedeemGateway = await ethers.getContractFactory("MintRedeemGateway");

  const gateway = await MintRedeemGateway.deploy(
    c12usdToken.address,  // C12USD token address
    deployer.address      // Owner (deployer)
  );

  await gateway.deployed();
  console.log(`✅ MintRedeemGateway deployed to: ${gateway.address}`);

  // Grant gateway permission to mint and burn tokens
  console.log("\n🔑 Configuring contract permissions...");

  const MINTER_ROLE = await c12usdToken.MINTER_ROLE();
  const BURNER_ROLE = await c12usdToken.BURNER_ROLE();

  // Grant roles to the gateway
  console.log("   Granting MINTER_ROLE to gateway...");
  await c12usdToken.grantRole(MINTER_ROLE, gateway.address);

  console.log("   Granting BURNER_ROLE to gateway...");
  await c12usdToken.grantRole(BURNER_ROLE, gateway.address);

  // Configure flash loan settings
  console.log("\n⚡ Configuring Flash Loan settings...");
  const flashConfig = await c12usdToken.getFlashLoanConfig();
  console.log(`   Flash loan fee: ${flashConfig.feeInBasisPoints} basis points (${flashConfig.feeInBasisPoints/100}%)`);
  console.log(`   Flash loans enabled: ${flashConfig.enabled}`);
  console.log(`   Max flash loan amount: ${flashConfig.maxAmount.toString() === ethers.constants.MaxUint256.toString() ? 'Unlimited' : ethers.utils.formatEther(flashConfig.maxAmount)}`);

  // Verify flash loan functionality
  const maxFlashLoan = await c12usdToken.maxFlashLoan(c12usdToken.address);
  const sampleFee = await c12usdToken.flashFee(c12usdToken.address, ethers.utils.parseEther("1000"));
  console.log(`   Sample: 1000 token flash loan fee = ${ethers.utils.formatEther(sampleFee)} tokens`);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const tokenName = await c12usdToken.name();
  const tokenSymbol = await c12usdToken.symbol();
  const treasuryMintAmount = await c12usdToken.TREASURY_INITIAL_MINT();
  const maxTxLimit = await c12usdToken.MAX_TRANSACTION_LIMIT();

  console.log(`   Token name: ${tokenName}`);
  console.log(`   Token symbol: ${tokenSymbol}`);
  console.log(`   Treasury initial mint: ${ethers.utils.formatEther(treasuryMintAmount)} tokens`);
  console.log(`   Max transaction limit: ${ethers.utils.formatEther(maxTxLimit)} tokens`);

  // Output deployment information
  console.log("\n📋 Deployment Summary:");
  console.log("=" .repeat(50));
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`C12USD Token: ${c12usdToken.address}`);
  console.log(`MintRedeemGateway: ${gateway.address}`);
  console.log(`LayerZero Endpoint: ${lzEndpoint}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("=" .repeat(50));

  // Save deployment addresses to file
  const fs = require('fs');
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: network.chainId
    },
    contracts: {
      C12USDToken: c12usdToken.address,
      MintRedeemGateway: gateway.address,
      LayerZeroEndpoint: lzEndpoint
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  const filename = `deployments/${network.name}-${network.chainId}.json`;
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${filename}`);

  if (network.chainId !== 31337) {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await c12usdToken.deployTransaction.wait(5);
    await gateway.deployTransaction.wait(5);

    console.log("\n🔍 Contract verification commands:");
    console.log(`npx hardhat verify --network ${network.name} ${c12usdToken.address} "${lzEndpoint}" "${deployer.address}" "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${gateway.address} "${c12usdToken.address}" "${deployer.address}"`);
  }

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });