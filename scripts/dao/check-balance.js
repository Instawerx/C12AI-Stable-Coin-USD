const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC");

  if (parseFloat(ethers.utils.formatEther(balance)) < 5) {
    console.log("⚠️  WARNING: Balance is low. Recommended to have at least 5-10 MATIC for deployment.");
  } else {
    console.log("✅ Balance is sufficient for deployment");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
