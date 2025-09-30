const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Configuring C12USD contract permissions...");

  // Contract addresses from deployment
  const C12USD_ADDRESS = "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58";
  const GATEWAY_ADDRESS = "0x8303Ac615266d5b9940b74332503f25D092F5f13";

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Configuring with account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} BNB`);

  // Get contract instances
  const C12USDToken = await ethers.getContractAt("C12USDTokenEnhanced", C12USD_ADDRESS);

  // Get role hashes
  const MINTER_ROLE = await C12USDToken.MINTER_ROLE();
  const BURNER_ROLE = await C12USDToken.BURNER_ROLE();

  console.log(`\n📋 Contract addresses:`);
  console.log(`- C12USD Token: ${C12USD_ADDRESS}`);
  console.log(`- Gateway: ${GATEWAY_ADDRESS}`);

  // Configure with low gas settings for remaining balance
  const gasConfig = {
    gasLimit: 100000,  // Lower gas limit for role grants
    gasPrice: ethers.utils.parseUnits("3", "gwei") // Reduced gas price
  };

  try {
    console.log("\n🔑 Granting MINTER_ROLE to gateway...");
    const minterTx = await C12USDToken.grantRole(MINTER_ROLE, GATEWAY_ADDRESS, gasConfig);
    await minterTx.wait();
    console.log(`✅ MINTER_ROLE granted. Tx: ${minterTx.hash}`);

    console.log("🔑 Granting BURNER_ROLE to gateway...");
    const burnerTx = await C12USDToken.grantRole(BURNER_ROLE, GATEWAY_ADDRESS, gasConfig);
    await burnerTx.wait();
    console.log(`✅ BURNER_ROLE granted. Tx: ${burnerTx.hash}`);

    // Verify flash loan configuration
    console.log("\n⚡ Verifying Flash Loan configuration...");
    const flashConfig = await C12USDToken.getFlashLoanConfig();
    console.log(`   Flash loan fee: ${flashConfig.feeInBasisPoints} basis points (${flashConfig.feeInBasisPoints/100}%)`);
    console.log(`   Flash loans enabled: ${flashConfig.enabled}`);

    const maxFlashLoan = await C12USDToken.maxFlashLoan(C12USD_ADDRESS);
    const sampleFee = await C12USDToken.flashFee(C12USD_ADDRESS, ethers.utils.parseEther("1000"));
    console.log(`   Sample: 1000 token flash loan fee = ${ethers.utils.formatEther(sampleFee)} tokens`);

    // Final verification
    console.log("\n🔍 Final verification...");
    const tokenName = await C12USDToken.name();
    const tokenSymbol = await C12USDToken.symbol();
    const decimals = await C12USDToken.decimals();
    const totalSupply = await C12USDToken.totalSupply();

    console.log(`   Token name: ${tokenName}`);
    console.log(`   Token symbol: ${tokenSymbol}`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Total supply: ${ethers.utils.formatEther(totalSupply)} tokens`);

    // Check final balance
    const finalBalance = await deployer.getBalance();
    console.log(`\n💰 Final balance: ${ethers.utils.formatEther(finalBalance)} BNB`);

    console.log("\n🎉 BSC Mainnet deployment completed successfully!");
    console.log("📋 Final Summary:");
    console.log("====================");
    console.log(`Network: BSC Mainnet (56)`);
    console.log(`C12USD Token: ${C12USD_ADDRESS}`);
    console.log(`MintRedeemGateway: ${GATEWAY_ADDRESS}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`LayerZero V2 Endpoint: 0x1a44076050125825900e736c501f859c50fE728c`);

  } catch (error) {
    console.error("❌ Permission configuration failed:");
    console.error(error.message);

    console.log("\n📋 Deployment Status:");
    console.log("- ✅ C12USD Token deployed successfully");
    console.log("- ✅ MintRedeemGateway deployed successfully");
    console.log("- ❌ Permissions not configured (can be done manually)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Configuration failed:");
    console.error(error);
    process.exit(1);
  });