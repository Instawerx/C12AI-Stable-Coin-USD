const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN_ADDRESS = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12USD_ADDRESS = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811";

  console.log("🚀 Fast Deployment with Current Gas Prices");
  console.log("==========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.utils.formatEther(await deployer.getBalance()), "MATIC\n");

  // Use current fast gas price: 56 (base) + 40.72 (priority) ≈ 100 gwei
  const gasPrice = ethers.utils.parseUnits("105", "gwei"); // 105 gwei for fast confirmation
  console.log("Using gas price: 105 gwei (fast)\n");

  const gas = { gasPrice, gasLimit: 6000000 }; // 6M limit
  let addr = {};

  try {
    // 1. C12DAO
    console.log("1/5 Deploying C12DAO...");
    const C12DAO = await ethers.getContractFactory("C12DAO");
    const c12dao = await C12DAO.deploy(ADMIN_ADDRESS, gas);
    console.log("TX:", c12dao.deployTransaction.hash);
    await c12dao.deployed();
    console.log("✅ C12DAO:", c12dao.address, "\n");
    addr.C12DAO = c12dao.address;

    // Mint 100M to admin
    console.log("Minting 100M to admin...");
    const tx1 = await c12dao.mint(ADMIN_ADDRESS, ethers.utils.parseEther("100000000"), { gasPrice, gasLimit: 200000 });
    await tx1.wait();
    console.log("✅ Minted\n");

    // 2. Timelock
    console.log("2/5 Deploying Timelock...");
    const Timelock = await ethers.getContractFactory("C12DAOTimelock");
    const timelock = await Timelock.deploy(172800, [], [ethers.constants.AddressZero], ADMIN_ADDRESS, { gasPrice, gasLimit: 3500000 });
    console.log("TX:", timelock.deployTransaction.hash);
    await timelock.deployed();
    console.log("✅ Timelock:", timelock.address, "\n");
    addr.Timelock = timelock.address;

    // 3. Governor
    console.log("3/5 Deploying Governor...");
    const Governor = await ethers.getContractFactory("C12DAOGovernor");
    const governor = await Governor.deploy(c12dao.address, timelock.address, { gasPrice, gasLimit: 5000000 });
    console.log("TX:", governor.deployTransaction.hash);
    await governor.deployed();
    console.log("✅ Governor:", governor.address, "\n");
    addr.Governor = governor.address;

    // 4. Treasury
    console.log("4/5 Deploying Treasury...");
    const Treasury = await ethers.getContractFactory("C12DAOTreasury");
    const treasury = await Treasury.deploy(c12dao.address, C12USD_ADDRESS, ADMIN_ADDRESS, { gasPrice, gasLimit: 3500000 });
    console.log("TX:", treasury.deployTransaction.hash);
    await treasury.deployed();
    console.log("✅ Treasury:", treasury.address, "\n");
    addr.Treasury = treasury.address;

    // Mint 200M to treasury
    console.log("Minting 200M to treasury...");
    const tx2 = await c12dao.mint(treasury.address, ethers.utils.parseEther("200000000"), { gasPrice, gasLimit: 200000 });
    await tx2.wait();
    console.log("✅ Minted\n");

    // 5. Staking
    console.log("5/5 Deploying Staking...");
    const Staking = await ethers.getContractFactory("C12DAOStaking");
    const staking = await Staking.deploy(c12dao.address, treasury.address, ADMIN_ADDRESS, { gasPrice, gasLimit: 4500000 });
    console.log("TX:", staking.deployTransaction.hash);
    await staking.deployed();
    console.log("✅ Staking:", staking.address, "\n");
    addr.Staking = staking.address;

    // Configure
    console.log("Configuring roles...");
    const PROPOSER = await timelock.PROPOSER_ROLE();
    const tx3 = await timelock.grantRole(PROPOSER, governor.address, { gasPrice, gasLimit: 150000 });
    await tx3.wait();
    const tx4 = await treasury.setStakingContract(staking.address, { gasPrice, gasLimit: 150000 });
    await tx4.wait();
    console.log("✅ Configured\n");

    // Summary
    console.log("=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Addresses:");
    console.log("C12DAO:   ", addr.C12DAO);
    console.log("Timelock: ", addr.Timelock);
    console.log("Governor: ", addr.Governor);
    console.log("Treasury: ", addr.Treasury);
    console.log("Staking:  ", addr.Staking);

    console.log("\n🔍 Verify:");
    console.log("npx hardhat verify --network polygon", addr.C12DAO, ADMIN_ADDRESS);
    console.log("npx hardhat verify --network polygon", addr.Timelock, '"172800"', '"[]"', '\'["' + ethers.constants.AddressZero + '"]\'', ADMIN_ADDRESS);
    console.log("npx hardhat verify --network polygon", addr.Governor, addr.C12DAO, addr.Timelock);
    console.log("npx hardhat verify --network polygon", addr.Treasury, addr.C12DAO, C12USD_ADDRESS, ADMIN_ADDRESS);
    console.log("npx hardhat verify --network polygon", addr.Staking, addr.C12DAO, addr.Treasury, ADMIN_ADDRESS);

    // Save
    const fs = require('fs');
    fs.mkdirSync('./deployments', { recursive: true });
    fs.writeFileSync(
      `./deployments/dao-mainnet-${Date.now()}.json`,
      JSON.stringify({ network: "polygon", chainId: 137, timestamp: new Date().toISOString(), contracts: addr }, null, 2)
    );
    console.log("\n✅ Saved to ./deployments/");

  } catch (e) {
    console.error("❌ Error:", e.message);
    if (Object.keys(addr).length) {
      console.log("\n⚠️ Partial deployment:", addr);
    }
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
