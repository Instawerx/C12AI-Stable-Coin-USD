const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const GOVERNOR = "0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a";

  // Get proposal ID from command line
  const proposalId = process.argv[2] || "103354803886382226551594198940159869489593571738779142472981983723690257223991";

  console.log("🔍 Checking Proposal Status\n");
  console.log("Governor:", GOVERNOR);
  console.log("Proposal ID:", proposalId);
  console.log("=====================================\n");

  const governor = await ethers.getContractAt("C12DAOGovernor", GOVERNOR);

  // Get proposal state
  const state = await governor.state(proposalId);
  const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

  console.log("📊 Proposal Status");
  console.log("------------------");
  console.log("State:", stateNames[state]);

  // Get vote results
  const proposalVotes = await governor.proposalVotes(proposalId);

  console.log("\n📊 Vote Tally");
  console.log("-------------");
  console.log("For:", ethers.utils.formatEther(proposalVotes.forVotes), "C12DAO");
  console.log("Against:", ethers.utils.formatEther(proposalVotes.againstVotes), "C12DAO");
  console.log("Abstain:", ethers.utils.formatEther(proposalVotes.abstainVotes), "C12DAO");

  const totalVotes = proposalVotes.forVotes.add(proposalVotes.againstVotes).add(proposalVotes.abstainVotes);
  console.log("Total Votes:", ethers.utils.formatEther(totalVotes), "C12DAO");

  // Check quorum
  const blockNumber = await ethers.provider.getBlockNumber();
  const quorum = await governor.quorum(blockNumber - 1);

  console.log("\n📊 Quorum");
  console.log("---------");
  console.log("Required:", ethers.utils.formatEther(quorum), "C12DAO");
  console.log("Current:", ethers.utils.formatEther(totalVotes), "C12DAO");

  if (totalVotes.gte(quorum)) {
    console.log("✅ Quorum reached!");
  } else {
    const remaining = quorum.sub(totalVotes);
    console.log("⏳ Need", ethers.utils.formatEther(remaining), "more votes");
  }

  // Get proposal deadline
  const proposalDeadline = await governor.proposalDeadline(proposalId);
  console.log("\n⏰ Timeline");
  console.log("-----------");
  console.log("Voting Deadline Block:", proposalDeadline.toString());
  console.log("Current Block:", blockNumber);

  if (blockNumber < proposalDeadline.toNumber()) {
    const blocksRemaining = proposalDeadline.toNumber() - blockNumber;
    const daysRemaining = blocksRemaining / 43200; // ~2 sec per block
    console.log("Blocks Remaining:", blocksRemaining);
    console.log("Time Remaining: ~", daysRemaining.toFixed(2), "days");
  } else {
    console.log("✅ Voting period ended");
  }

  console.log("\n" + "=".repeat(50));

  if (state === 0) {
    console.log("⏳ Proposal is pending - wait for voting delay");
  } else if (state === 1) {
    console.log("✅ Proposal is active - you can vote now!");
  } else if (state === 4) {
    console.log("✅ Proposal succeeded - ready to queue in Timelock");
  } else if (state === 5) {
    console.log("⏰ Proposal queued - waiting for timelock (48 hours)");
  } else if (state === 7) {
    console.log("✅ Proposal executed successfully!");
  } else if (state === 3) {
    console.log("❌ Proposal defeated");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
