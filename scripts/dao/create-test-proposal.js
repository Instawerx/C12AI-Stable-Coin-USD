const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const GOVERNOR = "0xd497Cd11123A31AB711bb0Cf335A0987CfD9133a";
  const TREASURY = "0xC33F6e4B62Ab04Dc0826982Cb55Daf02fCEa5c83";

  console.log("🏛️  Creating Test Governance Proposal\n");
  console.log("Governor:", GOVERNOR);
  console.log("Treasury:", TREASURY);
  console.log("=====================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Proposer:", deployer.address);

  const governor = await ethers.getContractAt("C12DAOGovernor", GOVERNOR);
  const c12dao = await ethers.getContractAt("C12DAO", "0x26F3d3c2C759acE462882864aa692FBa4512e38B");

  // Check proposal threshold and voting power
  const proposalThreshold = await governor.proposalThreshold();
  const votingPower = await c12dao.getVotes(deployer.address);

  console.log("Proposal Requirements:");
  console.log("  Threshold:", ethers.utils.formatEther(proposalThreshold), "C12DAO");
  console.log("  Your Voting Power:", ethers.utils.formatEther(votingPower), "C12DAO");

  if (votingPower.lt(proposalThreshold)) {
    console.log("\n❌ Insufficient voting power to create proposal!");
    console.log("   You need at least", ethers.utils.formatEther(proposalThreshold), "C12DAO");
    return;
  }

  console.log("  ✅ Sufficient voting power\n");

  // Create a simple test proposal: Transfer 1 C12DAO from Treasury to Admin
  // This is just a test - it will take 48 hours after passing to execute
  const targets = [TREASURY];
  const values = [0]; // No ETH/MATIC sent
  const calldatas = [
    // Encode: treasury.withdraw(deployer.address, 1 ether)
    new ethers.utils.Interface([
      "function withdraw(address to, uint256 amount)"
    ]).encodeFunctionData("withdraw", [
      deployer.address,
      ethers.utils.parseEther("1") // 1 C12DAO
    ])
  ];
  const description = "Test Proposal #1: Transfer 1 C12DAO from Treasury to Admin";

  console.log("Proposal Details:");
  console.log("  Target:", targets[0]);
  console.log("  Action: Withdraw 1 C12DAO from Treasury");
  console.log("  Description:", description);
  console.log();

  const currentGasPrice = await ethers.provider.getGasPrice();
  const gasPrice = currentGasPrice.mul(200).div(100);

  console.log("⏳ Creating proposal...");

  const tx = await governor.propose(
    targets,
    values,
    calldatas,
    description,
    {
      gasPrice: gasPrice,
      gasLimit: 5000000
    }
  );

  console.log("   TX:", tx.hash);
  console.log("   Waiting for confirmation...");

  const receipt = await tx.wait(3);

  // Get proposal ID from event
  const proposalCreatedEvent = receipt.events.find(e => e.event === 'ProposalCreated');
  const proposalId = proposalCreatedEvent.args.proposalId;

  console.log("\n✅ Proposal Created!");
  console.log("   Proposal ID:", proposalId.toString());
  console.log("   TX:", tx.hash);

  // Get proposal state
  const state = await governor.state(proposalId);
  const stateNames = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

  console.log("\n=====================================");
  console.log("📊 Proposal Details");
  console.log("=====================================");
  console.log("Proposal ID:", proposalId.toString());
  console.log("State:", stateNames[state]);
  console.log("Description:", description);

  const votingDelay = await governor.votingDelay();
  const votingPeriod = await governor.votingPeriod();

  console.log("\nTimeline:");
  console.log("  Voting Delay:", votingDelay.toString(), "blocks (~", votingDelay.toNumber() / 43200, "days)");
  console.log("  Voting Period:", votingPeriod.toString(), "blocks (~", votingPeriod.toNumber() / 43200, "days)");

  console.log("\n✅ Next Steps:");
  console.log("   1. Wait", votingDelay.toNumber() / 43200, "day for voting to start");
  console.log("   2. Vote on the proposal");
  console.log("   3. Wait for voting period to end (", votingPeriod.toNumber() / 43200, "days)");
  console.log("   4. If passed, queue proposal in Timelock");
  console.log("   5. Wait 48 hours (timelock delay)");
  console.log("   6. Execute the proposal");

  console.log("\n📋 Commands:");
  console.log("   Vote: npx hardhat run scripts/dao/vote-on-proposal.js --network polygon");
  console.log("   Check: npx hardhat run scripts/dao/check-proposal.js --network polygon");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
