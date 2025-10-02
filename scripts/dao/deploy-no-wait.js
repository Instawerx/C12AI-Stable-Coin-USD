const hre = require("hardhat");
require("dotenv").config();

// Deploy without waiting for confirmations
async function main() {
  const ADMIN = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12DAO = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";
  const TREASURY = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";
  const TIMELOCK = "0xC6C82F86Dc4b2ab0239311D01ABa5907bB907B66";

  console.log("⚡ Fast deploy (no confirmation waits)\n");

  const [deployer] = await ethers.getSigners();

  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(200).div(100);

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 8000000
  };

  console.log("Gas:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  // Deploy Governor
  console.log("🏛️  Deploying Governor...");
  const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
  const governor = await GovernorFactory.deploy(
    C12DAO,
    TIMELOCK,
    gasSettings
  );
  console.log("✅", governor.address);
  console.log("  ", governor.deployTransaction.hash, "\n");

  // Deploy Staking
  console.log("🔒 Deploying Staking...");
  const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
  const staking = await StakingFactory.deploy(
    C12DAO,
    TREASURY,
    ADMIN,
    gasSettings
  );
  console.log("✅", staking.address);
  console.log("  ", staking.deployTransaction.hash, "\n");

  console.log("📋 ALL ADDRESSES:");
  console.log("C12DAO:   ", C12DAO);
  console.log("Timelock: ", TIMELOCK);
  console.log("Governor: ", governor.address);
  console.log("Treasury: ", TREASURY);
  console.log("Staking:  ", staking.address);

  const data = {
    C12DAO_TOKEN_ADDRESS: C12DAO,
    C12DAO_TIMELOCK_ADDRESS: TIMELOCK,
    C12DAO_GOVERNOR_ADDRESS: governor.address,
    C12DAO_TREASURY_ADDRESS: TREASURY,
    C12DAO_STAKING_ADDRESS: staking.address
  };

  const fs = require('fs');
  if (!fs.existsSync('./deployments')) fs.mkdirSync('./deployments');
  fs.writeFileSync(`./deployments/dao-final-${Date.now()}.json`, JSON.stringify(data, null, 2));

  console.log("\n📝 .env:");
  Object.entries(data).forEach(([key, val]) => console.log(`${key}=${val}`));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
