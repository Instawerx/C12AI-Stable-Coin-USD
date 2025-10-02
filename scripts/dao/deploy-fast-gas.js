const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_POLYGON = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";
  const C12DAO = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";

  // Already deployed
  const TREASURY = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";

  console.log("🚀 Fast deployment with high gas...\n");

  const [deployer] = await ethers.getSigners();

  // Use very high gas price for fast confirmation
  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(200).div(100); // 200% of current (aggressive)

  console.log("Current gas:", ethers.utils.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("Using gas:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 8000000
  };

  const c12dao = await ethers.getContractAt("C12DAO", C12DAO);
  const treasury = await ethers.getContractAt("C12DAOTreasury", TREASURY);

  // Deploy Timelock
  console.log("⏰ Deploying Timelock...");
  const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
  const timelock = await TimelockFactory.deploy(
    172800,
    [],
    [ethers.constants.AddressZero],
    ADMIN,
    gasSettings
  );
  console.log("✅ Timelock:", timelock.address);
  console.log("   TX:", timelock.deployTransaction.hash);

  // Deploy Governor
  console.log("\n🏛️  Deploying Governor...");
  const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
  const governor = await GovernorFactory.deploy(
    C12DAO,
    timelock.address,
    gasSettings
  );
  console.log("✅ Governor:", governor.address);
  console.log("   TX:", governor.deployTransaction.hash);

  // Deploy Staking
  console.log("\n🔒 Deploying Staking...");
  const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
  const staking = await StakingFactory.deploy(
    C12DAO,
    TREASURY,
    ADMIN,
    gasSettings
  );
  console.log("✅ Staking:", staking.address);
  console.log("   TX:", staking.deployTransaction.hash);

  // Don't wait for confirmations, just submit transactions
  console.log("\n⚡ Transactions submitted! Not waiting for confirmations...");

  console.log("\n📋 ALL CONTRACTS:");
  console.log("C12DAO:    ", C12DAO);
  console.log("Timelock:  ", timelock.address);
  console.log("Governor:  ", governor.address);
  console.log("Treasury:  ", TREASURY);
  console.log("Staking:   ", staking.address);

  // Save immediately
  const fs = require('fs');
  if (!fs.existsSync('./deployments')) fs.mkdirSync('./deployments');

  const data = {
    network: "polygon",
    chainId: 137,
    timestamp: new Date().toISOString(),
    contracts: {
      C12DAO: C12DAO,
      Timelock: { address: timelock.address, tx: timelock.deployTransaction.hash },
      Governor: { address: governor.address, tx: governor.deployTransaction.hash },
      Treasury: { address: TREASURY, tx: "0x72d428287738fd8eac11ab3a208861443f10ed51278a935e1daabbdbe97a4e6f" },
      Staking: { address: staking.address, tx: staking.deployTransaction.hash }
    }
  };

  const filename = `./deployments/dao-polygon-fast-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log("\n✅ Saved:", filename);

  console.log("\n📝 .env:");
  console.log("C12DAO_TOKEN_ADDRESS=" + C12DAO);
  console.log("C12DAO_TIMELOCK_ADDRESS=" + timelock.address);
  console.log("C12DAO_GOVERNOR_ADDRESS=" + governor.address);
  console.log("C12DAO_TREASURY_ADDRESS=" + TREASURY);
  console.log("C12DAO_STAKING_ADDRESS=" + staking.address);

  console.log("\n⚠️  Next: Wait for confirmations, then configure roles");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
