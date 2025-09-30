const { ethers } = require("hardhat");
const { execSync } = require("child_process");
require("dotenv").config();

async function main() {
  console.log("💰 C12USD Deployment Account Funding Script");
  console.log("===========================================");

  // Configuration
  const DEPLOYMENT_ACCOUNT = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf";
  const MAIN_WALLET = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";

  // Required amounts with safety margin
  const BNB_AMOUNT = "0.12"; // 0.1 + 0.02 buffer
  const MATIC_AMOUNT = "55.0"; // 50 + 5 buffer

  console.log(`🎯 Target Account: ${DEPLOYMENT_ACCOUNT}`);
  console.log(`💳 Source Account: ${MAIN_WALLET}`);
  console.log(`📊 Transfer Amounts:`);
  console.log(`   BSC: ${BNB_AMOUNT} BNB`);
  console.log(`   Polygon: ${MATIC_AMOUNT} MATIC`);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`\n🌐 Connected to: ${network.name} (Chain ID: ${network.chainId})`);

  // Get main wallet private key from Secret Manager
  console.log("🔐 Retrieving main wallet private key from Secret Manager...");
  const mainWalletKey = execSync("gcloud secrets versions access latest --secret=main-wallet-private-key --project=c12ai-dao", { encoding: 'utf8' }).trim();

  // Create wallet from private key
  const mainWallet = new ethers.Wallet(mainWalletKey, ethers.provider);
  console.log(`🔑 Main Wallet Address: ${mainWallet.address}`);

  if (mainWallet.address.toLowerCase() !== MAIN_WALLET.toLowerCase()) {
    console.error(`❌ ERROR: Expected wallet ${MAIN_WALLET}, got ${mainWallet.address}`);
    console.error("Private key does not match expected main wallet address.");
    process.exit(1);
  }

  const signer = mainWallet;

  // Check current balance
  const balance = await signer.getBalance();
  console.log(`💰 Current Balance: ${ethers.utils.formatEther(balance)} ${network.chainId === 56 ? 'BNB' : 'MATIC'}`);

  // Determine transfer amount based on network
  let transferAmount;
  if (network.chainId === 56) { // BSC
    transferAmount = ethers.utils.parseEther(BNB_AMOUNT);
    console.log(`\n🔄 Preparing BSC transfer of ${BNB_AMOUNT} BNB...`);
  } else if (network.chainId === 137) { // Polygon
    transferAmount = ethers.utils.parseEther(MATIC_AMOUNT);
    console.log(`\n🔄 Preparing Polygon transfer of ${MATIC_AMOUNT} MATIC...`);
  } else {
    console.error(`❌ Unsupported network: ${network.chainId}`);
    process.exit(1);
  }

  // Check if we have sufficient balance
  if (balance.lt(transferAmount)) {
    console.error(`❌ Insufficient balance. Required: ${ethers.utils.formatEther(transferAmount)}, Available: ${ethers.utils.formatEther(balance)}`);
    process.exit(1);
  }

  // Estimate gas
  console.log("⛽ Estimating gas...");
  const gasEstimate = await signer.estimateGas({
    to: DEPLOYMENT_ACCOUNT,
    value: transferAmount
  });

  const gasPrice = await signer.getGasPrice();
  const gasCost = gasEstimate.mul(gasPrice);

  console.log(`   Gas Estimate: ${gasEstimate.toString()} units`);
  console.log(`   Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`);
  console.log(`   Total Gas Cost: ${ethers.utils.formatEther(gasCost)} ${network.chainId === 56 ? 'BNB' : 'MATIC'}`);

  // Final balance check including gas
  const totalCost = transferAmount.add(gasCost);
  if (balance.lt(totalCost)) {
    console.error(`❌ Insufficient balance including gas. Total needed: ${ethers.utils.formatEther(totalCost)}, Available: ${ethers.utils.formatEther(balance)}`);
    process.exit(1);
  }

  // Check deployment account current balance
  const deploymentBalance = await ethers.provider.getBalance(DEPLOYMENT_ACCOUNT);
  console.log(`\n📋 Pre-transfer balances:`);
  console.log(`   Source: ${ethers.utils.formatEther(balance)} ${network.chainId === 56 ? 'BNB' : 'MATIC'}`);
  console.log(`   Deployment Account: ${ethers.utils.formatEther(deploymentBalance)} ${network.chainId === 56 ? 'BNB' : 'MATIC'}`);

  // Execute transfer
  console.log(`\n🚀 Executing transfer...`);
  const tx = await signer.sendTransaction({
    to: DEPLOYMENT_ACCOUNT,
    value: transferAmount,
    gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
  });

  console.log(`📝 Transaction Hash: ${tx.hash}`);
  console.log(`⏳ Waiting for confirmation...`);

  const receipt = await tx.wait();
  console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

  // Verify final balances
  const finalSourceBalance = await signer.getBalance();
  const finalDeploymentBalance = await ethers.provider.getBalance(DEPLOYMENT_ACCOUNT);

  console.log(`\n📊 Post-transfer balances:`);
  console.log(`   Source: ${ethers.utils.formatEther(finalSourceBalance)} ${network.chainId === 56 ? 'BNB' : 'MATIC'}`);
  console.log(`   Deployment Account: ${ethers.utils.formatEther(finalDeploymentBalance)} ${network.chainId === 56 ? 'BNB' : 'MATIC'}`);

  // Verify sufficient for deployment
  const minRequired = network.chainId === 56 ? ethers.utils.parseEther("0.1") : ethers.utils.parseEther("50");
  if (finalDeploymentBalance.gte(minRequired)) {
    console.log(`✅ Deployment account now has sufficient funds for contract deployment!`);
  } else {
    console.log(`⚠️  Warning: Deployment account may still need more funds.`);
  }

  console.log(`\n🎉 Transfer completed successfully!`);

  // Save transaction record
  const transferRecord = {
    network: network.name,
    chainId: network.chainId,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
    from: signer.address,
    to: DEPLOYMENT_ACCOUNT,
    amount: ethers.utils.formatEther(transferAmount),
    currency: network.chainId === 56 ? 'BNB' : 'MATIC',
    gasUsed: receipt.gasUsed.toString(),
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.mkdirSync('transfers', { recursive: true });
  const filename = `transfers/funding-${network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(transferRecord, null, 2));
  console.log(`📁 Transfer record saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Transfer failed:");
    console.error(error);
    process.exit(1);
  });