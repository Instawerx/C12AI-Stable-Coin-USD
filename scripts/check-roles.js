const hre = require("hardhat");

async function main() {
  console.log("🔐 Checking Contract Roles...\n");

  const networks = [
    {
      name: "BSC Mainnet",
      token: "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58",
      rpc: "https://bsc-dataseed1.binance.org/"
    },
    {
      name: "Polygon Mainnet",
      token: "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811",
      rpc: "https://polygon-rpc.com/"
    }
  ];

  const deployerAddress = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";

  for (const network of networks) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📍 ${network.name}`);
    console.log(`${"=".repeat(60)}\n`);

    try {
      const provider = new hre.ethers.providers.JsonRpcProvider(network.rpc);

      const tokenAbi = [
        "function hasRole(bytes32 role, address account) view returns (bool)",
        "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
        "function MINTER_ROLE() view returns (bytes32)",
        "function BURNER_ROLE() view returns (bytes32)",
        "function PAUSER_ROLE() view returns (bytes32)"
      ];

      const token = new hre.ethers.Contract(network.token, tokenAbi, provider);

      // Get role hashes
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      const minterRole = await token.MINTER_ROLE();
      const burnerRole = await token.BURNER_ROLE();
      const pauserRole = await token.PAUSER_ROLE();

      console.log(`🔑 Role Status for Deployer (${deployerAddress}):\n`);

      const hasAdmin = await token.hasRole(adminRole, deployerAddress);
      console.log(`   DEFAULT_ADMIN_ROLE: ${hasAdmin ? "✅ YES" : "❌ NO"}`);

      const hasMinter = await token.hasRole(minterRole, deployerAddress);
      console.log(`   MINTER_ROLE: ${hasMinter ? "✅ YES" : "❌ NO"}`);

      const hasBurner = await token.hasRole(burnerRole, deployerAddress);
      console.log(`   BURNER_ROLE: ${hasBurner ? "✅ YES" : "❌ NO"}`);

      const hasPauser = await token.hasRole(pauserRole, deployerAddress);
      console.log(`   PAUSER_ROLE: ${hasPauser ? "✅ YES" : "❌ NO"}`);

    } catch (error) {
      console.log(`❌ Error checking ${network.name}:`, error.message);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Role check complete");
  console.log(`${"=".repeat(60)}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });