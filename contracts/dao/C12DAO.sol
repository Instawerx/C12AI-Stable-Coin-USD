// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title C12DAO
 * @notice Governance token for C12USD ecosystem with vote delegation and vesting
 * @dev Implements ERC20Votes for on-chain governance, ERC20Permit for gasless approvals
 * @custom:security-contact security@c12usd.com
 */
contract C12DAO is ERC20, ERC20Permit, ERC20Votes, AccessControl, Pausable {
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
     * @param admin The admin address (must be 0x7903c63CB9f42284d03BC2a124474760f9C1390b)
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

        emit VestingScheduleCreated(
            beneficiary,
            amount,
            block.timestamp,
            cliffDuration,
            vestingDuration
        );
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

    // ============ Required Overrides ============

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
}
