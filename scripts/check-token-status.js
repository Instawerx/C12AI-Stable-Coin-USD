const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking C12USD Token Status...\n");

  const networks = [
    {
      name: "BSC Mainnet",
      chainId: 56,
      token: "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58",
      gateway: "0x8303Ac615266d5b9940b74332503f25D092F5f13",
      rpc: "https://bsc-dataseed1.binance.org/"
    },
    {
      name: "Polygon Mainnet",
      chainId: 137,
      token: "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811",
      gateway: "0xF3a23bbebC06435dF16370F879cD808c408f702D",
      rpc: "https://polygon-rpc.com/"
    }
  ];

  const treasuryAddress = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const operationsAddress = "0x86111914504B82eF1c487241124C02f9D09325C4";
  const securityAddress = "0x77cbC45415d570Ff6BD672c784a86d8951501B19";

  for (const network of networks) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📍 ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`${"=".repeat(60)}\n`);

    try {
      const provider = new hre.ethers.providers.JsonRpcProvider(network.rpc);

      // Check if contract exists
      const code = await provider.getCode(network.token);
      if (code === "0x") {
        console.log("❌ Contract not found at address:", network.token);
        continue;
      }
      console.log("✅ Contract deployed at:", network.token);

      // Get contract instance with read-only connection
      const tokenAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function paused() view returns (bool)"
      ];
      const token = new hre.ethers.Contract(network.token, tokenAbi, provider);

      // Get basic token info
      try {
        const name = await token.name();
        const symbol = await token.symbol();
        const decimals = await token.decimals();
        const totalSupply = await token.totalSupply();

        console.log(`📋 Token Info:`);
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${hre.ethers.utils.formatUnits(totalSupply, decimals)} ${symbol}`);
      } catch (error) {
        console.log("⚠️  Could not fetch token info:", error.message);
      }

      // Check treasury balance
      try {
        const treasuryBalance = await token.balanceOf(treasuryAddress);
        console.log(`\n💰 Treasury Balance (${treasuryAddress}):`);
        console.log(`   ${hre.ethers.utils.formatUnits(treasuryBalance, 18)} C12USD`);
      } catch (error) {
        console.log("⚠️  Could not fetch treasury balance:", error.message);
      }

      // Check operations balance
      try {
        const operationsBalance = await token.balanceOf(operationsAddress);
        console.log(`\n🛠️  Operations Balance (${operationsAddress}):`);
        console.log(`   ${hre.ethers.utils.formatUnits(operationsBalance, 18)} C12USD`);
      } catch (error) {
        console.log("⚠️  Could not fetch operations balance:", error.message);
      }

      // Check security balance
      try {
        const securityBalance = await token.balanceOf(securityAddress);
        console.log(`\n🛡️  Security Balance (${securityAddress}):`);
        console.log(`   ${hre.ethers.utils.formatUnits(securityBalance, 18)} C12USD`);
      } catch (error) {
        console.log("⚠️  Could not fetch security balance:", error.message);
      }

      // Check if paused
      try {
        const isPaused = await token.paused();
        console.log(`\n⏸️  Contract Status: ${isPaused ? "PAUSED ⚠️" : "ACTIVE ✅"}`);
      } catch (error) {
        console.log("⚠️  Could not check pause status:", error.message);
      }

    } catch (error) {
      console.log(`❌ Error checking ${network.name}:`, error.message);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Status check complete");
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });