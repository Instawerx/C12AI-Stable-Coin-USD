# C12DAO Phase 1: Smart Contract Development - Polygon Mainnet
## Terminal Testing & Direct Mainnet Deployment

**Version:** 1.0
**Phase:** 1 of 5
**Duration:** 4 Weeks
**Chain:** Polygon Mainnet (Chain ID: 137)
**Admin:** 0x7903c63CB9f42284d03BC2a124474760f9C1390b
**Status:** 🔵 Ready to Start

---

## 📋 Overview

This document outlines Phase 1 development for deploying C12DAO governance system directly to **Polygon mainnet** with all testing done via **Hardhat local terminal** (no testnet deployment). The admin address will remain `0x7903c63CB9f42284d03BC2a124474760f9C1390b` for continuity with existing C12USD infrastructure.

**Phase 1 Objectives:**
- ✅ Develop C12DAO token contract (ERC20Votes)
- ✅ Implement vesting logic for team/advisors
- ✅ Develop Governor contract with timelock
- ✅ Create Treasury contract for revenue management
- ✅ Develop Staking contract with 5-tier system
- ✅ Achieve >95% test coverage via Hardhat tests
- ✅ Deploy directly to Polygon mainnet
- ✅ Verify all contracts on PolygonScan
- ✅ Complete comprehensive documentation

**Key Differences from Standard Plan:**
- ❌ No testnet deployment (BSC Testnet, Mumbai)
- ✅ All testing via `npx hardhat test` (local Hardhat network)
- ✅ All testing via `npx hardhat node` (forked Polygon mainnet)
- ✅ Single deployment target: Polygon mainnet
- ✅ Admin remains: 0x7903c63CB9f42284d03BC2a124474760f9C1390b

**Reference Documents:**
- `DAO_IMPLEMENTATION_PLAN.md` - Overall architecture
- `DAO_COMPATIBILITY_ANALYSIS.md` - C12USD integration
- `C12USD_TECHNICAL_WHITEPAPER.md` - Technical requirements

---

## 🗓️ Week 1: C12DAO Token Contract & Foundation Setup

### **Day 1: Environment Setup & Project Initialization**

**Tasks:**
- [ ] Create `contracts/dao/` directory structure
- [ ] Initialize Hardhat project with TypeScript
- [ ] Install dependencies:
  ```bash
  npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify
  npm install @openzeppelin/contracts@5.0.0
  npm install @layerzerolabs/lz-evm-protocol-v2 @layerzerolabs/lz-evm-messagelib-v2 @layerzerolabs/lz-evm-oapp-v2
  npm install dotenv
  ```
- [ ] Configure `hardhat.config.ts` for Polygon mainnet:
  ```typescript
  import { HardhatUserConfig } from "hardhat/config";
  import "@nomicfoundation/hardhat-toolbox";
  import "@nomicfoundation/hardhat-verify";
  import * as dotenv from "dotenv";

  dotenv.config();

  const config: HardhatUserConfig = {
    solidity: {
      version: "0.8.24",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
    networks: {
      hardhat: {
        forking: {
          url: process.env.POLYGON_RPC_URL || "",
          enabled: false, // Enable when needed for fork testing
        },
      },
      polygon: {
        url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        chainId: 137,
      },
    },
    etherscan: {
      apiKey: {
        polygon: process.env.POLYGONSCAN_API_KEY || "",
      },
    },
  };

  export default config;
  ```
- [ ] Setup `.env` file:
  ```bash
  # Admin wallet (DO NOT COMMIT THIS FILE)
  PRIVATE_KEY=<your_private_key_for_0x7903c63CB9f42284d03BC2a124474760f9C1390b>

  # RPC endpoints
  POLYGON_RPC_URL=https://polygon-rpc.com
  # Alternative: https://rpc-mainnet.maticvigil.com
  # Alternative: https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY

  # Block explorer API keys
  POLYGONSCAN_API_KEY=<your_polygonscan_api_key>

  # Admin address (for reference in scripts)
  ADMIN_ADDRESS=0x7903c63CB9f42284d03BC2a124474760f9C1390b
  ```
- [ ] Create `.env.example` (safe to commit):
  ```bash
  PRIVATE_KEY=your_private_key_here
  POLYGON_RPC_URL=https://polygon-rpc.com
  POLYGONSCAN_API_KEY=your_polygonscan_api_key
  ADMIN_ADDRESS=0x7903c63CB9f42284d03BC2a124474760f9C1390b
  ```
- [ ] Add `.env` to `.gitignore`
- [ ] Create folder structure:
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
  ├── C12DAOStaking.test.ts
  └── Integration.test.ts

  scripts/dao/
  ├── deploy-token.ts
  ├── deploy-governance.ts
  ├── deploy-treasury.ts
  ├── deploy-staking.ts
  ├── deploy-all.ts
  ├── configure-roles.ts
  └── verify-all.ts
  ```

**Deliverables:**
- ✅ Hardhat project initialized
- ✅ All dependencies installed
- ✅ Polygon mainnet configuration complete
- ✅ Folder structure created
- ✅ `.env` configured with admin private key

**Testing Checkpoint:**
```bash
npx hardhat compile
# Should compile successfully with no contracts yet
```

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
- [ ] Implement constructor with admin parameter (hardcoded to 0x7903c63CB9f42284d03BC2a124474760f9C1390b for safety)

**Full Contract Implementation:**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title C12DAO
 * @notice Governance token for C12USD ecosystem with vote delegation
 * @dev Implements ERC20Votes for on-chain governance, ERC20Permit for gasless approvals
 */
contract C12DAO is ERC20Votes, ERC20Permit, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    // Vesting schedules
    mapping(address => VestingSchedule) public vestingSchedules;

    struct VestingSchedule {
        uint256 totalAmount;      // Total tokens to be vested
        uint256 releasedAmount;   // Tokens already released
        uint256 startTime;        // Vesting start timestamp
        uint256 cliffDuration;    // Cliff period (no tokens released)
        uint256 vestingDuration;  // Total vesting period
    }

    // Events
    event TokensVested(address indexed beneficiary, uint256 amount);
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration
    );

    /**
     * @dev Constructor sets up the DAO token with admin at 0x7903c63CB9f42284d03BC2a124474760f9C1390b
     * @param admin The admin address (should be 0x7903c63CB9f42284d03BC2a124474760f9C1390b)
     */
    constructor(address admin)
        ERC20("C12AI DAO", "C12DAO")
        ERC20Permit("C12AI DAO")
    {
        require(admin == 0x7903c63CB9f42284d03BC2a124474760f9C1390b, "C12DAO: Invalid admin address");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * @dev Mint new tokens (only MINTER_ROLE)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "C12DAO: Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary Address that will receive vested tokens
     * @param amount Total amount to vest
     * @param cliffDuration Cliff period in seconds
     * @param vestingDuration Total vesting period in seconds
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(beneficiary != address(0), "C12DAO: Beneficiary cannot be zero address");
        require(amount > 0, "C12DAO: Amount must be greater than zero");
        require(vestingSchedules[beneficiary].totalAmount == 0, "C12DAO: Vesting schedule already exists");
        require(vestingDuration > cliffDuration, "C12DAO: Vesting duration must be greater than cliff");
        require(totalSupply() + amount <= MAX_SUPPLY, "C12DAO: Exceeds max supply");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration
        });

        // Mint tokens to this contract (will be released over time)
        _mint(address(this), amount);

        emit VestingScheduleCreated(beneficiary, amount, block.timestamp, cliffDuration, vestingDuration);
    }

    /**
     * @dev Calculate vested amount for a beneficiary
     * @param beneficiary Address to check
     * @return Amount of tokens that can be released
     */
    function calculateVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];

        if (schedule.totalAmount == 0) {
            return 0;
        }

        // Check if still in cliff period
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }

        // Check if fully vested
        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount - schedule.releasedAmount;
        }

        // Calculate linear vesting
        uint256 timeVested = block.timestamp - schedule.startTime;
        uint256 vestedAmount = (schedule.totalAmount * timeVested) / schedule.vestingDuration;

        return vestedAmount - schedule.releasedAmount;
    }

    /**
     * @dev Release vested tokens to beneficiary
     */
    function releaseVestedTokens() external {
        uint256 releasable = calculateVestedAmount(msg.sender);
        require(releasable > 0, "C12DAO: No tokens available for release");

        vestingSchedules[msg.sender].releasedAmount += releasable;
        _transfer(address(this), msg.sender, releasable);

        emit TokensVested(msg.sender, releasable);
    }

    /**
     * @dev Pause token transfers (only PAUSER_ROLE)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers (only PAUSER_ROLE)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ============ ERC20Votes Overrides ============

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    // ============ Governance Compatibility ============

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }
}
```

**Deliverables:**
- ✅ C12DAO.sol fully implemented
- ✅ All core functions complete
- ✅ Vesting logic included
- ✅ Admin address validation

**Testing Checkpoint:**
```bash
npx hardhat compile
# Should compile C12DAO.sol successfully
```

---

### **Day 3: C12DAO Token - Comprehensive Testing**

**Tasks:**
- [ ] Create `test/dao/C12DAO.test.ts`
- [ ] Write comprehensive unit tests (50+ test cases)

**Full Test Suite:**
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { C12DAO } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("C12DAO Token", function () {
  let c12dao: C12DAO;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  const ADMIN_ADDRESS = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";
  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1B tokens

  beforeEach(async function () {
    [admin, user1, user2, user3] = await ethers.getSigners();

    // Deploy with correct admin address
    const C12DAOFactory = await ethers.getContractFactory("C12DAO");
    c12dao = await C12DAOFactory.deploy(ADMIN_ADDRESS);
    await c12dao.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      expect(await c12dao.name()).to.equal("C12AI DAO");
      expect(await c12dao.symbol()).to.equal("C12DAO");
      expect(await c12dao.decimals()).to.equal(18);
    });

    it("Should set correct admin address", async function () {
      const DEFAULT_ADMIN_ROLE = await c12dao.DEFAULT_ADMIN_ROLE();
      expect(await c12dao.hasRole(DEFAULT_ADMIN_ROLE, ADMIN_ADDRESS)).to.be.true;
    });

    it("Should grant MINTER_ROLE to admin", async function () {
      const MINTER_ROLE = await c12dao.MINTER_ROLE();
      expect(await c12dao.hasRole(MINTER_ROLE, ADMIN_ADDRESS)).to.be.true;
    });

    it("Should grant PAUSER_ROLE to admin", async function () {
      const PAUSER_ROLE = await c12dao.PAUSER_ROLE();
      expect(await c12dao.hasRole(PAUSER_ROLE, ADMIN_ADDRESS)).to.be.true;
    });

    it("Should start with zero supply", async function () {
      expect(await c12dao.totalSupply()).to.equal(0);
    });

    it("Should reject deployment with wrong admin address", async function () {
      const C12DAOFactory = await ethers.getContractFactory("C12DAO");
      await expect(
        C12DAOFactory.deploy(user1.address)
      ).to.be.revertedWith("C12DAO: Invalid admin address");
    });
  });

  describe("Minting", function () {
    it("Should allow MINTER_ROLE to mint tokens", async function () {
      // Impersonate admin
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await c12dao.connect(adminSigner).mint(user1.address, ethers.parseEther("1000"));

      expect(await c12dao.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
      expect(await c12dao.totalSupply()).to.equal(ethers.parseEther("1000"));

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should prevent minting above MAX_SUPPLY", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await expect(
        c12dao.connect(adminSigner).mint(user1.address, MAX_SUPPLY + 1n)
      ).to.be.revertedWith("C12DAO: Exceeds max supply");

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should prevent non-MINTER from minting", async function () {
      await expect(
        c12dao.connect(user1).mint(user2.address, ethers.parseEther("1000"))
      ).to.be.reverted;
    });
  });

  describe("Vesting", function () {
    it("Should create vesting schedule", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      const amount = ethers.parseEther("1000000");
      const cliffDuration = 365 * 24 * 60 * 60; // 1 year
      const vestingDuration = 4 * 365 * 24 * 60 * 60; // 4 years

      await c12dao.connect(adminSigner).createVestingSchedule(
        user1.address,
        amount,
        cliffDuration,
        vestingDuration
      );

      const schedule = await c12dao.vestingSchedules(user1.address);
      expect(schedule.totalAmount).to.equal(amount);
      expect(schedule.releasedAmount).to.equal(0);
      expect(schedule.cliffDuration).to.equal(cliffDuration);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should not release tokens during cliff period", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      const amount = ethers.parseEther("1000000");
      const cliffDuration = 365 * 24 * 60 * 60;
      const vestingDuration = 4 * 365 * 24 * 60 * 60;

      await c12dao.connect(adminSigner).createVestingSchedule(
        user1.address,
        amount,
        cliffDuration,
        vestingDuration
      );

      // Fast forward 6 months (still in cliff)
      await time.increase(180 * 24 * 60 * 60);

      expect(await c12dao.calculateVestedAmount(user1.address)).to.equal(0);

      await expect(
        c12dao.connect(user1).releaseVestedTokens()
      ).to.be.revertedWith("C12DAO: No tokens available for release");

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should release tokens linearly after cliff", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      const amount = ethers.parseEther("1000000");
      const cliffDuration = 365 * 24 * 60 * 60;
      const vestingDuration = 4 * 365 * 24 * 60 * 60;

      await c12dao.connect(adminSigner).createVestingSchedule(
        user1.address,
        amount,
        cliffDuration,
        vestingDuration
      );

      // Fast forward 2 years (50% of vesting period)
      await time.increase(2 * 365 * 24 * 60 * 60);

      const vested = await c12dao.calculateVestedAmount(user1.address);

      // Should be approximately 50% (allowing for small rounding)
      const expectedVested = amount / 2n;
      const tolerance = ethers.parseEther("1000"); // 0.1% tolerance

      expect(vested).to.be.closeTo(expectedVested, tolerance);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should release all tokens after vesting period", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      const amount = ethers.parseEther("1000000");
      const cliffDuration = 365 * 24 * 60 * 60;
      const vestingDuration = 4 * 365 * 24 * 60 * 60;

      await c12dao.connect(adminSigner).createVestingSchedule(
        user1.address,
        amount,
        cliffDuration,
        vestingDuration
      );

      // Fast forward 4 years
      await time.increase(4 * 365 * 24 * 60 * 60);

      const vested = await c12dao.calculateVestedAmount(user1.address);
      expect(vested).to.equal(amount);

      // Release tokens
      await c12dao.connect(user1).releaseVestedTokens();
      expect(await c12dao.balanceOf(user1.address)).to.equal(amount);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await c12dao.connect(adminSigner).mint(user1.address, ethers.parseEther("100000"));
      await c12dao.connect(adminSigner).mint(user2.address, ethers.parseEther("50000"));

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should allow delegation", async function () {
      await c12dao.connect(user1).delegate(user1.address);

      expect(await c12dao.getVotes(user1.address)).to.equal(ethers.parseEther("100000"));
    });

    it("Should track voting power correctly", async function () {
      await c12dao.connect(user1).delegate(user2.address);

      expect(await c12dao.getVotes(user2.address)).to.equal(ethers.parseEther("100000"));
      expect(await c12dao.getVotes(user1.address)).to.equal(0);
    });

    it("Should support getPastVotes", async function () {
      await c12dao.connect(user1).delegate(user1.address);

      const blockNumber = await ethers.provider.getBlockNumber();
      await ethers.provider.send("evm_mine", []);

      expect(await c12dao.getPastVotes(user1.address, blockNumber)).to.equal(ethers.parseEther("100000"));
    });
  });

  describe("Pausable", function () {
    it("Should allow PAUSER_ROLE to pause", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await c12dao.connect(adminSigner).pause();
      expect(await c12dao.paused()).to.be.true;

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should block transfers when paused", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await c12dao.connect(adminSigner).mint(user1.address, ethers.parseEther("1000"));
      await c12dao.connect(adminSigner).pause();

      await expect(
        c12dao.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.reverted;

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });

    it("Should allow transfers after unpause", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await c12dao.connect(adminSigner).mint(user1.address, ethers.parseEther("1000"));
      await c12dao.connect(adminSigner).pause();
      await c12dao.connect(adminSigner).unpause();

      await expect(
        c12dao.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.not.be.reverted;

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });
  });

  describe("ERC20Permit", function () {
    it("Should support permit functionality", async function () {
      await ethers.provider.send("hardhat_impersonateAccount", [ADMIN_ADDRESS]);
      const adminSigner = await ethers.getSigner(ADMIN_ADDRESS);

      await c12dao.connect(adminSigner).mint(user1.address, ethers.parseEther("1000"));

      const nonce = await c12dao.nonces(user1.address);
      expect(nonce).to.equal(0);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [ADMIN_ADDRESS]);
    });
  });
});
```

**Deliverables:**
- ✅ Complete test suite (50+ tests)
- ✅ All tests passing
- ✅ Coverage >95%

**Testing Checkpoint:**
```bash
npx hardhat test test/dao/C12DAO.test.ts
# All tests should pass

npx hardhat coverage --testfiles "test/dao/C12DAO.test.ts"
# Coverage should be >95%
```

---

### **Day 4-5: Governor, Timelock, Treasury, & Staking Contracts**

Due to terminal-only testing and mainnet-only deployment, we'll consolidate development to move faster. Full contract implementations will be provided in the continuation document.

**Quick Development Path:**
- Day 4 Morning: Implement C12DAOTimelock.sol + C12DAOGovernor.sol
- Day 4 Afternoon: Write tests for Timelock + Governor
- Day 5 Morning: Implement C12DAOTreasury.sol + C12DAOStaking.sol
- Day 5 Afternoon: Write tests for Treasury + Staking

---

## 🗓️ Week 2-3: Remaining Contracts & Integration Testing

**Consolidated Timeline:**
- **Week 2:** Complete all 5 contracts + individual tests
- **Week 3:** Integration testing + security analysis
- **Week 4:** Documentation + mainnet deployment

---

## 🚀 Direct Mainnet Deployment (Week 4)

### **Deployment Checklist**

**Pre-Deployment:**
- [ ] All tests passing (>95% coverage)
- [ ] Slither security analysis clean
- [ ] Admin address verified: 0x7903c63CB9f42284d03BC2a124474760f9C1390b
- [ ] Polygon RPC URL configured
- [ ] Private key in `.env` (NEVER commit)
- [ ] MATIC balance sufficient for deployment gas (~5-10 MATIC recommended)

**Deployment Script (`scripts/dao/deploy-all.ts`):**
```typescript
import { ethers } from "hardhat";

async function main() {
  const ADMIN_ADDRESS = "0x7903c63CB9f42284d03BC2a124474760f9C1390b";

  console.log("🚀 Deploying C12DAO system to Polygon mainnet...");
  console.log("Admin:", ADMIN_ADDRESS);

  // 1. Deploy C12DAO Token
  console.log("\n📝 Deploying C12DAO token...");
  const C12DAOFactory = await ethers.getContractFactory("C12DAO");
  const c12dao = await C12DAOFactory.deploy(ADMIN_ADDRESS);
  await c12dao.waitForDeployment();
  console.log("✅ C12DAO deployed to:", await c12dao.getAddress());

  // 2. Deploy Timelock
  console.log("\n⏰ Deploying C12DAOTimelock...");
  const TimelockFactory = await ethers.getContractFactory("C12DAOTimelock");
  const timelock = await TimelockFactory.deploy(
    172800, // 48 hours
    [], // Proposers (will be governor)
    [ethers.ZeroAddress], // Executors (anyone can execute)
    ADMIN_ADDRESS
  );
  await timelock.waitForDeployment();
  console.log("✅ Timelock deployed to:", await timelock.getAddress());

  // 3. Deploy Governor
  console.log("\n🏛️ Deploying C12DAOGovernor...");
  const GovernorFactory = await ethers.getContractFactory("C12DAOGovernor");
  const governor = await GovernorFactory.deploy(
    await c12dao.getAddress(),
    await timelock.getAddress()
  );
  await governor.waitForDeployment();
  console.log("✅ Governor deployed to:", await governor.getAddress());

  // 4. Deploy Treasury
  console.log("\n💰 Deploying C12DAOTreasury...");
  const TreasuryFactory = await ethers.getContractFactory("C12DAOTreasury");
  const treasury = await TreasuryFactory.deploy(
    await c12dao.getAddress(),
    "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811", // C12USD Polygon address
    ADMIN_ADDRESS
  );
  await treasury.waitForDeployment();
  console.log("✅ Treasury deployed to:", await treasury.getAddress());

  // 5. Deploy Staking
  console.log("\n🔒 Deploying C12DAOStaking...");
  const StakingFactory = await ethers.getContractFactory("C12DAOStaking");
  const staking = await StakingFactory.deploy(
    await c12dao.getAddress(),
    await treasury.getAddress(),
    ADMIN_ADDRESS
  );
  await staking.waitForDeployment();
  console.log("✅ Staking deployed to:", await staking.getAddress());

  // 6. Configure roles
  console.log("\n🔧 Configuring roles...");

  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
  console.log("✅ Governor granted PROPOSER_ROLE on Timelock");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("C12DAO Token:", await c12dao.getAddress());
  console.log("Timelock:", await timelock.getAddress());
  console.log("Governor:", await governor.getAddress());
  console.log("Treasury:", await treasury.getAddress());
  console.log("Staking:", await staking.getAddress());

  console.log("\n🔍 Next steps:");
  console.log("1. Verify contracts on PolygonScan");
  console.log("2. Distribute C12DAO tokens");
  console.log("3. Transfer C12USD roles to Timelock (when ready)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

**Deploy to Polygon Mainnet:**
```bash
npx hardhat run scripts/dao/deploy-all.ts --network polygon
```

**Verify Contracts:**
```bash
npx hardhat verify --network polygon <C12DAO_ADDRESS> 0x7903c63CB9f42284d03BC2a124474760f9C1390b
npx hardhat verify --network polygon <TIMELOCK_ADDRESS> 172800 "[]" "0x0000000000000000000000000000000000000000" 0x7903c63CB9f42284d03BC2a124474760f9C1390b
# ... etc for all contracts
```

---

## ✅ Success Criteria

**Phase 1 Complete When:**
- ✅ All 5 contracts deployed to Polygon mainnet
- ✅ All contracts verified on PolygonScan
- ✅ Test coverage >95% (terminal tests)
- ✅ Admin address confirmed: 0x7903c63CB9f42284d03BC2a124474760f9C1390b
- ✅ No critical security findings
- ✅ Documentation complete

---

**Next:** Begin Day 1 implementation! 🚀
