const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ADMIN = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const C12DAO = "0x26F3d3c2C759acE462882864aa692FBa4512e38B";

  console.log("🗳️  Delegating Voting Power\n");
  console.log("C12DAO:", C12DAO);
  console.log("Admin:", ADMIN);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Delegating from:", deployer.address);

  const c12dao = await ethers.getContractAt("C12DAO", C12DAO);

  // Check current delegation
  const currentDelegatee = await c12dao.delegates(deployer.address);
  const balance = await c12dao.balanceOf(deployer.address);
  const votes = await c12dao.getVotes(deployer.address);

  console.log("\nCurrent Status:");
  console.log("  Balance:", ethers.utils.formatEther(balance), "C12DAO");
  console.log("  Current Delegatee:", currentDelegatee);
  console.log("  Voting Power:", ethers.utils.formatEther(votes), "C12DAO\n");

  if (currentDelegatee.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✅ Already delegated to self!");
  } else {
    console.log("⏳ Delegating voting power to self...");

    const currentGasPrice = await ethers.provider.getGasPrice();
    const gasPrice = currentGasPrice.mul(200).div(100);

    const tx = await c12dao.delegate(deployer.address, {
      gasPrice: gasPrice,
      gasLimit: 500000
    });

    console.log("   TX:", tx.hash);
    console.log("   Waiting for confirmation...");
    await tx.wait(3);

    const newVotes = await c12dao.getVotes(deployer.address);

    console.log("\n✅ Delegation Complete!");
    console.log("   Voting Power:", ethers.utils.formatEther(newVotes), "C12DAO");
  }

  console.log("\n=====================================");
  console.log("📊 Delegation Summary");
  console.log("=====================================");

  const finalVotes = await c12dao.getVotes(deployer.address);
  const totalSupply = await c12dao.totalSupply();
  const votingPercentage = finalVotes.mul(10000).div(totalSupply).toNumber() / 100;

  console.log("Your Voting Power:", ethers.utils.formatEther(finalVotes), "C12DAO");
  console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "C12DAO");
  console.log("Voting Share:", votingPercentage.toFixed(2) + "%");

  console.log("\n✅ You can now:");
  console.log("   • Create governance proposals (requires 100K C12DAO)");
  console.log("   • Vote on existing proposals");
  console.log("   • Participate in DAO governance");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
