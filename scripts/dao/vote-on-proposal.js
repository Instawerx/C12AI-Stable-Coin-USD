const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const GOVERNOR = "0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a";

  // Get proposal ID from command line or use latest
  const proposalId = process.argv[2] || "103354803886382226551594198940159869489593571738779142472981983723690257223931";

  console.log("🗳️  Voting on Proposal\n");
  console.log("Governor:", GOVERNOR);
  console.log("Proposal ID:", proposalId);
  console.log("=====================================\n");

  const [voter] = await ethers.getSigners();
  console.log("Voter:", voter.address);

  const governor = await ethers.getContractAt("C12DAOGovernor", GOVERNOR);
  const c12dao = await ethers.getContractAt("C12DAO", "0x26F3d3c2C759acE462882864aa692FBa4512e38B");

  // Check voting power
  const votingPower = await c12dao.getVotes(voter.address);
  console.log("Voting Power:", ethers.utils.formatEther(votingPower), "C12DAO\n");

  if (votingPower.eq(0)) {
    console.log("❌ No voting power! Delegate your tokens first:");
    console.log("   npx hardhat run scripts/dao/delegate-voting-power.js --network polygon");
    return;
  }

  // Check proposal state
  const state = await governor.state(proposalId);
  const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

  console.log("Proposal State:", stateNames[state]);

  if (state !== 1) { // Not Active
    console.log("\n⚠️  Proposal is not active for voting");
    console.log("   Current state:", stateNames[state]);
    if (state === 0) {
      console.log("   Wait for voting delay to pass (~2 days)");
    }
    return;
  }

  // Check if already voted
  const hasVoted = await governor.hasVoted(proposalId, voter.address);
  if (hasVoted) {
    console.log("\n✅ You have already voted on this proposal!");
    return;
  }

  // Vote: 0 = Against, 1 = For, 2 = Abstain
  console.log("\n📊 Vote Options:");
  console.log("   0 = Against");
  console.log("   1 = For (YES)");
  console.log("   2 = Abstain");

  const voteChoice = 1; // Vote FOR (can be changed)
  console.log("\nVoting: FOR (1)\n");

  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(200).div(100);

  console.log("⏳ Casting vote...");

  const tx = await governor.castVote(proposalId, voteChoice, {
    gasPrice: gasPrice,
    gasLimit: 500000
  });

  console.log("   TX:", tx.hash);
  console.log("   Waiting for confirmation...");
  await tx.wait(3);

  console.log("\n✅ Vote Cast Successfully!");

  // Get vote results
  const proposalVotes = await governor.proposalVotes(proposalId);

  console.log("\n=====================================");
  console.log("📊 Current Vote Tally");
  console.log("=====================================");
  console.log("For:", ethers.utils.formatEther(proposalVotes.forVotes), "C12DAO");
  console.log("Against:", ethers.utils.formatEther(proposalVotes.againstVotes), "C12DAO");
  console.log("Abstain:", ethers.utils.formatEther(proposalVotes.abstainVotes), "C12DAO");

  const quorum = await governor.quorum(await ethers.provider.getBlockNumber() - 1);
  console.log("\nQuorum Required:", ethers.utils.formatEther(quorum), "C12DAO");

  if (proposalVotes.forVotes.gte(quorum)) {
    console.log("✅ Quorum reached!");
  } else {
    console.log("⏳ Quorum not yet reached");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
