const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const TREASURY = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";
  const C12DAO = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";

  const ADMIN_MINT = ethers.utils.parseEther("100000000"); // 100M
  const TREASURY_MINT = ethers.utils.parseEther("200000000"); // 200M

  console.log("⚡ Ultra-Fast Mint (High Priority Gas)\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC\n");

  // ULTRA HIGH GAS - 300% of current for priority
  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(300).div(100); // 300%!

  console.log("Current gas:", ethers.utils.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("Using gas:  ", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei (300% priority)\n");

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 5000000
  };

  const c12dao = await ethers.getContractAt("C12DAO", C12DAO);

  try {
    // Check current balances
    const adminBal = await c12dao.balanceOf(ADMIN);
    const treasuryBal = await c12dao.balanceOf(TREASURY);

    console.log("Current Balances:");
    console.log("Admin:   ", ethers.utils.formatEther(adminBal), "C12DAO");
    console.log("Treasury:", ethers.utils.formatEther(treasuryBal), "C12DAO\n");

    // Mint to Admin
    if (adminBal.lt(ADMIN_MINT)) {
      console.log("💰 Minting", ethers.utils.formatEther(ADMIN_MINT), "C12DAO to Admin...");
      const tx1 = await c12dao.mint(ADMIN, ADMIN_MINT, gasSettings);
      console.log("   TX:", tx1.hash);
      console.log("   ✅ Submitted (not waiting)\n");
    } else {
      console.log("✅ Admin already has tokens\n");
    }

    // Mint to Treasury
    if (treasuryBal.lt(TREASURY_MINT)) {
      console.log("💰 Minting", ethers.utils.formatEther(TREASURY_MINT), "C12DAO to Treasury...");
      const tx2 = await c12dao.mint(TREASURY, TREASURY_MINT, gasSettings);
      console.log("   TX:", tx2.hash);
      console.log("   ✅ Submitted (not waiting)\n");
    } else {
      console.log("✅ Treasury already has tokens\n");
    }

    console.log("=====================================");
    console.log("✅ Mint Transactions Submitted!");
    console.log("=====================================\n");
    console.log("⏳ Check status in 5-10 minutes:");
    console.log("   npx hardhat run scripts/dao/check-balances.js --network polygon");
    console.log();
    console.log("   OR visit Polygonscan:");
    console.log("   https://polygonscan.com/address/" + C12DAO);

  } catch (error) {
    console.error("\n❌ Minting failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
