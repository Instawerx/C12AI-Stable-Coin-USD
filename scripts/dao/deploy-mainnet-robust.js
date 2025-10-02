const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_POLYGON_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";

  // Initial token distribution
  const ADMIN_INITIAL_MINT = ethers.utils.parseEther("100000000"); // 100M tokens (10%)
  const TREASURY_ALLOCATION = ethers.utils.parseEther("200000000"); // 200M tokens (20%)

  console.log("🚀 Deploying C12DAO system to Polygon mainnet...");
  console.log("Admin:", ADMIN_ADDRESS);
  console.log("Network:", hre.network.name);
  console.log("=====================================\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC\n");

  // Get current gas price and add 20% buffer for faster confirmation
  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(120).div(100); // 120% of current gas price

  console.log("Current network gas price:", ethers.utils.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("Using gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei (120% buffer)");

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 8000000 // High gas limit
  };

  let deploymentData = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // 1. Deploy C12DAO Token
    console.log("📝 Step 1/5: Deploying C12DAO token...");
    console.log("   Gas settings:", ethers.utils.formatUnits(gasSettings.gasPrice, "gwei"), "gwei");

    const C12DAOFactory = await ethers.getContractFactory("C12DAO");
    const c12dao = await C12DAOFactory.deploy(ADMIN_ADDRESS, gasSettings);

    console.log("   ⏳ Waiting for C12DAO deployment confirmation...");
    await c12dao.deployTransaction.wait(1); // Wait for 1 confirmation

    console.log("✅ C12DAO deployed to:", c12dao.address);
    console.log("   Transaction:", c12dao.deployTransaction.hash);
    deploymentData.contracts.C12DAO = {
      address: c12dao.address,
      txHash: c12dao.deployTransaction.hash
    };

    // Mint initial tokens to admin
    console.log("\n   💰 Minting", ethers.utils.formatEther(ADMIN_INITIAL_MINT), "C12DAO to admin...");
    const mintTx = await c12dao.mint(ADMIN_ADDRESS, ADMIN_INITIAL_MINT, gasSettings);
    console.log("   ⏳ Waiting for mint confirmation...");
    await mintTx.wait(1);
    console.log("   ✅ Admin tokens minted");
    console.log("   Transaction:", mintTx.hash);

    // 2. Deploy Timelock
    console.log("\n⏰ Step 2/5: Deploying C12DAOTimelock...");
    const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
    const timelock = await TimelockFactory.deploy(
      172800, // 48 hours
      [], // Proposers (will be governor)
      [ethers.constants.AddressZero], // Executors (anyone)
      ADMIN_ADDRESS,
      gasSettings
    );

    console.log("   ⏳ Waiting for Timelock deployment confirmation...");
    await timelock.deployTransaction.wait(1);

    console.log("✅ Timelock deployed to:", timelock.address);
    console.log("   Transaction:", timelock.deployTransaction.hash);
    console.log("   Delay: 48 hours");
    deploymentData.contracts.Timelock = {
      address: timelock.address,
      txHash: timelock.deployTransaction.hash
    };

    // 3. Deploy Governor
    console.log("\n🏛️  Step 3/5: Deploying C12DAOGovernor...");
    const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
    const governor = await GovernorFactory.deploy(
      c12dao.address,
      timelock.address,
      gasSettings
    );

    console.log("   ⏳ Waiting for Governor deployment confirmation...");
    await governor.deployTransaction.wait(1);

    console.log("✅ Governor deployed to:", governor.address);
    console.log("   Transaction:", governor.deployTransaction.hash);
    console.log("   Voting delay: 1 day");
    console.log("   Voting period: 7 days");
    console.log("   Proposal threshold: 100,000 C12DAO");
    console.log("   Quorum: 4%");
    deploymentData.contracts.Governor = {
      address: governor.address,
      txHash: governor.deployTransaction.hash
    };

    // 4. Deploy Treasury
    console.log("\n💰 Step 4/5: Deploying C12DAOTreasury...");
    const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");
    const treasury = await TreasuryFactory.deploy(
      c12dao.address,
      C12USD_POLYGON_ADDRESS,
      ADMIN_ADDRESS,
      gasSettings
    );

    console.log("   ⏳ Waiting for Treasury deployment confirmation...");
    await treasury.deployTransaction.wait(1);

    console.log("✅ Treasury deployed to:", treasury.address);
    console.log("   Transaction:", treasury.deployTransaction.hash);
    deploymentData.contracts.Treasury = {
      address: treasury.address,
      txHash: treasury.deployTransaction.hash
    };

    // Mint treasury allocation
    console.log("\n   💰 Minting", ethers.utils.formatEther(TREASURY_ALLOCATION), "C12DAO to treasury...");
    const treasuryMintTx = await c12dao.mint(treasury.address, TREASURY_ALLOCATION, gasSettings);
    console.log("   ⏳ Waiting for treasury mint confirmation...");
    await treasuryMintTx.wait(1);
    console.log("   ✅ Treasury tokens minted");
    console.log("   Transaction:", treasuryMintTx.hash);

    // 5. Deploy Staking
    console.log("\n🔒 Step 5/5: Deploying C12DAOStaking...");
    const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
    const staking = await StakingFactory.deploy(
      c12dao.address,
      treasury.address,
      ADMIN_ADDRESS,
      gasSettings
    );

    console.log("   ⏳ Waiting for Staking deployment confirmation...");
    await staking.deployTransaction.wait(1);

    console.log("✅ Staking deployed to:", staking.address);
    console.log("   Transaction:", staking.deployTransaction.hash);
    console.log("   Tiers: Flexible, Bronze, Silver, Gold, Platinum");
    deploymentData.contracts.Staking = {
      address: staking.address,
      txHash: staking.deployTransaction.hash
    };

    // 6. Configure roles
    console.log("\n🔧 Configuring roles...");

    // Grant Governor PROPOSER_ROLE on Timelock
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    console.log("   ⏳ Granting PROPOSER_ROLE to Governor...");
    const grantProposerTx = await timelock.grantRole(PROPOSER_ROLE, governor.address, gasSettings);
    await grantProposerTx.wait(1);
    console.log("✅ Governor granted PROPOSER_ROLE on Timelock");
    console.log("   Transaction:", grantProposerTx.hash);

    // Set staking contract in treasury
    console.log("   ⏳ Setting staking contract in Treasury...");
    const setStakingTx = await treasury.setStakingContract(staking.address, gasSettings);
    await setStakingTx.wait(1);
    console.log("✅ Staking contract set in Treasury");
    console.log("   Transaction:", setStakingTx.hash);

    // Final balance check
    const finalBalance = await deployer.getBalance();
    const gasSpent = balance.sub(finalBalance);

    // Deployment Summary
    console.log("\n=====================================");
    console.log("🎉 Deployment Complete!");
    console.log("=====================================\n");

    console.log("📋 Contract Addresses:");
    console.log("--------------------");
    console.log("C12DAO Token:     ", c12dao.address);
    console.log("Timelock:         ", timelock.address);
    console.log("Governor:         ", governor.address);
    console.log("Treasury:         ", treasury.address);
    console.log("Staking:          ", staking.address);
    console.log();

    console.log("💰 Token Distribution:");
    console.log("--------------------");
    console.log("Admin:", ADMIN_ADDRESS);
    console.log("  ", ethers.utils.formatEther(ADMIN_INITIAL_MINT), "C12DAO (10%)");
    console.log("Treasury:", treasury.address);
    console.log("  ", ethers.utils.formatEther(TREASURY_ALLOCATION), "C12DAO (20%)");
    console.log("Total Minted:     ", ethers.utils.formatEther(ADMIN_INITIAL_MINT.add(TREASURY_ALLOCATION)), "C12DAO (30%)");
    console.log("Remaining Supply: ", ethers.utils.formatEther(ethers.utils.parseEther("700000000")), "C12DAO (70%)\n");

    console.log("⛽ Gas Usage:");
    console.log("--------------------");
    console.log("Total Gas Spent:", ethers.utils.formatEther(gasSpent), "MATIC");
    console.log("Final Balance:", ethers.utils.formatEther(finalBalance), "MATIC\n");

    console.log("🔍 Next Steps:");
    console.log("--------------------");
    console.log("1. Verify contracts on PolygonScan:");
    console.log("   npx hardhat verify --network polygon", c12dao.address, ADMIN_ADDRESS);
    console.log("   npx hardhat verify --network polygon", timelock.address, "172800", "[]", "[0x0000000000000000000000000000000000000000]", ADMIN_ADDRESS);
    console.log("   npx hardhat verify --network polygon", governor.address, c12dao.address, timelock.address);
    console.log("   npx hardhat verify --network polygon", treasury.address, c12dao.address, C12USD_POLYGON_ADDRESS, ADMIN_ADDRESS);
    console.log("   npx hardhat verify --network polygon", staking.address, c12dao.address, treasury.address, ADMIN_ADDRESS);
    console.log();

    // Save deployment info to file
    const fs = require('fs');

    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    const filename = `./deployments/dao-polygon-mainnet-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));

    console.log("✅ Deployment info saved to", filename, "\n");

    // Also create a simplified env format
    console.log("📝 Add to .env:");
    console.log("--------------------");
    console.log("C12DAO_TOKEN_ADDRESS=" + c12dao.address);
    console.log("C12DAO_TIMELOCK_ADDRESS=" + timelock.address);
    console.log("C12DAO_GOVERNOR_ADDRESS=" + governor.address);
    console.log("C12DAO_TREASURY_ADDRESS=" + treasury.address);
    console.log("C12DAO_STAKING_ADDRESS=" + staking.address);
    console.log();

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);

    // Save partial deployment data
    if (Object.keys(deploymentData.contracts).length > 0) {
      const fs = require('fs');
      if (!fs.existsSync('./deployments')) {
        fs.mkdirSync('./deployments');
      }
      const filename = `./deployments/dao-polygon-FAILED-${Date.now()}.json`;
      deploymentData.error = error.message;
      fs.writeFileSync(filename, JSON.stringify(deploymentData, null, 2));
      console.log("\n⚠️  Partial deployment data saved to", filename);
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
