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
  console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()), "MATIC\n");

  // 1. Deploy C12DAO Token
  console.log("📝 Step 1/5: Deploying C12DAO token...");
  const C12DAOFactory = await ethers.getContractFactory("C12DAO");
  const c12dao = await C12DAOFactory.deploy(ADMIN_ADDRESS);
  await c12dao.deployed();
  console.log("✅ C12DAO deployed to:", c12dao.address);

  // Mint initial tokens to admin (saves gas by doing in deployment flow)
  console.log("   💰 Minting", ethers.utils.formatEther(ADMIN_INITIAL_MINT), "C12DAO to admin...");
  const mintTx = await c12dao.mint(ADMIN_ADDRESS, ADMIN_INITIAL_MINT);
  await mintTx.wait();
  console.log("   ✅ Admin tokens minted\n");

  // 2. Deploy Timelock
  console.log("⏰ Step 2/5: Deploying C12DAOTimelock...");
  const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
  const timelock = await TimelockFactory.deploy(
    172800, // 48 hours (172800 seconds)
    [], // Proposers (will be governor)
    [ethers.constants.AddressZero], // Executors (anyone can execute)
    ADMIN_ADDRESS
  );
  await timelock.deployed();
  console.log("✅ Timelock deployed to:", timelock.address);
  console.log("   Delay: 48 hours\n");

  // 3. Deploy Governor
  console.log("🏛️  Step 3/5: Deploying C12DAOGovernor...");
  const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
  const governor = await GovernorFactory.deploy(
    c12dao.address,
    timelock.address
  );
  await governor.deployed();
  console.log("✅ Governor deployed to:", governor.address);
  console.log("   Voting delay: 1 day");
  console.log("   Voting period: 7 days");
  console.log("   Proposal threshold: 100,000 C12DAO");
  console.log("   Quorum: 4%\n");

  // 4. Deploy Treasury
  console.log("💰 Step 4/5: Deploying C12DAOTreasury...");
  const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");
  const treasury = await TreasuryFactory.deploy(
    c12dao.address,
    C12USD_POLYGON_ADDRESS,
    ADMIN_ADDRESS
  );
  await treasury.deployed();
  console.log("✅ Treasury deployed to:", treasury.address);

  // Mint treasury allocation
  console.log("   💰 Minting", ethers.utils.formatEther(TREASURY_ALLOCATION), "C12DAO to treasury...");
  const treasuryMintTx = await c12dao.mint(treasury.address, TREASURY_ALLOCATION);
  await treasuryMintTx.wait();
  console.log("   ✅ Treasury tokens minted\n");

  // 5. Deploy Staking
  console.log("🔒 Step 5/5: Deploying C12DAOStaking...");
  const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
  const staking = await StakingFactory.deploy(
    c12dao.address,
    treasury.address,
    ADMIN_ADDRESS
  );
  await staking.deployed();
  console.log("✅ Staking deployed to:", staking.address);
  console.log("   Tiers: Flexible, Bronze, Silver, Gold, Platinum\n");

  // 6. Configure roles
  console.log("🔧 Configuring roles...");

  // Grant Governor PROPOSER_ROLE on Timelock
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const grantProposerTx = await timelock.grantRole(PROPOSER_ROLE, governor.address);
  await grantProposerTx.wait();
  console.log("✅ Governor granted PROPOSER_ROLE on Timelock");

  // Set staking contract in treasury
  const setStakingTx = await treasury.setStakingContract(staking.address);
  await setStakingTx.wait();
  console.log("✅ Staking contract set in Treasury\n");

  // Deployment Summary
  console.log("=====================================");
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
  console.log("Admin (", ADMIN_ADDRESS, "):");
  console.log("  ", ethers.utils.formatEther(ADMIN_INITIAL_MINT), "C12DAO (10%)");
  console.log("Treasury (", treasury.address, "):");
  console.log("  ", ethers.utils.formatEther(TREASURY_ALLOCATION), "C12DAO (20%)");
  console.log("Total Minted:     ", ethers.utils.formatEther(ADMIN_INITIAL_MINT.add(TREASURY_ALLOCATION)), "C12DAO (30%)");
  console.log("Remaining Supply: ", ethers.utils.formatEther(ethers.utils.parseEther("700000000")), "C12DAO (70%)\n");

  console.log("🔍 Next Steps:");
  console.log("--------------------");
  console.log("1. Verify contracts on PolygonScan:");
  console.log("   npx hardhat verify --network polygon", c12dao.address, ADMIN_ADDRESS);
  console.log("   npx hardhat verify --network polygon", timelock.address, "172800 [] [0x0000000000000000000000000000000000000000]", ADMIN_ADDRESS);
  console.log();
  console.log("2. Save addresses to .env:");
  console.log("   C12DAO_TOKEN_ADDRESS=" + c12dao.address);
  console.log("   C12DAO_TIMELOCK_ADDRESS=" + timelock.address);
  console.log("   C12DAO_GOVERNOR_ADDRESS=" + governor.address);
  console.log("   C12DAO_TREASURY_ADDRESS=" + treasury.address);
  console.log("   C12DAO_STAKING_ADDRESS=" + staking.address);
  console.log();
  console.log("3. Test token functionality:");
  console.log("   - Check admin balance");
  console.log("   - Delegate voting power");
  console.log("   - Create test proposal");
  console.log();
  console.log("4. When ready, transfer C12USD roles to Timelock for decentralization");
  console.log();

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      C12DAO: c12dao.address,
      Timelock: timelock.address,
      Governor: governor.address,
      Treasury: treasury.address,
      Staking: staking.address
    },
    distribution: {
      admin: {
        address: ADMIN_ADDRESS,
        amount: ethers.utils.formatEther(ADMIN_INITIAL_MINT)
      },
      treasury: {
        address: treasury.address,
        amount: ethers.utils.formatEther(TREASURY_ALLOCATION)
      }
    }
  };

  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  fs.writeFileSync(
    `./deployments/dao-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment info saved to ./deployments/\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
