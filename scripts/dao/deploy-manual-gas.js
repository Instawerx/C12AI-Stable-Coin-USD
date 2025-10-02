const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_POLYGON_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";

  const ADMIN_INITIAL_MINT = ethers.utils.parseEther("100000000"); // 100M
  const TREASURY_ALLOCATION = ethers.utils.parseEther("200000000"); // 200M

  console.log("🚀 Deploying C12DAO with manual gas limits...");
  console.log("Admin:", ADMIN_ADDRESS);
  console.log("Network:", hre.network.name);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC\n");

  // Get current gas price
  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(150).div(100); // 150% buffer
  console.log("Current gas price:", ethers.utils.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("Using gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  let addresses = {};

  try {
    // 1. Deploy C12DAO with explicit gas limit
    console.log("📝 [1/5] Deploying C12DAO Token...");
    const C12DAOFactory = await ethers.getContractFactory("C12DAO");

    console.log("   Sending deployment transaction with 5M gas limit...");
    const c12dao = await C12DAOFactory.deploy(ADMIN_ADDRESS, {
      gasPrice: gasPrice,
      gasLimit: 5000000 // 5M gas - explicit limit
    });

    console.log("   ✅ TX Sent:", c12dao.deployTransaction.hash);
    console.log("   ⏳ Waiting for confirmation (this may take 30-60 seconds)...");

    const receipt = await c12dao.deployTransaction.wait(1);
    console.log("   ✅ Confirmed in block:", receipt.blockNumber);
    console.log("   ✅ Gas used:", receipt.gasUsed.toString());
    console.log("✅ C12DAO deployed:", c12dao.address);
    addresses.C12DAO = c12dao.address;

    // Mint to admin
    console.log("\n   💰 Minting 100M tokens to admin...");
    const mintTx = await c12dao.mint(ADMIN_ADDRESS, ADMIN_INITIAL_MINT, {
      gasPrice: gasPrice,
      gasLimit: 200000
    });
    console.log("   TX:", mintTx.hash);
    await mintTx.wait(1);
    console.log("   ✅ Minted!");

    // 2. Deploy Timelock
    console.log("\n⏰ [2/5] Deploying C12DAOTimelock...");
    const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");

    const timelock = await TimelockFactory.deploy(
      172800,
      [],
      [ethers.constants.AddressZero],
      ADMIN_ADDRESS,
      {
        gasPrice: gasPrice,
        gasLimit: 3000000 // 3M gas
      }
    );

    console.log("   ✅ TX Sent:", timelock.deployTransaction.hash);
    console.log("   ⏳ Waiting for confirmation...");
    await timelock.deployTransaction.wait(1);
    console.log("✅ Timelock deployed:", timelock.address);
    addresses.Timelock = timelock.address;

    // 3. Deploy Governor
    console.log("\n🏛️  [3/5] Deploying C12DAOGovernor...");
    const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");

    const governor = await GovernorFactory.deploy(
      c12dao.address,
      timelock.address,
      {
        gasPrice: gasPrice,
        gasLimit: 4500000 // 4.5M gas
      }
    );

    console.log("   ✅ TX Sent:", governor.deployTransaction.hash);
    console.log("   ⏳ Waiting for confirmation...");
    await governor.deployTransaction.wait(1);
    console.log("✅ Governor deployed:", governor.address);
    addresses.Governor = governor.address;

    // 4. Deploy Treasury
    console.log("\n💰 [4/5] Deploying C12DAOTreasury...");
    const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");

    const treasury = await TreasuryFactory.deploy(
      c12dao.address,
      C12USD_POLYGON_ADDRESS,
      ADMIN_ADDRESS,
      {
        gasPrice: gasPrice,
        gasLimit: 3000000 // 3M gas
      }
    );

    console.log("   ✅ TX Sent:", treasury.deployTransaction.hash);
    console.log("   ⏳ Waiting for confirmation...");
    await treasury.deployTransaction.wait(1);
    console.log("✅ Treasury deployed:", treasury.address);
    addresses.Treasury = treasury.address;

    // Mint to treasury
    console.log("\n   💰 Minting 200M tokens to treasury...");
    const treasuryMintTx = await c12dao.mint(treasury.address, TREASURY_ALLOCATION, {
      gasPrice: gasPrice,
      gasLimit: 200000
    });
    console.log("   TX:", treasuryMintTx.hash);
    await treasuryMintTx.wait(1);
    console.log("   ✅ Minted!");

    // 5. Deploy Staking
    console.log("\n🔒 [5/5] Deploying C12DAOStaking...");
    const StakingFactory = await ethers.getContractFactory("C12DAOStaking");

    const staking = await StakingFactory.deploy(
      c12dao.address,
      treasury.address,
      ADMIN_ADDRESS,
      {
        gasPrice: gasPrice,
        gasLimit: 4000000 // 4M gas
      }
    );

    console.log("   ✅ TX Sent:", staking.deployTransaction.hash);
    console.log("   ⏳ Waiting for confirmation...");
    await staking.deployTransaction.wait(1);
    console.log("✅ Staking deployed:", staking.address);
    addresses.Staking = staking.address;

    // 6. Configure roles
    console.log("\n🔧 Configuring roles...");

    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    console.log("   Granting PROPOSER_ROLE to Governor...");
    const grantTx = await timelock.grantRole(PROPOSER_ROLE, governor.address, {
      gasPrice: gasPrice,
      gasLimit: 150000
    });
    console.log("   TX:", grantTx.hash);
    await grantTx.wait(1);
    console.log("   ✅ Role granted!");

    console.log("   Setting staking in treasury...");
    const setStakingTx = await treasury.setStakingContract(staking.address, {
      gasPrice: gasPrice,
      gasLimit: 150000
    });
    console.log("   TX:", setStakingTx.hash);
    await setStakingTx.wait(1);
    console.log("   ✅ Staking configured!");

    // Final summary
    const finalBalance = await deployer.getBalance();
    const gasSpent = balance.sub(finalBalance);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));

    console.log("\n📋 Contract Addresses:");
    console.log("-".repeat(60));
    console.log("C12DAO Token:     ", addresses.C12DAO);
    console.log("Timelock:         ", addresses.Timelock);
    console.log("Governor:         ", addresses.Governor);
    console.log("Treasury:         ", addresses.Treasury);
    console.log("Staking:          ", addresses.Staking);

    console.log("\n💰 Token Distribution:");
    console.log("-".repeat(60));
    console.log("Admin:            ", ethers.utils.formatEther(ADMIN_INITIAL_MINT), "C12DAO (10%)");
    console.log("Treasury:         ", ethers.utils.formatEther(TREASURY_ALLOCATION), "C12DAO (20%)");
    console.log("Remaining:        ", "700,000,000 C12DAO (70%)");

    console.log("\n⛽ Gas Usage:");
    console.log("-".repeat(60));
    console.log("Total Gas Cost:   ", ethers.utils.formatEther(gasSpent), "MATIC");
    console.log("Final Balance:    ", ethers.utils.formatEther(finalBalance), "MATIC");

    console.log("\n🔍 Verification Commands:");
    console.log("-".repeat(60));
    console.log("npx hardhat verify --network polygon", addresses.C12DAO, ADMIN_ADDRESS);
    console.log("npx hardhat verify --network polygon", addresses.Timelock, '"172800"', '"[]"', '\'["0x0000000000000000000000000000000000000000"]\'', ADMIN_ADDRESS);
    console.log("npx hardhat verify --network polygon", addresses.Governor, addresses.C12DAO, addresses.Timelock);
    console.log("npx hardhat verify --network polygon", addresses.Treasury, addresses.C12DAO, C12USD_POLYGON_ADDRESS, ADMIN_ADDRESS);
    console.log("npx hardhat verify --network polygon", addresses.Staking, addresses.C12DAO, addresses.Treasury, ADMIN_ADDRESS);

    console.log("\n📝 Add to .env:");
    console.log("-".repeat(60));
    console.log("C12DAO_TOKEN_ADDRESS=" + addresses.C12DAO);
    console.log("C12DAO_TIMELOCK_ADDRESS=" + addresses.Timelock);
    console.log("C12DAO_GOVERNOR_ADDRESS=" + addresses.Governor);
    console.log("C12DAO_TREASURY_ADDRESS=" + addresses.Treasury);
    console.log("C12DAO_STAKING_ADDRESS=" + addresses.Staking);

    // Save to file
    const fs = require('fs');
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    const deploymentData = {
      network: hre.network.name,
      chainId: 137,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      gasUsed: ethers.utils.formatEther(gasSpent) + " MATIC",
      contracts: addresses
    };

    fs.writeFileSync(
      `./deployments/dao-polygon-mainnet-${Date.now()}.json`,
      JSON.stringify(deploymentData, null, 2)
    );

    console.log("\n✅ Deployment data saved to ./deployments/");
    console.log("\n🎊 SUCCESS! All DAO contracts deployed to Polygon mainnet!");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error.message);

    if (Object.keys(addresses).length > 0) {
      console.log("\n⚠️  Partially deployed contracts:");
      for (const [name, address] of Object.entries(addresses)) {
        console.log(`   ${name}: ${address}`);
      }
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
