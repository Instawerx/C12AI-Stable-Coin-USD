// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title C12DAOTimelock
 * @notice Timelock controller for C12DAO governance with 48-hour delay
 * @dev Extends OpenZeppelin TimelockController with custom events
 * @custom:security-contact security@c12usd.com
 */
contract C12DAOTimelock is TimelockController {
    // Custom events for monitoring
    event EmergencyExecuted(bytes32 indexed id);
    event DelayUpdated(uint256 oldDelay, uint256 newDelay);

    /**
     * @dev Constructor for C12DAOTimelock
     * @param minDelay Minimum delay before execution (48 hours = 172800 seconds)
     * @param proposers Array of addresses that can propose (Governor contract)
     * @param executors Array of addresses that can execute (address(0) = anyone)
     * @param admin Admin address for timelock management
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {
        // Timelock is now initialized with:
        // - 48 hour delay before execution
        // - Governor can propose
        // - Anyone can execute after delay (decentralized)
        // - Admin can manage roles initially
    }

    /**
     * @dev Get the current minimum delay
     * @return The minimum delay in seconds
     */
    function getMinDelay() public view override returns (uint256) {
        return super.getMinDelay();
    }
}
