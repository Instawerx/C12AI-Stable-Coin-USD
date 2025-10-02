const hre = require("hardhat");

async function main() {
  console.log("Testing Polygon RPC connection...\n");

  const provider = hre.ethers.provider;

  try {
    console.log("🔍 Checking network connection...");
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name);
    console.log("✅ Chain ID:", network.chainId);

    console.log("\n🔍 Fetching blockchain data...");
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Current block:", blockNumber);

    const gasPrice = await provider.getGasPrice();
    console.log("✅ Current gas price:", hre.ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

    console.log("\n🔍 Checking wallet...");
    const [deployer] = await hre.ethers.getSigners();
    console.log("✅ Deployer address:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("✅ Wallet balance:", hre.ethers.utils.formatEther(balance), "MATIC");

    if (balance.lt(hre.ethers.utils.parseEther("0.05"))) {
      console.log("⚠️  Warning: Low balance. Recommend at least 0.1 MATIC for deployment");
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Connection test PASSED!");
    console.log("=".repeat(50));
    console.log("\nYou can now proceed with deployment:");
    console.log("npx hardhat run scripts/dao/deploy-mainnet-robust.js --network polygon");

  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.error("❌ Connection test FAILED");
    console.log("=".repeat(50));
    console.error("\nError:", error.message);

    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your POLYGON_RPC in .env file");
    console.log("2. Verify the RPC URL is correct and accessible");
    console.log("3. Consider using a paid RPC provider (Alchemy, Infura, QuickNode)");
    console.log("4. Check if you're behind a firewall or proxy");

    console.log("\n📋 Recommended RPC providers:");
    console.log("- Alchemy: https://www.alchemy.com/");
    console.log("- Infura: https://infura.io/");
    console.log("- QuickNode: https://www.quicknode.com/");

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
