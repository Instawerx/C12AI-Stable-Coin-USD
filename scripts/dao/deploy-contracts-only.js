const hre = require("hardhat");
require("dotenv").config();

// Deploy contracts without minting (minting can be done separately)
async function main() {
  const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_POLYGON_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";
  const C12DAO_ADDRESS = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";

  console.log("🚀 Deploying C12DAO governance contracts...");
  console.log("C12DAO Token:", C12DAO_ADDRESS);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(110).div(100); // 110% buffer (less aggressive)

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 5000000 // Lower gas limit
  };

  console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS);

  // Deploy Timelock
  console.log("⏰ Deploying C12DAOTimelock...");
  const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
  const timelock = await TimelockFactory.deploy(
    172800, // 48 hours
    [],
    [ethers.constants.AddressZero],
    ADMIN_ADDRESS,
    gasSettings
  );
  console.log("   TX:", timelock.deployTransaction.hash);
  console.log("✅ Timelock:", timelock.address, "\n");

  // Deploy Governor
  console.log("🏛️  Deploying C12DAOGovernor...");
  const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
  const governor = await GovernorFactory.deploy(
    c12dao.address,
    timelock.address,
    gasSettings
  );
  console.log("   TX:", governor.deployTransaction.hash);
  console.log("✅ Governor:", governor.address, "\n");

  // Deploy Treasury
  console.log("💰 Deploying C12DAOTreasury...");
  const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");
  const treasury = await TreasuryFactory.deploy(
    c12dao.address,
    C12USD_POLYGON_ADDRESS,
    ADMIN_ADDRESS,
    gasSettings
  );
  console.log("   TX:", treasury.deployTransaction.hash);
  console.log("✅ Treasury:", treasury.address, "\n");

  // Deploy Staking
  console.log("🔒 Deploying C12DAOStaking...");
  const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
  const staking = await StakingFactory.deploy(
    c12dao.address,
    treasury.address,
    ADMIN_ADDRESS,
    gasSettings
  );
  console.log("   TX:", staking.deployTransaction.hash);
  console.log("✅ Staking:", staking.address, "\n");

  console.log("⏳ Waiting for confirmations...");
  await Promise.all([
    timelock.deployTransaction.wait(2),
    governor.deployTransaction.wait(2),
    treasury.deployTransaction.wait(2),
    staking.deployTransaction.wait(2)
  ]);

  console.log("\n🔧 Configuring roles...");
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const grantTx = await timelock.grantRole(PROPOSER_ROLE, governor.address, gasSettings);
  console.log("   TX:", grantTx.hash);
  await grantTx.wait(2);

  const setStakingTx = await treasury.setStakingContract(staking.address, gasSettings);
  console.log("   TX:", setStakingTx.hash);
  await setStakingTx.wait(2);

  console.log("\n🎉 DEPLOYMENT COMPLETE!\n");
  console.log("C12DAO Token:     ", c12dao.address);
  console.log("Timelock:         ", timelock.address);
  console.log("Governor:         ", governor.address);
  console.log("Treasury:         ", treasury.address);
  console.log("Staking:          ", staking.address);

  // Save deployment
  const fs = require('fs');
  if (!fs.existsSync('./deployments')) fs.mkdirSync('./deployments');

  const data = {
    network: "polygon",
    chainId: 137,
    timestamp: new Date().toISOString(),
    contracts: {
      C12DAO: c12dao.address,
      Timelock: timelock.address,
      Governor: governor.address,
      Treasury: treasury.address,
      Staking: staking.address
    }
  };

  fs.writeFileSync(`./deployments/dao-polygon-${Date.now()}.json`, JSON.stringify(data, null, 2));

  console.log("\n📝 Add to .env:");
  console.log("C12DAO_TOKEN_ADDRESS=" + c12dao.address);
  console.log("C12DAO_TIMELOCK_ADDRESS=" + timelock.address);
  console.log("C12DAO_GOVERNOR_ADDRESS=" + governor.address);
  console.log("C12DAO_TREASURY_ADDRESS=" + treasury.address);
  console.log("C12DAO_STAKING_ADDRESS=" + staking.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
