# C12DAO Phase 1: Smart Contract Development
## Week 1-4 ToDo & Build Document

**Version:** 1.0
**Phase:** 1 of 5
**Duration:** 4 Weeks
**Status:** 🔵 Not Started
**Target Completion:** Week 4

---

## 📋 Overview

This document breaks down Phase 1 (Smart Contract Development) from the DAO_IMPLEMENTATION_PLAN.md into daily/weekly actionable tasks. The goal is to develop, test, and deploy all core DAO smart contracts to testnet with >95% test coverage.

**Phase 1 Objectives:**
- ✅ Develop C12DAO token contract (ERC20Votes)
- ✅ Implement vesting logic for team/advisors
- ✅ Develop Governor contract with timelock
- ✅ Create Treasury contract for revenue management
- ✅ Develop Staking contract with 5-tier system
- ✅ Achieve >95% test coverage
- ✅ Deploy to BSC Testnet and Mumbai (Polygon Testnet)
- ✅ Complete comprehensive documentation

**Reference Documents:**
- `DAO_IMPLEMENTATION_PLAN.md` - Overall architecture and specifications
- `TODO_AND_BUILD_PLAN.md` - Project context
- `C12USD_TECHNICAL_WHITEPAPER.md` - Technical requirements
- `ROBOTIC_BANKING_SPECIFICATION.md` - Integration requirements

---

## 🗓️ Week 1: C12DAO Token Contract & Foundation Setup

### **Day 1: Environment Setup & Project Initialization**

**Tasks:**
- [ ] Create `contracts/dao/` directory structure
- [ ] Initialize Hardhat project with TypeScript
- [ ] Install dependencies:
  ```bash
  npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
  npm install @openzeppelin/contracts@5.0.0
  npm install @layerzerolabs/lz-evm-sdk-v2
  ```
- [ ] Configure `hardhat.config.ts` with BSC Testnet and Mumbai networks
- [ ] Setup `.env` file with:
  - `PRIVATE_KEY` (testnet deployer key)
  - `BSC_TESTNET_RPC`
  - `POLYGON_MUMBAI_RPC`
  - `BSCSCAN_API_KEY`
  - `POLYGONSCAN_API_KEY`
- [ ] Create initial folder structure:
  ```
  contracts/dao/
  ├── C12DAO.sol
  ├── C12DAOGovernor.sol
  ├── C12DAOTimelock.sol
  ├── C12DAOTreasury.sol
  └── C12DAOStaking.sol

  test/dao/
  ├── C12DAO.test.ts
  ├── C12DAOGovernor.test.ts
  ├── C12DAOTimelock.test.ts
  ├── C12DAOTreasury.test.ts
  └── C12DAOStaking.test.ts

  scripts/dao/
  ├── deploy-token.ts
  ├── deploy-governance.ts
  ├── deploy-treasury.ts
  ├── deploy-staking.ts
  └── verify-contracts.ts
  ```

**Deliverables:**
- ✅ Hardhat project initialized
- ✅ All dependencies installed
- ✅ Network configuration complete
- ✅ Folder structure created

**Testing Checkpoint:** Run `npx hardhat compile` successfully

---

### **Day 2: C12DAO Token - Core Implementation**

**Tasks:**
- [ ] Create `contracts/dao/C12DAO.sol`
- [ ] Implement ERC20Votes extension for governance
- [ ] Implement ERC20Permit for gasless approvals
- [ ] Add AccessControl for role-based permissions
- [ ] Add Pausable functionality for emergency stops
- [ ] Define constants:
  ```solidity
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
  ```
- [ ] Implement constructor with admin parameter
- [ ] Add initial token distribution logic:
  - Team: 200M (20%) - vesting required
  - Community Airdrop: 150M (15%) - immediate
  - Liquidity Mining: 250M (25%) - distribution contract
  - Treasury Reserve: 200M (20%) - treasury multisig
  - Public Sale: 100M (10%) - immediate
  - Advisors: 50M (5%) - vesting required
  - Ecosystem Fund: 50M (5%) - multisig

**Code Template:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract C12DAO is ERC20Votes, ERC20Permit, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    constructor(address admin)
        ERC20("C12AI DAO", "C12DAO")
        ERC20Permit("C12AI DAO")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    // TODO: Add vesting logic
    // TODO: Add minting function with MAX_SUPPLY check
    // TODO: Add pause/unpause functions
    // TODO: Override required functions
}
```

**Deliverables:**
- ✅ C12DAO.sol with core ERC20Votes implementation
- ✅ Role-based access control configured
- ✅ Pausable mechanism implemented

**Testing Checkpoint:** Contract compiles without errors

---

### **Day 3: C12DAO Token - Vesting Implementation**

**Tasks:**
- [ ] Add VestingSchedule struct to C12DAO.sol:
  ```solidity
  struct VestingSchedule {
      uint256 totalAmount;
      uint256 releasedAmount;
      uint256 startTime;
      uint256 cliffDuration;
      uint256 vestingDuration;
  }
  ```
- [ ] Add mapping: `mapping(address => VestingSchedule) public vestingSchedules;`
- [ ] Implement `createVestingSchedule()` function with MINTER_ROLE
- [ ] Implement `releaseVestedTokens()` function for beneficiaries
- [ ] Implement `calculateVestedAmount()` view function
- [ ] Add vesting-related events:
  ```solidity
  event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 startTime);
  event TokensVested(address indexed beneficiary, uint256 amount);
  ```
- [ ] Add vesting schedules for:
  - **Team Vesting:** 4 years total, 1 year cliff
  - **Advisors Vesting:** 2 years total, 6 months cliff

**Vesting Formula:**
```solidity
function calculateVestedAmount(address beneficiary) public view returns (uint256) {
    VestingSchedule memory schedule = vestingSchedules[beneficiary];

    if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
        return 0; // Still in cliff period
    }

    if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
        return schedule.totalAmount; // Fully vested
    }

    uint256 timeVested = block.timestamp - schedule.startTime;
    uint256 vestedAmount = (schedule.totalAmount * timeVested) / schedule.vestingDuration;

    return vestedAmount - schedule.releasedAmount;
}
```

**Deliverables:**
- ✅ Vesting logic fully implemented
- ✅ Team and advisor schedules configured
- ✅ Vesting calculation tested manually

**Testing Checkpoint:** Manual calculation verification with different timestamps

---

### **Day 4: C12DAO Token - Complete & Override Functions**

**Tasks:**
- [ ] Override required ERC20Votes functions:
  ```solidity
  function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
      super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
      super._mint(to, amount);
  }

  function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
      super._burn(account, amount);
  }
  ```
- [ ] Implement `pause()` and `unpause()` functions with PAUSER_ROLE
- [ ] Implement `mint()` function with MAX_SUPPLY validation
- [ ] Add `_beforeTokenTransfer()` override to respect pause state
- [ ] Implement `clock()` and `CLOCK_MODE()` for governance compatibility
- [ ] Add comprehensive NatSpec documentation to all functions
- [ ] Run Slither static analysis:
  ```bash
  pip install slither-analyzer
  slither contracts/dao/C12DAO.sol
  ```
- [ ] Address any findings from Slither

**Deliverables:**
- ✅ All ERC20Votes overrides implemented
- ✅ Pause functionality working
- ✅ Slither analysis clean
- ✅ Complete NatSpec documentation

**Testing Checkpoint:** `npx hardhat compile` and `slither` run successfully

---

### **Day 5: C12DAO Token - Comprehensive Testing**

**Tasks:**
- [ ] Create `test/dao/C12DAO.test.ts`
- [ ] Setup test fixtures with ethers.js and Hardhat
- [ ] Write unit tests for:
  - **Deployment:**
    - ✅ Correct name, symbol, decimals
    - ✅ Initial supply = 0
    - ✅ Admin roles assigned correctly
  - **Minting:**
    - ✅ Only MINTER_ROLE can mint
    - ✅ Cannot exceed MAX_SUPPLY
    - ✅ Minting updates total supply
  - **Vesting:**
    - ✅ Create vesting schedule (only MINTER_ROLE)
    - ✅ Cannot release before cliff
    - ✅ Linear vesting after cliff
    - ✅ Fully vested after duration
    - ✅ Cannot double-claim vested tokens
  - **Voting:**
    - ✅ Delegation works correctly
    - ✅ Vote checkpoints created
    - ✅ Historical balance queries work
    - ✅ getPastVotes() returns correct values
  - **Permit (ERC20Permit):**
    - ✅ Gasless approval with valid signature
    - ✅ Rejects invalid signatures
    - ✅ Nonce increments correctly
  - **Pausable:**
    - ✅ Only PAUSER_ROLE can pause
    - ✅ Transfers blocked when paused
    - ✅ Can unpause and resume transfers
  - **Access Control:**
    - ✅ Only admin can grant roles
    - ✅ Role revocation works
    - ✅ Non-admin cannot grant roles

**Testing Framework:**
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { C12DAO } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("C12DAO Token", function () {
  let c12dao: C12DAO;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    const C12DAOFactory = await ethers.getContractFactory("C12DAO");
    c12dao = await C12DAOFactory.deploy(admin.address);
  });

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      expect(await c12dao.name()).to.equal("C12AI DAO");
      expect(await c12dao.symbol()).to.equal("C12DAO");
    });
    // ... more tests
  });
});
```

**Deliverables:**
- ✅ Comprehensive test suite (50+ test cases)
- ✅ All tests passing
- ✅ Test coverage >95% for C12DAO.sol

**Testing Checkpoint:** Run `npx hardhat test test/dao/C12DAO.test.ts` with all tests passing

---

## 🗓️ Week 2: Governor & Timelock Contracts

### **Day 6: C12DAOGovernor - Core Implementation**

**Tasks:**
- [ ] Create `contracts/dao/C12DAOGovernor.sol`
- [ ] Import OpenZeppelin Governor modules:
  ```solidity
  import "@openzeppelin/contracts/governance/Governor.sol";
  import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
  import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
  import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
  import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
  import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
  ```
- [ ] Define governance parameters:
  ```solidity
  uint256 public constant VOTING_DELAY = 1 days;      // Delay before voting starts
  uint256 public constant VOTING_PERIOD = 7 days;     // Voting duration
  uint256 public constant PROPOSAL_THRESHOLD = 100_000e18; // Min tokens to propose
  uint256 public constant QUORUM_PERCENTAGE = 4;       // 4% quorum
  ```
- [ ] Implement constructor:
  ```solidity
  constructor(IVotes _token, TimelockController _timelock)
      Governor("C12AI DAO Governor")
      GovernorSettings(VOTING_DELAY, VOTING_PERIOD, PROPOSAL_THRESHOLD)
      GovernorVotes(_token)
      GovernorVotesQuorumFraction(QUORUM_PERCENTAGE)
      GovernorTimelockControl(_timelock)
  {}
  ```
- [ ] Override required functions for module compatibility

**Deliverables:**
- ✅ C12DAOGovernor.sol with all extensions
- ✅ Governance parameters configured
- ✅ Contract compiles successfully

**Testing Checkpoint:** Compile without errors

---

### **Day 7: C12DAOTimelock - Implementation**

**Tasks:**
- [ ] Create `contracts/dao/C12DAOTimelock.sol`
- [ ] Extend OpenZeppelin TimelockController:
  ```solidity
  import "@openzeppelin/contracts/governance/TimelockController.sol";

  contract C12DAOTimelock is TimelockController {
      constructor(
          uint256 minDelay,
          address[] memory proposers,
          address[] memory executors,
          address admin
      ) TimelockController(minDelay, proposers, executors, admin) {}
  }
  ```
- [ ] Set minimum delay to 48 hours (172800 seconds)
- [ ] Configure roles:
  - **PROPOSER_ROLE:** Governor contract only
  - **EXECUTOR_ROLE:** Anyone (address(0)) for decentralized execution
  - **ADMIN_ROLE:** Multi-sig wallet (initially deployer, then transfer)
- [ ] Add custom events for monitoring:
  ```solidity
  event EmergencyExecuted(bytes32 indexed id);
  event DelayUpdated(uint256 oldDelay, uint256 newDelay);
  ```

**Deliverables:**
- ✅ C12DAOTimelock.sol implemented
- ✅ 48-hour delay configured
- ✅ Role structure defined

**Testing Checkpoint:** Compile and deploy to local Hardhat network

---

### **Day 8: Governor & Timelock Integration**

**Tasks:**
- [ ] Update C12DAOGovernor.sol to override required functions:
  ```solidity
  function votingDelay() public pure override(Governor, GovernorSettings) returns (uint256) {
      return super.votingDelay();
  }

  function votingPeriod() public pure override(Governor, GovernorSettings) returns (uint256) {
      return super.votingPeriod();
  }

  function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
      return super.quorum(blockNumber);
  }

  function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
      return super.state(proposalId);
  }

  function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
      return super.proposalNeedsQueuing(proposalId);
  }

  function _queueOperations(...) internal override(Governor, GovernorTimelockControl) returns (uint48) {
      return super._queueOperations(...);
  }

  function _executeOperations(...) internal override(Governor, GovernorTimelockControl) {
      super._executeOperations(...);
  }

  function _cancel(...) internal override(Governor, GovernorTimelockControl) returns (uint256) {
      return super._cancel(...);
  }

  function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
      return super._executor();
  }
  ```
- [ ] Test integration locally with deployment script
- [ ] Create `scripts/dao/deploy-governance.ts` for deployment
- [ ] Add comprehensive comments and NatSpec

**Deliverables:**
- ✅ All Governor overrides implemented
- ✅ Integration with Timelock working
- ✅ Local deployment script tested

**Testing Checkpoint:** Deploy to local Hardhat network and test proposal flow manually

---

### **Day 9: Governor Testing - Part 1**

**Tasks:**
- [ ] Create `test/dao/C12DAOGovernor.test.ts`
- [ ] Setup test fixtures with C12DAO token, Timelock, and Governor
- [ ] Write unit tests for:
  - **Deployment:**
    - ✅ Correct name
    - ✅ Correct voting delay, period, threshold, quorum
    - ✅ Token address set correctly
    - ✅ Timelock address set correctly
  - **Proposal Creation:**
    - ✅ User with tokens >= threshold can propose
    - ✅ User below threshold cannot propose
    - ✅ Proposal ID generated correctly
    - ✅ Proposal starts in Pending state
  - **Voting Delay:**
    - ✅ Cannot vote immediately after proposal
    - ✅ Can vote after delay period
    - ✅ Voting period starts after delay

**Test Template:**
```typescript
describe("C12DAOGovernor", function () {
  let c12dao: C12DAO;
  let timelock: C12DAOTimelock;
  let governor: C12DAOGovernor;
  let admin: SignerWithAddress;
  let proposer: SignerWithAddress;
  let voter1: SignerWithAddress;

  beforeEach(async function () {
    [admin, proposer, voter1] = await ethers.getSigners();

    // Deploy token
    const C12DAOFactory = await ethers.getContractFactory("C12DAO");
    c12dao = await C12DAOFactory.deploy(admin.address);

    // Deploy timelock
    const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
    timelock = await TimelockFactory.deploy(
      172800, // 48 hours
      [], // proposers (will be governor)
      [ethers.ZeroAddress], // executors (anyone)
      admin.address
    );

    // Deploy governor
    const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
    governor = await GovernorFactory.deploy(c12dao.target, timelock.target);

    // Setup: Mint tokens and delegate
    await c12dao.mint(proposer.address, ethers.parseEther("100000"));
    await c12dao.connect(proposer).delegate(proposer.address);
  });

  // ... tests
});
```

**Deliverables:**
- ✅ Governor test suite created
- ✅ 20+ test cases for proposal and voting delay
- ✅ All tests passing

**Testing Checkpoint:** Run tests with passing results

---

### **Day 10: Governor Testing - Part 2**

**Tasks:**
- [ ] Continue `test/dao/C12DAOGovernor.test.ts`
- [ ] Write unit tests for:
  - **Voting:**
    - ✅ Can cast For, Against, Abstain votes
    - ✅ Voting power based on delegated balance at proposal snapshot
    - ✅ Cannot vote twice
    - ✅ Cannot vote after voting period ends
    - ✅ Vote counting works correctly
  - **Quorum:**
    - ✅ Proposal fails if quorum not met
    - ✅ Proposal succeeds if quorum met and For > Against
    - ✅ Quorum calculated as 4% of total supply
  - **Proposal States:**
    - ✅ Pending → Active → Succeeded/Defeated
    - ✅ Succeeded → Queued (in timelock)
    - ✅ Queued → Executed (after delay)
    - ✅ Can cancel proposal before execution
  - **Timelock Integration:**
    - ✅ Successful proposal queued in timelock
    - ✅ Cannot execute before timelock delay
    - ✅ Can execute after timelock delay
    - ✅ Execution calls target contract correctly

**Advanced Test Scenarios:**
```typescript
it("Should execute proposal after timelock delay", async function () {
  // Create proposal
  const targets = [await c12dao.getAddress()];
  const values = [0];
  const calldatas = [c12dao.interface.encodeFunctionData("pause")];
  const description = "Pause the DAO token";

  await governor.connect(proposer).propose(targets, values, calldatas, description);
  const proposalId = await governor.hashProposal(targets, values, calldatas, ethers.id(description));

  // Fast forward past voting delay
  await time.increase(86400 + 1); // 1 day + 1 second

  // Vote
  await governor.connect(proposer).castVote(proposalId, 1); // Vote For

  // Fast forward past voting period
  await time.increase(604800 + 1); // 7 days + 1 second

  // Queue
  await governor.queue(targets, values, calldatas, ethers.id(description));

  // Fast forward past timelock delay
  await time.increase(172800 + 1); // 48 hours + 1 second

  // Execute
  await governor.execute(targets, values, calldatas, ethers.id(description));

  // Verify
  expect(await c12dao.paused()).to.be.true;
});
```

**Deliverables:**
- ✅ Complete Governor test suite (50+ tests)
- ✅ All edge cases covered
- ✅ Test coverage >95%

**Testing Checkpoint:** Full test suite passing

---

## 🗓️ Week 3: Treasury & Staking Contracts

### **Day 11: C12DAOTreasury - Core Implementation**

**Tasks:**
- [ ] Create `contracts/dao/C12DAOTreasury.sol`
- [ ] Implement AccessControl for role-based withdrawals
- [ ] Add state variables:
  ```solidity
  bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
  bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");

  address public c12usdToken;
  address public c12daoToken;

  uint256 public totalRevenueReceived;
  uint256 public totalDistributed;

  mapping(address => uint256) public revenueBySource;
  mapping(uint256 => Budget) public budgets;

  struct Budget {
      string category;
      uint256 allocated;
      uint256 spent;
      uint256 startTime;
      uint256 endTime;
      bool active;
  }
  ```
- [ ] Implement revenue tracking:
  ```solidity
  function receiveRevenue(address source, uint256 amount) external {
      require(msg.sender == c12usdToken, "Only C12USD");
      totalRevenueReceived += amount;
      revenueBySource[source] += amount;
      emit RevenueReceived(source, amount);
  }
  ```
- [ ] Implement budget management:
  ```solidity
  function createBudget(string memory category, uint256 amount, uint256 duration) external onlyRole(TREASURER_ROLE) {
      // Create quarterly/annual budgets
  }

  function withdraw(uint256 budgetId, address to, uint256 amount) external onlyRole(FINANCE_ROLE) {
      // Withdraw against approved budget
  }
  ```

**Deliverables:**
- ✅ C12DAOTreasury.sol core implementation
- ✅ Revenue tracking functional
- ✅ Budget system implemented

**Testing Checkpoint:** Compile successfully

---

### **Day 12: C12DAOTreasury - Advanced Features**

**Tasks:**
- [ ] Add multi-signature withdrawal for large amounts:
  ```solidity
  uint256 public constant MULTI_SIG_THRESHOLD = 100_000e18; // $100K
  mapping(bytes32 => MultiSigRequest) public withdrawalRequests;

  struct MultiSigRequest {
      address to;
      uint256 amount;
      uint256 approvals;
      mapping(address => bool) approved;
      bool executed;
  }

  function requestWithdrawal(address to, uint256 amount) external onlyRole(TREASURER_ROLE) {
      if (amount >= MULTI_SIG_THRESHOLD) {
          // Require multi-sig
      } else {
          // Direct withdrawal
      }
  }
  ```
- [ ] Add emergency withdrawal function (Governor-only):
  ```solidity
  function emergencyWithdraw(address token, address to, uint256 amount) external {
      require(msg.sender == address(governor), "Only Governor");
      // Emergency withdrawal bypasses budget
  }
  ```
- [ ] Add revenue distribution to stakers:
  ```solidity
  function distributeToStakers(uint256 amount) external onlyRole(TREASURER_ROLE) {
      require(amount <= address(this).balance, "Insufficient balance");
      IERC20(c12usdToken).transfer(stakingContract, amount);
      totalDistributed += amount;
      emit RevenueDistributed("Staking", amount);
  }
  ```
- [ ] Add events for all treasury operations
- [ ] Add view functions for analytics (revenue by month, budget utilization, etc.)

**Deliverables:**
- ✅ Multi-sig withdrawal system
- ✅ Emergency functions
- ✅ Revenue distribution to stakers
- ✅ Complete analytics functions

**Testing Checkpoint:** Manual testing on local network

---

### **Day 13: C12DAOStaking - Core Implementation**

**Tasks:**
- [ ] Create `contracts/dao/C12DAOStaking.sol`
- [ ] Define staking tiers:
  ```solidity
  struct StakingTier {
      string name;
      uint256 lockDuration;     // Lock period in seconds
      uint256 rewardMultiplier; // 100 = 1x, 300 = 3x
      uint256 votingMultiplier; // Voting power boost
      uint256 baseAPY;          // Base APY in basis points (1000 = 10%)
  }

  mapping(uint256 => StakingTier) public tiers;

  // Tier 0: Flexible - No lock, 1x rewards, 1x voting, 10% APY
  // Tier 1: Bronze - 30 days, 1.2x rewards, 1.25x voting, 12% APY
  // Tier 2: Silver - 90 days, 1.5x rewards, 1.5x voting, 15% APY
  // Tier 3: Gold - 180 days, 2x rewards, 2x voting, 20% APY
  // Tier 4: Platinum - 365 days, 3x rewards, 3x voting, 30% APY
  ```
- [ ] Implement staking positions:
  ```solidity
  struct StakingPosition {
      uint256 amount;
      uint256 tier;
      uint256 startTime;
      uint256 unlockTime;
      uint256 rewardsClaimed;
      bool active;
  }

  mapping(address => StakingPosition[]) public userPositions;
  ```
- [ ] Implement core staking functions:
  ```solidity
  function stake(uint256 amount, uint256 tier) external {
      require(tier < 5, "Invalid tier");
      require(amount > 0, "Amount must be > 0");

      IERC20(c12daoToken).transferFrom(msg.sender, address(this), amount);

      StakingTier memory selectedTier = tiers[tier];

      userPositions[msg.sender].push(StakingPosition({
          amount: amount,
          tier: tier,
          startTime: block.timestamp,
          unlockTime: block.timestamp + selectedTier.lockDuration,
          rewardsClaimed: 0,
          active: true
      }));

      emit Staked(msg.sender, amount, tier);
  }
  ```

**Deliverables:**
- ✅ C12DAOStaking.sol with tier system
- ✅ Staking positions implemented
- ✅ Basic stake function working

**Testing Checkpoint:** Compile and deploy to local network

---

### **Day 14: C12DAOStaking - Rewards & Unstaking**

**Tasks:**
- [ ] Implement rewards calculation:
  ```solidity
  function calculateRewards(address user, uint256 positionIndex) public view returns (uint256) {
      StakingPosition memory position = userPositions[user][positionIndex];
      if (!position.active) return 0;

      StakingTier memory tier = tiers[position.tier];

      uint256 timeStaked = block.timestamp - position.startTime;
      uint256 baseReward = (position.amount * tier.baseAPY * timeStaked) / (365 days * 10000);
      uint256 multipliedReward = (baseReward * tier.rewardMultiplier) / 100;

      return multipliedReward - position.rewardsClaimed;
  }
  ```
- [ ] Implement claim rewards:
  ```solidity
  function claimRewards(uint256 positionIndex) external {
      uint256 rewards = calculateRewards(msg.sender, positionIndex);
      require(rewards > 0, "No rewards to claim");

      userPositions[msg.sender][positionIndex].rewardsClaimed += rewards;

      // Transfer rewards from treasury
      IERC20(c12daoToken).transferFrom(treasury, msg.sender, rewards);

      emit RewardsClaimed(msg.sender, positionIndex, rewards);
  }
  ```
- [ ] Implement unstake:
  ```solidity
  function unstake(uint256 positionIndex) external {
      StakingPosition storage position = userPositions[msg.sender][positionIndex];
      require(position.active, "Position not active");
      require(block.timestamp >= position.unlockTime, "Still locked");

      // Auto-claim remaining rewards
      uint256 rewards = calculateRewards(msg.sender, positionIndex);
      if (rewards > 0) {
          claimRewards(positionIndex);
      }

      uint256 amount = position.amount;
      position.active = false;

      IERC20(c12daoToken).transfer(msg.sender, amount);

      emit Unstaked(msg.sender, positionIndex, amount);
  }
  ```
- [ ] Add early unstake with penalty:
  ```solidity
  function emergencyUnstake(uint256 positionIndex) external {
      StakingPosition storage position = userPositions[msg.sender][positionIndex];
      require(position.active, "Position not active");

      uint256 penalty = (position.amount * 10) / 100; // 10% penalty
      uint256 amountAfterPenalty = position.amount - penalty;

      position.active = false;

      IERC20(c12daoToken).transfer(msg.sender, amountAfterPenalty);
      IERC20(c12daoToken).transfer(treasury, penalty); // Penalty to treasury

      emit EmergencyUnstaked(msg.sender, positionIndex, amountAfterPenalty, penalty);
  }
  ```

**Deliverables:**
- ✅ Rewards calculation implemented
- ✅ Claim and unstake functions complete
- ✅ Emergency unstake with penalty

**Testing Checkpoint:** Local testing of full staking lifecycle

---

### **Day 15: Treasury & Staking Testing**

**Tasks:**
- [ ] Create `test/dao/C12DAOTreasury.test.ts`
- [ ] Write unit tests for Treasury:
  - ✅ Revenue receiving and tracking
  - ✅ Budget creation and management
  - ✅ Withdrawals with role checks
  - ✅ Multi-sig for large withdrawals
  - ✅ Emergency withdrawal (Governor-only)
  - ✅ Distribution to stakers
- [ ] Create `test/dao/C12DAOStaking.test.ts`
- [ ] Write unit tests for Staking:
  - ✅ Staking in each tier
  - ✅ Rewards calculation accuracy
  - ✅ Claim rewards functionality
  - ✅ Unstake after lock period
  - ✅ Cannot unstake before lock
  - ✅ Emergency unstake with penalty
  - ✅ Multiple positions per user
  - ✅ Tier multipliers work correctly

**Test Coverage Goals:**
- Treasury: >95% coverage
- Staking: >95% coverage

**Deliverables:**
- ✅ Complete Treasury test suite
- ✅ Complete Staking test suite
- ✅ All tests passing
- ✅ Coverage >95%

**Testing Checkpoint:** `npx hardhat coverage` shows >95%

---

## 🗓️ Week 4: Integration Testing, Documentation & Testnet Deployment

### **Day 16: Integration Testing - Part 1**

**Tasks:**
- [ ] Create `test/dao/Integration.test.ts`
- [ ] Write integration tests for full DAO lifecycle:
  - **Setup:**
    - ✅ Deploy all contracts (Token, Governor, Timelock, Treasury, Staking)
    - ✅ Configure roles and permissions
    - ✅ Distribute initial tokens
  - **Governance Flow:**
    - ✅ User stakes tokens
    - ✅ User delegates voting power
    - ✅ User creates proposal
    - ✅ Community votes
    - ✅ Proposal succeeds and queues
    - ✅ Timelock delay passes
    - ✅ Proposal executes
  - **Treasury Management:**
    - ✅ Revenue flows to treasury
    - ✅ Budget created via governance
    - ✅ Withdrawal executed by FINANCE_ROLE
    - ✅ Distribution to stakers
  - **Staking Lifecycle:**
    - ✅ User stakes in multiple tiers
    - ✅ Rewards accumulate over time
    - ✅ User claims rewards
    - ✅ User unstakes after lock period

**Test Scenario Example:**
```typescript
it("Full DAO governance lifecycle", async function () {
  // 1. Setup: Distribute tokens
  await c12dao.mint(user1.address, ethers.parseEther("200000"));
  await c12dao.connect(user1).delegate(user1.address);

  // 2. Create proposal to set treasury budget
  const targets = [treasury.target];
  const values = [0];
  const calldatas = [treasury.interface.encodeFunctionData("createBudget", ["Development", ethers.parseEther("50000"), 7776000])];
  const description = "Q1 2025 Development Budget";

  await governor.connect(user1).propose(targets, values, calldatas, description);
  const proposalId = await governor.hashProposal(targets, values, calldatas, ethers.id(description));

  // 3. Voting delay + vote
  await time.increase(86401);
  await governor.connect(user1).castVote(proposalId, 1);

  // 4. Voting period + queue
  await time.increase(604801);
  await governor.queue(targets, values, calldatas, ethers.id(description));

  // 5. Timelock delay + execute
  await time.increase(172801);
  await governor.execute(targets, values, calldatas, ethers.id(description));

  // 6. Verify budget created
  const budget = await treasury.budgets(0);
  expect(budget.category).to.equal("Development");
  expect(budget.allocated).to.equal(ethers.parseEther("50000"));
});
```

**Deliverables:**
- ✅ Integration test suite created
- ✅ 10+ end-to-end test scenarios
- ✅ All tests passing

**Testing Checkpoint:** Full integration tests passing

---

### **Day 17: Integration Testing - Part 2 & Security Testing**

**Tasks:**
- [ ] Continue integration testing with edge cases:
  - ✅ Proposal fails due to low quorum
  - ✅ Proposal defeated by majority Against votes
  - ✅ Proposal canceled before execution
  - ✅ Multiple simultaneous proposals
  - ✅ Emergency pause via governance
  - ✅ Role changes via governance
- [ ] Run security analysis tools:
  ```bash
  # Slither
  slither contracts/dao/ --print human-summary

  # Mythril (if installed)
  myth analyze contracts/dao/C12DAO.sol

  # Hardhat gas reporter
  REPORT_GAS=true npx hardhat test
  ```
- [ ] Document all security findings
- [ ] Fix any critical/high severity issues
- [ ] Re-run tests after fixes
- [ ] Generate final test coverage report:
  ```bash
  npx hardhat coverage
  ```

**Security Checklist:**
- ✅ No reentrancy vulnerabilities
- ✅ No integer overflow/underflow
- ✅ Access control properly enforced
- ✅ No unprotected self-destruct
- ✅ No delegate call to untrusted contracts
- ✅ Events emitted for all critical actions
- ✅ Gas optimizations applied

**Deliverables:**
- ✅ Edge case integration tests passing
- ✅ Security analysis complete
- ✅ All findings addressed
- ✅ Final coverage >95%

**Testing Checkpoint:** All security tools report clean

---

### **Day 18: Documentation - Smart Contracts**

**Tasks:**
- [ ] Complete NatSpec documentation for all contracts:
  - **C12DAO.sol:** Every function, event, struct
  - **C12DAOGovernor.sol:** Governance flow explanation
  - **C12DAOTimelock.sol:** Delay mechanism details
  - **C12DAOTreasury.sol:** Budget and revenue tracking
  - **C12DAOStaking.sol:** Tier system and rewards
- [ ] Create `docs/dao/CONTRACTS.md` with:
  - Architecture overview
  - Contract addresses (testnet)
  - Function reference
  - Integration guide
  - Security considerations
- [ ] Create `docs/dao/DEPLOYMENT.md` with:
  - Deployment order
  - Configuration steps
  - Role assignments
  - Post-deployment checklist
- [ ] Generate Solidity documentation:
  ```bash
  npm install --save-dev solidity-docgen
  npx hardhat docgen
  ```

**Documentation Template (CONTRACTS.md):**
```markdown
# C12DAO Smart Contracts Documentation

## Architecture

[Diagram showing contract relationships]

## Contract Addresses

### BSC Testnet
- C12DAO Token: 0x...
- C12DAOGovernor: 0x...
- C12DAOTimelock: 0x...
- C12DAOTreasury: 0x...
- C12DAOStaking: 0x...

### Mumbai (Polygon Testnet)
- [Same structure]

## Core Contracts

### C12DAO Token
**Purpose:** ERC20Votes governance token with vesting

**Key Functions:**
- `mint(address to, uint256 amount)` - Mint tokens (MINTER_ROLE)
- `createVestingSchedule(...)` - Create vesting for team/advisors
- `releaseVestedTokens()` - Claim vested tokens
- `delegate(address delegatee)` - Delegate voting power

[... detailed documentation]
```

**Deliverables:**
- ✅ Complete NatSpec in all contracts
- ✅ CONTRACTS.md created
- ✅ DEPLOYMENT.md created
- ✅ Auto-generated docs

**Testing Checkpoint:** Documentation reviewed and accurate

---

### **Day 19: Deployment Scripts & Testnet Deployment**

**Tasks:**
- [ ] Create comprehensive deployment scripts:
  - **`scripts/dao/deploy-token.ts`** - Deploy C12DAO token
  - **`scripts/dao/deploy-timelock.ts`** - Deploy Timelock
  - **`scripts/dao/deploy-governor.ts`** - Deploy Governor
  - **`scripts/dao/deploy-treasury.ts`** - Deploy Treasury
  - **`scripts/dao/deploy-staking.ts`** - Deploy Staking
  - **`scripts/dao/deploy-all.ts`** - Deploy entire DAO system
  - **`scripts/dao/configure-roles.ts`** - Configure all roles
  - **`scripts/dao/verify-all.ts`** - Verify on block explorers
- [ ] Deploy to **BSC Testnet:**
  ```bash
  npx hardhat run scripts/dao/deploy-all.ts --network bscTestnet
  ```
- [ ] Configure roles on BSC Testnet
- [ ] Verify contracts on BscScan:
  ```bash
  npx hardhat verify --network bscTestnet <ADDRESS> <CONSTRUCTOR_ARGS>
  ```
- [ ] Deploy to **Mumbai (Polygon Testnet):**
  ```bash
  npx hardhat run scripts/dao/deploy-all.ts --network mumbai
  ```
- [ ] Configure roles on Mumbai
- [ ] Verify contracts on PolygonScan
- [ ] Update `docs/dao/CONTRACTS.md` with deployed addresses

**Deployment Script Template:**
```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying C12DAO Token...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const C12DAOFactory = await ethers.getContractFactory("C12DAO");
  const c12dao = await C12DAOFactory.deploy(deployer.address);
  await c12dao.waitForDeployment();

  console.log("C12DAO deployed to:", await c12dao.getAddress());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: "C12DAO",
    address: await c12dao.getAddress(),
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  // Save to file for verification
  fs.writeFileSync(
    `deployments/${hre.network.name}/C12DAO.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Deliverables:**
- ✅ All deployment scripts created
- ✅ Deployed to BSC Testnet
- ✅ Deployed to Mumbai
- ✅ All contracts verified
- ✅ Addresses documented

**Testing Checkpoint:** All contracts deployed and verified on both testnets

---

### **Day 20: Final Testing, Documentation & Phase 1 Completion**

**Tasks:**
- [ ] Perform final testnet testing:
  - ✅ Mint test tokens to multiple addresses
  - ✅ Test delegation on testnet
  - ✅ Create test proposal via web interface
  - ✅ Vote on testnet proposal
  - ✅ Queue and execute proposal
  - ✅ Test treasury revenue receiving
  - ✅ Test staking in all tiers
  - ✅ Claim rewards on testnet
  - ✅ Verify all events emitted correctly
- [ ] Create final documentation:
  - **`docs/dao/TESTNET_GUIDE.md`** - How to interact with testnet deployment
  - **`docs/dao/API_REFERENCE.md`** - Complete function reference
  - **`docs/dao/SECURITY.md`** - Security considerations and audit prep
- [ ] Update `DAO_IMPLEMENTATION_PLAN.md` with Phase 1 completion:
  ```markdown
  ### Phase 1: Smart Contract Development ✅ COMPLETE

  **Completion Date:** [Date]
  **Deployments:**
  - BSC Testnet: [Addresses]
  - Mumbai: [Addresses]

  **Achievements:**
  - ✅ All 5 contracts deployed
  - ✅ Test coverage: 96.8%
  - ✅ Security analysis clean
  - ✅ Comprehensive documentation
  ```
- [ ] Create `DAO_PHASE2_TODO.md` outline for Security Audits phase
- [ ] Generate final test coverage report and commit
- [ ] Tag repository: `git tag v1.0.0-dao-phase1-complete`
- [ ] Create GitHub release with deployment artifacts

**Final Deliverables Checklist:**
- ✅ All 5 smart contracts deployed to 2 testnets (10 deployments total)
- ✅ All contracts verified on block explorers
- ✅ Test coverage >95% for all contracts
- ✅ Security analysis clean (Slither, Mythril)
- ✅ Complete NatSpec documentation
- ✅ User guides and API reference
- ✅ Deployment scripts and configuration
- ✅ Integration tests passing
- ✅ Phase 1 marked complete in main plan

**Testing Checkpoint:** All acceptance criteria met, Phase 1 complete

---

## 📊 Progress Tracking

### Overall Phase 1 Progress: 0/20 Days Complete

**Week 1: Token Development** (0/5 days)
- [ ] Day 1: Environment Setup
- [ ] Day 2: Token Core Implementation
- [ ] Day 3: Vesting Implementation
- [ ] Day 4: Complete & Override Functions
- [ ] Day 5: Comprehensive Testing

**Week 2: Governance Development** (0/5 days)
- [ ] Day 6: Governor Core Implementation
- [ ] Day 7: Timelock Implementation
- [ ] Day 8: Governor & Timelock Integration
- [ ] Day 9: Governor Testing Part 1
- [ ] Day 10: Governor Testing Part 2

**Week 3: Treasury & Staking Development** (0/5 days)
- [ ] Day 11: Treasury Core Implementation
- [ ] Day 12: Treasury Advanced Features
- [ ] Day 13: Staking Core Implementation
- [ ] Day 14: Staking Rewards & Unstaking
- [ ] Day 15: Treasury & Staking Testing

**Week 4: Integration & Deployment** (0/5 days)
- [ ] Day 16: Integration Testing Part 1
- [ ] Day 17: Integration Testing Part 2 & Security
- [ ] Day 18: Documentation
- [ ] Day 19: Testnet Deployment
- [ ] Day 20: Final Testing & Completion

---

## 🎯 Success Criteria

**Phase 1 is complete when:**
- ✅ All 5 contracts (Token, Governor, Timelock, Treasury, Staking) are deployed to BSC Testnet and Mumbai
- ✅ All contracts are verified on BscScan and PolygonScan
- ✅ Test coverage exceeds 95% for all contracts
- ✅ No critical or high severity security findings
- ✅ Complete documentation published
- ✅ End-to-end governance flow tested on testnet
- ✅ Ready for Phase 2 (Security Audits)

---

## 📚 Reference Materials

**OpenZeppelin Resources:**
- [Governor Documentation](https://docs.openzeppelin.com/contracts/5.x/governance)
- [ERC20Votes](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#ERC20Votes)
- [TimelockController](https://docs.openzeppelin.com/contracts/5.x/api/governance#TimelockController)
- [AccessControl](https://docs.openzeppelin.com/contracts/5.x/api/access#AccessControl)

**Best Practices:**
- [Compound Governance](https://compound.finance/docs/governance)
- [Uniswap Governance](https://docs.uniswap.org/protocol/concepts/governance/overview)
- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)

**Testing Resources:**
- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Hardhat Coverage](https://github.com/sc-forks/solidity-coverage)
- [Slither](https://github.com/crytic/slither)

---

## 🚀 Next Steps After Phase 1

Upon completion of Phase 1, immediately proceed to **Phase 2: Security Audits**

**Phase 2 Preview:**
1. Submit contracts to OpenZeppelin for first audit (Week 5-6)
2. Address audit findings and retest (Week 6-7)
3. Submit to CertiK for second audit (Week 7-8)
4. Cross-verify findings and publish security report (Week 8)

**Audit Preparation Checklist:**
- [ ] Freeze contract code (no changes during audit)
- [ ] Prepare audit documentation package
- [ ] Document known limitations and design decisions
- [ ] Prepare test suite and coverage reports
- [ ] Create audit response process and timeline

---

**Document Status:** 🟢 Ready for Development
**Last Updated:** October 2025
**Next Review:** After Day 5 completion
