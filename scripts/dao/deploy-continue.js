const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_POLYGON_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";
  const C12DAO_ADDRESS = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";

  // Initial token distribution
  const ADMIN_INITIAL_MINT = ethers.utils.parseEther("100000000"); // 100M tokens (10%)
  const TREASURY_ALLOCATION = ethers.utils.parseEther("200000000"); // 200M tokens (20%)

  console.log("🚀 Continuing C12DAO deployment...");
  console.log("Existing C12DAO Token:", C12DAO_ADDRESS);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC\n");

  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(120).div(100);

  console.log("Using gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 8000000
  };

  let deploymentData = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      C12DAO: { address: C12DAO_ADDRESS }
    }
  };

  try {
    // Get C12DAO contract instance
    const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS);

    // Check if admin has tokens already
    const adminBalance = await c12dao.balanceOf(ADMIN_ADDRESS);
    if (adminBalance.lt(ADMIN_INITIAL_MINT)) {
      console.log("💰 Minting", ethers.utils.formatEther(ADMIN_INITIAL_MINT), "C12DAO to admin...");
      const mintTx = await c12dao.mint(ADMIN_ADDRESS, ADMIN_INITIAL_MINT, gasSettings);
      console.log("   Transaction:", mintTx.hash);
      await mintTx.wait(2);
      console.log("✅ Admin tokens minted\n");
    } else {
      console.log("✅ Admin already has tokens\n");
    }

    // 2. Deploy Timelock
    console.log("⏰ Step 2/5: Deploying C12DAOTimelock...");
    const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
    const timelock = await TimelockFactory.deploy(
      172800, // 48 hours
      [], // Proposers
      [ethers.constants.AddressZero], // Executors
      ADMIN_ADDRESS,
      gasSettings
    );

    console.log("   Transaction:", timelock.deployTransaction.hash);
    await timelock.deployTransaction.wait(2);
    console.log("✅ Timelock deployed to:", timelock.address, "\n");
    deploymentData.contracts.Timelock = { address: timelock.address, txHash: timelock.deployTransaction.hash };

    // 3. Deploy Governor
    console.log("🏛️  Step 3/5: Deploying C12DAOGovernor...");
    const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
    const governor = await GovernorFactory.deploy(
      c12dao.address,
      timelock.address,
      gasSettings
    );

    console.log("   Transaction:", governor.deployTransaction.hash);
    await governor.deployTransaction.wait(2);
    console.log("✅ Governor deployed to:", governor.address, "\n");
    deploymentData.contracts.Governor = { address: governor.address, txHash: governor.deployTransaction.hash };

    // 4. Deploy Treasury
    console.log("💰 Step 4/5: Deploying C12DAOTreasury...");
    const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");
    const treasury = await TreasuryFactory.deploy(
      c12dao.address,
      C12USD_POLYGON_ADDRESS,
      ADMIN_ADDRESS,
      gasSettings
    );

    console.log("   Transaction:", treasury.deployTransaction.hash);
    await treasury.deployTransaction.wait(2);
    console.log("✅ Treasury deployed to:", treasury.address, "\n");
    deploymentData.contracts.Treasury = { address: treasury.address, txHash: treasury.deployTransaction.hash };

    // Mint treasury allocation
    const treasuryBalance = await c12dao.balanceOf(treasury.address);
    if (treasuryBalance.lt(TREASURY_ALLOCATION)) {
      console.log("💰 Minting", ethers.utils.formatEther(TREASURY_ALLOCATION), "C12DAO to treasury...");
      const treasuryMintTx = await c12dao.mint(treasury.address, TREASURY_ALLOCATION, gasSettings);
      console.log("   Transaction:", treasuryMintTx.hash);
      await treasuryMintTx.wait(2);
      console.log("✅ Treasury tokens minted\n");
    } else {
      console.log("✅ Treasury already has tokens\n");
    }

    // 5. Deploy Staking
    console.log("🔒 Step 5/5: Deploying C12DAOStaking...");
    const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
    const staking = await StakingFactory.deploy(
      c12dao.address,
      treasury.address,
      ADMIN_ADDRESS,
      gasSettings
    );

    console.log("   Transaction:", staking.deployTransaction.hash);
    await staking.deployTransaction.wait(2);
    console.log("✅ Staking deployed to:", staking.address, "\n");
    deploymentData.contracts.Staking = { address: staking.address, txHash: staking.deployTransaction.hash };

    // 6. Configure roles
    console.log("🔧 Configuring roles...");

    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    console.log("   ⏳ Granting PROPOSER_ROLE to Governor...");
    const grantProposerTx = await timelock.grantRole(PROPOSER_ROLE, governor.address, gasSettings);
    console.log("   Transaction:", grantProposerTx.hash);
    await grantProposerTx.wait(2);
    console.log("✅ Governor granted PROPOSER_ROLE\n");

    console.log("   ⏳ Setting staking contract in Treasury...");
    const setStakingTx = await treasury.setStakingContract(staking.address, gasSettings);
    console.log("   Transaction:", setStakingTx.hash);
    await setStakingTx.wait(2);
    console.log("✅ Staking contract set in Treasury\n");

    // Final summary
    const finalBalance = await deployer.getBalance();
    const gasSpent = balance.sub(finalBalance);

    console.log("=====================================");
    console.log("🎉 Deployment Complete!");
    console.log("=====================================\n");

    console.log("📋 Contract Addresses:");
    console.log("C12DAO Token:     ", c12dao.address);
    console.log("Timelock:         ", timelock.address);
    console.log("Governor:         ", governor.address);
    console.log("Treasury:         ", treasury.address);
    console.log("Staking:          ", staking.address);
    console.log();

    console.log("⛽ Gas Used:", ethers.utils.formatEther(gasSpent), "MATIC\n");

    // Save deployment info
    const fs = require('fs');
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    const filename = `./deployments/dao-polygon-mainnet-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
    console.log("✅ Deployment saved to", filename, "\n");

    console.log("📝 Add to .env:");
    console.log("C12DAO_TOKEN_ADDRESS=" + c12dao.address);
    console.log("C12DAO_TIMELOCK_ADDRESS=" + timelock.address);
    console.log("C12DAO_GOVERNOR_ADDRESS=" + governor.address);
    console.log("C12DAO_TREASURY_ADDRESS=" + treasury.address);
    console.log("C12DAO_STAKING_ADDRESS=" + staking.address);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);

    if (Object.keys(deploymentData.contracts).length > 0) {
      const fs = require('fs');
      if (!fs.existsSync('./deployments')) {
        fs.mkdirSync('./deployments');
      }
      const filename = `./deployments/dao-polygon-FAILED-${Date.now()}.json`;
      deploymentData.error = error.message;
      fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
      console.log("\n⚠️  Partial deployment saved to", filename);
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
