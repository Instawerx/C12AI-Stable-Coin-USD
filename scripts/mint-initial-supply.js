const hre = require("hardhat");

async function main() {
  console.log("🏦 C12USD Initial Treasury Minting\n");
  console.log("=" .repeat(70));

  // Configuration
  const TREASURY_ADDRESS = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const BSC_TOKEN_ADDRESS = "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58";
  const POLYGON_TOKEN_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";

  console.log("\n📋 Minting Configuration:");
  console.log(`   Treasury Wallet: ${TREASURY_ADDRESS}`);
  console.log(`   BSC Token: ${BSC_TOKEN_ADDRESS}`);
  console.log(`   Polygon Token: ${POLYGON_TOKEN_ADDRESS}`);
  console.log(`   Amount per chain: 100,000,000 C12USD`);
  console.log("=" .repeat(70));

  // Get the signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`\n🔑 Signer: ${signer.address}`);

  // Check signer matches treasury
  if (signer.address.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
    console.log(`⚠️  WARNING: Signer (${signer.address}) differs from treasury (${TREASURY_ADDRESS})`);
    console.log(`   Make sure this is expected!`);
  }

  // Determine which network we're on
  const network = await hre.ethers.provider.getNetwork();
  console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

  let tokenAddress;
  let networkName;

  if (network.chainId === 56) {
    tokenAddress = BSC_TOKEN_ADDRESS;
    networkName = "BSC Mainnet";
  } else if (network.chainId === 137) {
    tokenAddress = POLYGON_TOKEN_ADDRESS;
    networkName = "Polygon Mainnet";
  } else {
    throw new Error(`Unsupported network. Chain ID: ${network.chainId}. Please use --network bsc or --network polygon`);
  }

  console.log(`\n📍 Minting on: ${networkName}`);
  console.log(`   Token Address: ${tokenAddress}`);

  // Get contract instance
  console.log(`\n📄 Loading contract...`);
  const token = await hre.ethers.getContractAt("C12USDTokenEnhanced", tokenAddress, signer);

  // Check current supply
  console.log(`\n🔍 Pre-Mint Status:`);
  const totalSupplyBefore = await token.totalSupply();
  console.log(`   Current Total Supply: ${hre.ethers.utils.formatUnits(totalSupplyBefore, 18)} C12USD`);

  if (totalSupplyBefore.gt(0)) {
    console.log(`\n❌ ERROR: Total supply is not zero!`);
    console.log(`   treasuryMint() can only be called when supply = 0`);
    console.log(`   Current supply: ${hre.ethers.utils.formatUnits(totalSupplyBefore, 18)} C12USD`);
    process.exit(1);
  }

  const treasuryBalanceBefore = await token.balanceOf(TREASURY_ADDRESS);
  console.log(`   Treasury Balance: ${hre.ethers.utils.formatUnits(treasuryBalanceBefore, 18)} C12USD`);

  // Check signer has admin role
  const adminRole = await token.DEFAULT_ADMIN_ROLE();
  const hasAdminRole = await token.hasRole(adminRole, signer.address);
  console.log(`   Has DEFAULT_ADMIN_ROLE: ${hasAdminRole ? "✅ YES" : "❌ NO"}`);

  if (!hasAdminRole) {
    console.log(`\n❌ ERROR: Signer does not have DEFAULT_ADMIN_ROLE`);
    console.log(`   treasuryMint() requires DEFAULT_ADMIN_ROLE`);
    process.exit(1);
  }

  // Check if contract is paused
  const isPaused = await token.paused();
  if (isPaused) {
    console.log(`\n❌ ERROR: Contract is paused!`);
    console.log(`   Unpause the contract before minting`);
    process.exit(1);
  }

  console.log(`\n✅ Pre-flight checks passed!`);
  console.log(`\n${"=".repeat(70)}`);
  console.log(`🚀 EXECUTING TREASURY MINT`);
  console.log(`${"=".repeat(70)}\n`);

  // Execute the mint
  console.log(`📤 Calling treasuryMint(${TREASURY_ADDRESS})...`);
  console.log(`   This will mint 100,000,000 C12USD to the treasury wallet\n`);

  try {
    const tx = await token.treasuryMint(TREASURY_ADDRESS);
    console.log(`⏳ Transaction submitted: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    const receipt = await tx.wait();

    console.log(`\n✅ MINT SUCCESSFUL!`);
    console.log(`${"=".repeat(70)}`);
    console.log(`📊 Transaction Details:`);
    console.log(`   Transaction Hash: ${receipt.transactionHash}`);
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Status: ${receipt.status === 1 ? "Success ✅" : "Failed ❌"}`);

    // Get updated balances
    console.log(`\n🔍 Post-Mint Status:`);
    const totalSupplyAfter = await token.totalSupply();
    const treasuryBalanceAfter = await token.balanceOf(TREASURY_ADDRESS);

    console.log(`   Total Supply: ${hre.ethers.utils.formatUnits(totalSupplyAfter, 18)} C12USD`);
    console.log(`   Treasury Balance: ${hre.ethers.utils.formatUnits(treasuryBalanceAfter, 18)} C12USD`);

    console.log(`\n💰 Tokens Minted: ${hre.ethers.utils.formatUnits(totalSupplyAfter, 18)} C12USD`);
    console.log(`${"=".repeat(70)}`);

    // Explorer link
    let explorerUrl;
    if (network.chainId === 56) {
      explorerUrl = `https://bscscan.com/tx/${receipt.transactionHash}`;
    } else if (network.chainId === 137) {
      explorerUrl = `https://polygonscan.com/tx/${receipt.transactionHash}`;
    }

    console.log(`\n🔗 View on Explorer:`);
    console.log(`   ${explorerUrl}`);
    console.log(`\n✅ Minting complete on ${networkName}!`);
    console.log(`${"=".repeat(70)}\n`);

    // Save transaction record
    const record = {
      network: networkName,
      chainId: network.chainId,
      tokenAddress: tokenAddress,
      treasuryAddress: TREASURY_ADDRESS,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      amountMinted: hre.ethers.utils.formatUnits(totalSupplyAfter, 18),
      timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    const recordPath = `./deployments/mint-${network.chainId}-${Date.now()}.json`;
    fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
    console.log(`📝 Mint record saved to: ${recordPath}\n`);

  } catch (error) {
    console.log(`\n❌ MINT FAILED!`);
    console.log(`${"=".repeat(70)}`);
    console.log(`Error: ${error.message}`);

    if (error.reason) {
      console.log(`Reason: ${error.reason}`);
    }

    if (error.data) {
      console.log(`Data: ${error.data}`);
    }

    console.log(`${"=".repeat(70)}\n`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });