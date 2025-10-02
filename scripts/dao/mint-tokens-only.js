const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN_ADDRESS = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const TREASURY_ADDRESS = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";
  const C12DAO_ADDRESS = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";

  const ADMIN_MINT = ethers.utils.parseEther("100000000"); // 100M
  const TREASURY_MINT = ethers.utils.parseEther("200000000"); // 200M

  console.log("💰 Minting C12DAO Tokens\n");
  console.log("C12DAO:", C12DAO_ADDRESS);
  console.log("Admin:", ADMIN_ADDRESS);
  console.log("Treasury:", TREASURY_ADDRESS);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Minting from:", deployer.address);

  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(200).div(100);

  const gasSettings = {
    gasPrice: gasPrice,
    gasLimit: 5000000
  };

  console.log("Gas:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei\n");

  const c12dao = await ethers.getContractAt("C12DAO", C12DAO_ADDRESS);

  try {
    // Check current balances
    const adminBalance = await c12dao.balanceOf(ADMIN_ADDRESS);
    const treasuryBalance = await c12dao.balanceOf(TREASURY_ADDRESS);

    console.log("Current Balances:");
    console.log("Admin:   ", ethers.utils.formatEther(adminBalance), "C12DAO");
    console.log("Treasury:", ethers.utils.formatEther(treasuryBalance), "C12DAO\n");

    // Mint to Admin
    if (adminBalance.lt(ADMIN_MINT)) {
      console.log("1️⃣  Minting", ethers.utils.formatEther(ADMIN_MINT), "C12DAO to Admin...");
      const mintAdminTx = await c12dao.mint(ADMIN_ADDRESS, ADMIN_MINT, gasSettings);
      console.log("   TX:", mintAdminTx.hash);
      console.log("   ⏳ Waiting for confirmation...");
      await mintAdminTx.wait(3);
      console.log("   ✅ Confirmed\n");
    } else {
      console.log("✅ Admin already has sufficient tokens\n");
    }

    // Mint to Treasury
    if (treasuryBalance.lt(TREASURY_MINT)) {
      console.log("2️⃣  Minting", ethers.utils.formatEther(TREASURY_MINT), "C12DAO to Treasury...");
      const mintTreasuryTx = await c12dao.mint(TREASURY_ADDRESS, TREASURY_MINT, gasSettings);
      console.log("   TX:", mintTreasuryTx.hash);
      console.log("   ⏳ Waiting for confirmation...");
      await mintTreasuryTx.wait(3);
      console.log("   ✅ Confirmed\n");
    } else {
      console.log("✅ Treasury already has sufficient tokens\n");
    }

    // Final balances
    const finalAdminBalance = await c12dao.balanceOf(ADMIN_ADDRESS);
    const finalTreasuryBalance = await c12dao.balanceOf(TREASURY_ADDRESS);
    const totalSupply = await c12dao.totalSupply();

    console.log("=====================================");
    console.log("✅ Minting Complete!");
    console.log("=====================================\n");

    console.log("📊 Final Token Distribution:");
    console.log("-----------------------------");
    console.log("Total Supply:  ", ethers.utils.formatEther(totalSupply), "C12DAO");
    console.log("Admin:         ", ethers.utils.formatEther(finalAdminBalance), "C12DAO (", finalAdminBalance.mul(100).div(totalSupply).toString(), "%)");
    console.log("Treasury:      ", ethers.utils.formatEther(finalTreasuryBalance), "C12DAO (", finalTreasuryBalance.mul(100).div(totalSupply).toString(), "%)");
    console.log();

    const remaining = ethers.utils.parseEther("1000000000").sub(totalSupply);
    console.log("Remaining Supply:", ethers.utils.formatEther(remaining), "C12DAO (", remaining.mul(100).div(ethers.utils.parseEther("1000000000")).toString(), "%)");
    console.log("\n✅ Tokens successfully minted!");

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
