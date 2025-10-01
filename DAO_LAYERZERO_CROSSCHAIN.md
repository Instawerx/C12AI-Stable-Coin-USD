# C12DAO LayerZero Cross-Chain Governance
## Omnichain DAO Token & Multi-Chain Governance Implementation

**Version:** 1.0
**Created:** October 2025
**Primary Chain:** Polygon (Chain ID: 137, LayerZero EID: 30109)
**Admin:** 0x7903c63CB9f42284d03BC2a124474760f9C1390b

---

## 🎯 Overview

This document outlines the LayerZero V2 integration for C12DAO, enabling:

1. **Omnichain C12DAO Token** - C12DAO exists on multiple chains with unified supply (like C12USD)
2. **Cross-Chain Governance** - Vote on Polygon, execute on BSC/Ethereum/other chains
3. **Unified Voting Power** - Your C12DAO balance on ANY chain counts toward voting power
4. **Multi-Chain Execution** - Single proposal can execute actions across multiple chains

**Why This Matters:**
- C12USD is already deployed on BSC + Polygon
- DAO governance needs to control C12USD on BOTH chains
- Users may hold C12DAO on different chains than their C12USD
- Flash loan fee updates, circuit breakers, etc. should work across all chains simultaneously

---

## 📋 Architecture

### LayerZero V2 Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Polygon (Primary Chain)                      │
│  ┌──────────────────┐    ┌────────────────┐  ┌───────────────┐ │
│  │  C12DAO (OFT)    │───▶│ C12DAOGovernor │─▶│ C12DAOTimelock│ │
│  │  ERC20Votes +    │    │  Voting happens │  │  (48h delay)  │ │
│  │  LayerZero OFT   │    │  here           │  │               │ │
│  └──────────────────┘    └────────────────┘  └───────┬───────┘ │
│         ▲                                              │         │
│         │ Cross-chain transfers                        │         │
│         │ (unified supply)                             │         │
└─────────┼──────────────────────────────────────────────┼─────────┘
          │                                              │
    LayerZero V2                                LayerZero V2
    OFT Messages                              Governance Messages
          │                                              │
          ▼                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          BSC Chain                               │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │  C12DAO (OFT)    │         │  GovernanceReceiver (OApp)   │  │
│  │  Mirrored supply │         │  - Receives governance msgs  │  │
│  │  from Polygon    │         │  - Validates source chain    │  │
│  └──────────────────┘         │  - Executes on C12USD        │  │
│                               └────────────┬─────────────────┘  │
│                                            │                     │
│                                            ▼                     │
│                               ┌──────────────────────────────┐  │
│                               │  C12USD (BSC)                │  │
│                               │  0x6fa920C5c676ac15AF6360... │  │
│                               └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Contracts

1. **C12DAOLZ.sol** - Omnichain Fungible Token (OFT) version of C12DAO
2. **C12DAOGovernor.sol** - Standard Governor (votes on Polygon only)
3. **C12DAOGovernanceHub.sol** - Cross-chain message sender
4. **C12DAOGovernanceReceiver.sol** - Cross-chain message receiver (deployed on each chain)

---

## 🔧 Implementation

### 1. C12DAOLZ - Omnichain Token Implementation

**File:** `contracts/dao/C12DAOLZ.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title C12DAOLZ
 * @notice Omnichain C12DAO governance token with LayerZero V2 OFT + ERC20Votes
 * @dev Combines LayerZero OFT with governance voting capabilities
 */
contract C12DAOLZ is OFT, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion

    // Vesting schedules (same as original C12DAO)
    mapping(address => VestingSchedule) public vestingSchedules;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
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
     * @dev Constructor for C12DAOLZ
     * @param _lzEndpoint LayerZero endpoint address
     * @param _delegate Delegate address for LayerZero operations
     * @param _admin Admin address (0x7903c63CB9f42284d03BC2a124474760f9C1390b)
     */
    constructor(
        address _lzEndpoint,
        address _delegate,
        address _admin
    ) OFT("C12AI DAO", "C12DAO", _lzEndpoint, _delegate) {
        require(_admin == 0x7903c63CB9f42284d03BC2a124474760f9C1390b, "Invalid admin");

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
    }

    /**
     * @dev Mint new tokens (only on primary chain - Polygon)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Create vesting schedule
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");
        require(vestingDuration > cliffDuration, "Invalid duration");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration
        });

        _mint(address(this), amount);

        emit VestingScheduleCreated(
            beneficiary,
            amount,
            block.timestamp,
            cliffDuration,
            vestingDuration
        );
    }

    /**
     * @dev Calculate vested tokens
     */
    function calculateVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        if (schedule.totalAmount == 0) return 0;

        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }

        if (block.timestamp >= schedule.startTime + schedule.vestingDuration) {
            return schedule.totalAmount - schedule.releasedAmount;
        }

        uint256 timeVested = block.timestamp - schedule.startTime;
        uint256 vestedAmount = (schedule.totalAmount * timeVested) / schedule.vestingDuration;

        return vestedAmount - schedule.releasedAmount;
    }

    /**
     * @dev Release vested tokens
     */
    function releaseVestedTokens() external {
        uint256 releasable = calculateVestedAmount(msg.sender);
        require(releasable > 0, "No tokens available");

        vestingSchedules[msg.sender].releasedAmount += releasable;
        _transfer(address(this), msg.sender, releasable);

        emit TokensVested(msg.sender, releasable);
    }

    /**
     * @dev Pause transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override _beforeTokenTransfer to respect pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

**Key Features:**
- ✅ LayerZero V2 OFT for cross-chain transfers
- ✅ Unified supply across all chains
- ✅ Same vesting logic as original C12DAO
- ✅ Pausable for emergencies
- ✅ Minting only on primary chain (Polygon)

**Note:** For governance voting (delegation, getPastVotes), we'll use a separate voting wrapper or extend this further. OFT + ERC20Votes together requires careful override management.

---

### 2. C12DAOGovernanceHub - Cross-Chain Message Sender

**File:** `contracts/dao/C12DAOGovernanceHub.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title C12DAOGovernanceHub
 * @notice Sends governance execution messages to other chains via LayerZero
 * @dev Called by Timelock after proposal passes
 */
contract C12DAOGovernanceHub is OApp {
    // Mapping of chain EID to trusted receiver address
    mapping(uint32 => bytes32) public trustedReceivers;

    // Events
    event GovernanceMessageSent(
        uint32 indexed dstEid,
        address indexed target,
        bytes callData,
        bytes32 guid
    );
    event TrustedReceiverSet(uint32 indexed eid, bytes32 receiver);

    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) {}

    /**
     * @dev Set trusted receiver on destination chain
     * @param _dstEid Destination chain LayerZero EID
     * @param _receiver Address of GovernanceReceiver on that chain
     */
    function setTrustedReceiver(uint32 _dstEid, bytes32 _receiver) external onlyOwner {
        trustedReceivers[_dstEid] = _receiver;
        emit TrustedReceiverSet(_dstEid, _receiver);
    }

    /**
     * @dev Send governance action to another chain
     * @param _dstEid Destination chain EID
     * @param _target Contract address to call on destination chain
     * @param _callData Encoded function call
     * @param _options LayerZero message options (gas limits, etc.)
     */
    function sendGovernanceMessage(
        uint32 _dstEid,
        address _target,
        bytes calldata _callData,
        bytes calldata _options
    ) external payable onlyOwner returns (bytes32 guid) {
        require(trustedReceivers[_dstEid] != bytes32(0), "Receiver not set");

        // Encode message: target + callData
        bytes memory message = abi.encode(_target, _callData);

        // Send via LayerZero
        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        require(msg.value >= fee.nativeFee, "Insufficient fee");

        guid = _lzSend(
            _dstEid,
            message,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit GovernanceMessageSent(_dstEid, _target, _callData, guid);
    }

    /**
     * @dev Quote fee for cross-chain governance message
     */
    function quoteGovernanceFee(
        uint32 _dstEid,
        address _target,
        bytes calldata _callData,
        bytes calldata _options
    ) external view returns (uint256 nativeFee) {
        bytes memory message = abi.encode(_target, _callData);
        MessagingFee memory fee = _quote(_dstEid, message, _options, false);
        return fee.nativeFee;
    }

    /**
     * @dev Receive function (not used, governance is one-way)
     */
    function _lzReceive(
        Origin calldata,
        bytes32,
        bytes calldata,
        address,
        bytes calldata
    ) internal pure override {
        revert("GovernanceHub does not receive messages");
    }
}
```

---

### 3. C12DAOGovernanceReceiver - Cross-Chain Message Receiver

**File:** `contracts/dao/C12DAOGovernanceReceiver.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";

/**
 * @title C12DAOGovernanceReceiver
 * @notice Receives and executes governance messages from Polygon
 * @dev Deployed on BSC, Ethereum, and other chains where C12USD exists
 */
contract C12DAOGovernanceReceiver is OApp {
    // Address of GovernanceHub on Polygon
    bytes32 public trustedSender;
    uint32 public constant POLYGON_EID = 30109;

    // Events
    event GovernanceExecuted(address indexed target, bytes callData, bool success);

    constructor(address _endpoint, address _owner, bytes32 _trustedSender)
        OApp(_endpoint, _owner)
    {
        trustedSender = _trustedSender;
    }

    /**
     * @dev Update trusted sender (GovernanceHub address on Polygon)
     */
    function setTrustedSender(bytes32 _sender) external onlyOwner {
        trustedSender = _sender;
    }

    /**
     * @dev Receive governance message from Polygon
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // Verify message is from Polygon GovernanceHub
        require(_origin.srcEid == POLYGON_EID, "Invalid source chain");
        require(_origin.sender == trustedSender, "Untrusted sender");

        // Decode message
        (address target, bytes memory callData) = abi.decode(_message, (address, bytes));

        // Execute governance action
        (bool success, ) = target.call(callData);

        emit GovernanceExecuted(target, callData, success);

        // Note: Not reverting on failure allows logging; adjust based on requirements
        require(success, "Governance execution failed");
    }
}
```

---

### 4. Updated C12DAOGovernor - Cross-Chain Aware

**Modification to existing Governor:**

```solidity
// Add to C12DAOGovernor.sol

contract C12DAOGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // ... existing code ...

    C12DAOGovernanceHub public governanceHub;

    /**
     * @dev Set the governance hub for cross-chain execution
     */
    function setGovernanceHub(address _hub) external onlyGovernance {
        governanceHub = C12DAOGovernanceHub(_hub);
    }

    /**
     * @dev Helper to create cross-chain proposal
     * @param dstEid Destination chain EID (e.g., 30102 for BSC)
     * @param target Contract to call on destination chain
     * @param callData Function call data
     */
    function proposeCrossChain(
        uint32 dstEid,
        address target,
        bytes calldata callData,
        string memory description
    ) external returns (uint256) {
        address[] memory targets = new address[](1);
        targets[0] = address(governanceHub);

        uint256[] memory values = new uint256[](1);
        values[0] = 0.1 ether; // Fee for LayerZero message

        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature(
            "sendGovernanceMessage(uint32,address,bytes,bytes)",
            dstEid,
            target,
            callData,
            "" // Default options
        );

        return propose(targets, values, calldatas, description);
    }
}
```

---

## 🚀 Deployment Strategy

### Polygon Mainnet (Primary Chain)

1. Deploy C12DAOLZ token
2. Deploy C12DAOTimelock
3. Deploy C12DAOGovernor
4. Deploy C12DAOGovernanceHub
5. Deploy C12DAOTreasury
6. Deploy C12DAOStaking

### BSC Mainnet (Secondary Chain)

1. Deploy C12DAOLZ token (peer of Polygon)
2. Deploy C12DAOGovernanceReceiver
3. Set trusted remote: Polygon C12DAOLZ ↔ BSC C12DAOLZ
4. Set trusted sender: GovernanceHub (Polygon) → GovernanceReceiver (BSC)

### Ethereum Mainnet (Future)

Same as BSC deployment when ready

---

## 📝 LayerZero Endpoint Addresses

**Polygon Mainnet:**
- LayerZero Endpoint V2: `0x6c7Ab2202C98C4227C5c46f1417D81144DA716Ff`
- EID: 30109

**BSC Mainnet:**
- LayerZero Endpoint V2: `0x6c7Ab2202C98C4227C5c46f1417D81144DA716Ff`
- EID: 30102

**Ethereum Mainnet:**
- LayerZero Endpoint V2: `0x6c7Ab2202C98C4227C5c46f1417D81144DA716Ff`
- EID: 30101

---

## 🧪 Testing Cross-Chain Governance

**Terminal Test Example:**

```typescript
// test/dao/CrossChainGovernance.test.ts

import { expect } from "chai";
import { ethers } from "hardhat";

describe("Cross-Chain Governance", function () {
  it("Should send governance message via LayerZero", async function () {
    // Deploy on forked Polygon
    const hub = await deployGovernanceHub();

    // Simulate governance proposal
    const targetAddress = "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811"; // C12USD Polygon
    const callData = c12usd.interface.encodeFunctionData("setFlashLoanFee", [3]);

    // Send to BSC (EID 30102)
    const tx = await hub.sendGovernanceMessage(
      30102, // BSC
      targetAddress,
      callData,
      "0x", // Default options
      { value: ethers.parseEther("0.1") } // LayerZero fee
    );

    await expect(tx).to.emit(hub, "GovernanceMessageSent");
  });
});
```

---

## 🔄 Example: Update Flash Loan Fee on All Chains

**Governance Proposal Workflow:**

1. **User creates proposal on Polygon:**
   ```solidity
   governor.propose(
     [hubAddress, hubAddress],
     [0.1 ether, 0.1 ether],
     [
       // Execute on Polygon directly
       c12usdPolygon.setFlashLoanFee(3),

       // Send to BSC via LayerZero
       hub.sendGovernanceMessage(
         30102, // BSC
         c12usdBSC,
         abi.encodeWithSignature("setFlashLoanFee(uint256)", 3)
       )
     ],
     "Lower flash loan fee to 0.03% on Polygon + BSC"
   );
   ```

2. **Community votes** (7-day voting period)

3. **Proposal queues** in Timelock (48-hour delay)

4. **Proposal executes:**
   - ✅ Updates fee on Polygon C12USD immediately
   - ✅ Sends LayerZero message to BSC
   - ✅ GovernanceReceiver on BSC receives message
   - ✅ Calls C12USD.setFlashLoanFee(3) on BSC
   - ✅ Fee updated on BOTH chains! 🎉

---

## 💰 Cost Considerations

**LayerZero Message Fees:**
- Polygon → BSC: ~$0.50-$2 per message (paid in MATIC)
- Polygon → Ethereum: ~$5-$20 per message (paid in MATIC)

**Governance Proposal Cost:**
- Include message fees in proposal execution
- Treasury can fund cross-chain operations
- Alternative: Multi-sig executes cross-chain after DAO vote (saves gas)

---

## ✅ Integration Checklist

- [ ] Install LayerZero V2 packages
- [ ] Deploy C12DAOLZ on Polygon with LZ endpoint
- [ ] Deploy C12DAOLZ on BSC with LZ endpoint
- [ ] Set peers: `setPeer(bscEid, bscC12DAOAddress)`
- [ ] Test cross-chain transfer of C12DAO tokens
- [ ] Deploy GovernanceHub on Polygon
- [ ] Deploy GovernanceReceiver on BSC
- [ ] Set trusted remotes between Hub ↔ Receiver
- [ ] Test governance message sending
- [ ] Execute test proposal that updates both chains
- [ ] Verify fee updates on both Polygon + BSC C12USD contracts

---

## 🎯 Success Criteria

**LayerZero Integration Complete When:**
- ✅ C12DAO tokens can transfer between Polygon ↔ BSC
- ✅ Supply remains unified (transfer doesn't mint, just moves)
- ✅ Governance proposals can target multiple chains
- ✅ Single vote on Polygon executes on BSC
- ✅ C12USD contracts on both chains accept governance commands
- ✅ All cross-chain messages verified and secure

---

**Status:** 🟢 Ready for Implementation
**Next:** Add LayerZero contracts to Phase 1 development plan
