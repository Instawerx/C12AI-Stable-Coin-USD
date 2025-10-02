const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_POLYGON = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";
  const C12DAO = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";
  const TREASURY = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";

  console.log("🔄 Redeploying missing DAO contracts\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC\n");

  // Ultra-high gas for guaranteed confirmation
  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(250).div(100); // 250%!

  console.log("Current gas:", ethers.utils.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("Using gas:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 8000000
  };

  let deploymentData = {
    network: "polygon",
    chainId: 137,
    timestamp: new Date().toISOString(),
    contracts: {
      C12DAO: C12DAO,
      Treasury: TREASURY
    }
  };

  try {
    // 1. Deploy Timelock
    console.log("⏰ Deploying C12DAOTimelock...");
    const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
    const timelock = await TimelockFactory.deploy(
      172800, // 48 hours
      [],
      [ethers.constants.AddressZero],
      ADMIN,
      gasSettings
    );
    console.log("✅ Timelock:", timelock.address);
    console.log("   TX:", timelock.deployTransaction.hash);
    deploymentData.contracts.Timelock = { address: timelock.address, tx: timelock.deployTransaction.hash };

    // Wait for Timelock confirmation before deploying Governor
    console.log("   ⏳ Waiting for 3 confirmations...");
    await timelock.deployTransaction.wait(3);
    console.log("   ✅ Confirmed\n");

    // 2. Deploy Governor
    console.log("🏛️  Deploying C12DAOGovernor...");
    const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
    const governor = await GovernorFactory.deploy(
      C12DAO,
      timelock.address,
      gasSettings
    );
    console.log("✅ Governor:", governor.address);
    console.log("   TX:", governor.deployTransaction.hash);
    deploymentData.contracts.Governor = { address: governor.address, tx: governor.deployTransaction.hash };

    console.log("   ⏳ Waiting for 3 confirmations...");
    await governor.deployTransaction.wait(3);
    console.log("   ✅ Confirmed\n");

    // 3. Deploy Staking
    console.log("🔒 Deploying C12DAOStaking...");
    const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
    const staking = await StakingFactory.deploy(
      C12DAO,
      TREASURY,
      ADMIN,
      gasSettings
    );
    console.log("✅ Staking:", staking.address);
    console.log("   TX:", staking.deployTransaction.hash);
    deploymentData.contracts.Staking = { address: staking.address, tx: staking.deployTransaction.hash };

    console.log("   ⏳ Waiting for 3 confirmations...");
    await staking.deployTransaction.wait(3);
    console.log("   ✅ Confirmed\n");

    // Summary
    console.log("=====================================");
    console.log("✅ All Contracts Deployed!");
    console.log("=====================================\n");

    console.log("C12DAO:    ", C12DAO);
    console.log("Timelock:  ", timelock.address);
    console.log("Governor:  ", governor.address);
    console.log("Treasury:  ", TREASURY);
    console.log("Staking:   ", staking.address);

    // Save
    const fs = require('fs');
    if (!fs.existsSync('./deployments')) fs.mkdirSync('./deployments');

    const filename = `./deployments/dao-polygon-complete-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log("\n✅ Saved:", filename);

    console.log("\n📝 Update .env with:");
    console.log("C12DAO_TOKEN_ADDRESS=" + C12DAO);
    console.log("C12DAO_TIMELOCK_ADDRESS=" + timelock.address);
    console.log("C12DAO_GOVERNOR_ADDRESS=" + governor.address);
    console.log("C12DAO_TREASURY_ADDRESS=" + TREASURY);
    console.log("C12DAO_STAKING_ADDRESS=" + staking.address);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);

    const fs = require('fs');
    if (!fs.existsSync('./deployments')) fs.mkdirSync('./deployments');
    const filename = `./deployments/dao-polygon-FAILED-${Date.now()}.json`;
    deploymentData.error = error.message;
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log("⚠️  Partial data saved to", filename);

    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
