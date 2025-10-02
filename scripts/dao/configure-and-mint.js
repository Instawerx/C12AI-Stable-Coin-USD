const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN_ADDRESS = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const TREASURER_ADDRESS = "0x86111914504B82eF1c487241124C02f9D09325C4";

  const C12DAO_ADDRESS = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";
  const TIMELOCK_ADDRESS = "0xC6C82F86Dc4b2ab0239311D01ABa5907bB907B66";
  const GOVERNOR_ADDRESS = "0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a";
  const TREASURY_ADDRESS = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";
  const STAKING_ADDRESS = "0x26F5470B289dE63a3B1b726cE3DCe2EaEB3471ee";

  const ADMIN_MINT = ethers.utils.parseEther("100000000"); // 100M
  const TREASURY_MINT = ethers.utils.parseEther("200000000"); // 200M

  console.log("🔧 Configuring C12DAO Roles and Minting Tokens\n");
  console.log("Admin:", ADMIN_ADDRESS);
  console.log("Treasurer:", TREASURER_ADDRESS);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Executing from:", deployer.address);

  // Get contract instances
  const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS);
  const timelock = await ethers.getContractAt("C12DAOTimelock", TIMELOCK_ADDRESS);
  const treasury = await ethers.getContractAt("C12DAOTreasury", TREASURY_ADDRESS);

  // Gas settings - use higher gas for reliability
  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(150).div(100); // 150% buffer
  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 5000000
  };

  console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  try {
    // Step 1: Grant PROPOSER_ROLE to Governor
    console.log("1️⃣  Granting PROPOSER_ROLE to Governor...");
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();

    // Check if already granted
    const hasRole = await timelock.hasRole(PROPOSER_ROLE, GOVERNOR_ADDRESS);
    if (hasRole) {
      console.log("   ✅ Governor already has PROPOSER_ROLE\n");
    } else {
      const grantTx = await timelock.grantRole(PROPOSER_ROLE, GOVERNOR_ADDRESS, gasSettings);
      console.log("   TX:", grantTx.hash);
      await grantTx.wait(2);
      console.log("   ✅ PROPOSER_ROLE granted to Governor\n");
    }

    // Step 2: Set staking contract in Treasury
    console.log("2️⃣  Setting staking contract in Treasury...");
    const currentStaking = await treasury.stakingContract();
    if (currentStaking.toLowerCase() === STAKING_ADDRESS.toLowerCase()) {
      console.log("   ✅ Staking contract already set\n");
    } else {
      const setStakingTx = await treasury.setStakingContract(STAKING_ADDRESS, gasSettings);
      console.log("   TX:", setStakingTx.hash);
      await setStakingTx.wait(2);
      console.log("   ✅ Staking contract set in Treasury\n");
    }

    // Step 3: Mint tokens to Admin
    console.log("3️⃣  Minting", ethers.utils.formatEther(ADMIN_MINT), "C12DAO to Admin...");
    const adminBalance = await c12dao.balanceOf(ADMIN_ADDRESS);
    if (adminBalance.gte(ADMIN_MINT)) {
      console.log("   ✅ Admin already has sufficient tokens");
      console.log("   Balance:", ethers.utils.formatEther(adminBalance), "C12DAO\n");
    } else {
      const mintAdminTx = await c12dao.mint(ADMIN_ADDRESS, ADMIN_MINT, gasSettings);
      console.log("   TX:", mintAdminTx.hash);
      await mintAdminTx.wait(2);
      const newBalance = await c12dao.balanceOf(ADMIN_ADDRESS);
      console.log("   ✅ Minted to Admin");
      console.log("   New Balance:", ethers.utils.formatEther(newBalance), "C12DAO\n");
    }

    // Step 4: Mint tokens to Treasury
    console.log("4️⃣  Minting", ethers.utils.formatEther(TREASURY_MINT), "C12DAO to Treasury...");
    const treasuryBalance = await c12dao.balanceOf(TREASURY_ADDRESS);
    if (treasuryBalance.gte(TREASURY_MINT)) {
      console.log("   ✅ Treasury already has sufficient tokens");
      console.log("   Balance:", ethers.utils.formatEther(treasuryBalance), "C12DAO\n");
    } else {
      const mintTreasuryTx = await c12dao.mint(TREASURY_ADDRESS, TREASURY_MINT, gasSettings);
      console.log("   TX:", mintTreasuryTx.hash);
      await mintTreasuryTx.wait(2);
      const newBalance = await c12dao.balanceOf(TREASURY_ADDRESS);
      console.log("   ✅ Minted to Treasury");
      console.log("   New Balance:", ethers.utils.formatEther(newBalance), "C12DAO\n");
    }

    // Final Summary
    console.log("=====================================");
    console.log("✅ Configuration & Minting Complete!");
    console.log("=====================================\n");

    const totalSupply = await c12dao.totalSupply();
    const adminFinal = await c12dao.balanceOf(ADMIN_ADDRESS);
    const treasuryFinal = await c12dao.balanceOf(TREASURY_ADDRESS);

    console.log("📊 Token Distribution:");
    console.log("---------------------");
    console.log("Total Supply:  ", ethers.utils.formatEther(totalSupply), "C12DAO");
    console.log("Admin:         ", ethers.utils.formatEther(adminFinal), "C12DAO");
    console.log("Treasury:      ", ethers.utils.formatEther(treasuryFinal), "C12DAO");
    console.log();

    console.log("🏛️  Governance Status:");
    console.log("---------------------");
    console.log("Governor has PROPOSER_ROLE:", await timelock.hasRole(PROPOSER_ROLE, GOVERNOR_ADDRESS));
    console.log("Treasury staking set:", await treasury.stakingContract() === STAKING_ADDRESS);
    console.log();

    console.log("✅ DAO is ready for governance!");

  } catch (error) {
    console.error("\n❌ Configuration failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
