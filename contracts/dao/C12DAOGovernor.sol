// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title C12DAOGovernor
 * @notice Governor contract for C12DAO with timelock control
 * @dev Implements OpenZeppelin Governor with all standard extensions
 * @custom:security-contact security@c12usd.com
 */
contract C12DAOGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // Governance parameters
    uint256 public constant VOTING_DELAY = 1 days;           // Delay before voting starts
    uint256 public constant VOTING_PERIOD = 7 days;          // Voting duration
    uint256 public constant PROPOSAL_THRESHOLD = 100_000e18; // Min tokens to propose (100K C12DAO)
    uint256 public constant QUORUM_PERCENTAGE = 4;            // 4% quorum

    /**
     * @dev Constructor for C12DAOGovernor
     * @param _token The C12DAO token used for voting
     * @param _timelock The timelock controller for delayed execution
     */
    constructor(IVotes _token, TimelockController _timelock)
        Governor("C12AI DAO Governor")
        GovernorSettings(
            VOTING_DELAY,         // 1 day voting delay
            VOTING_PERIOD,        // 7 day voting period
            PROPOSAL_THRESHOLD    // 100K tokens to propose
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(QUORUM_PERCENTAGE) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    // ============ Required Overrides ============

    function votingDelay()
        public
        pure
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return VOTING_DELAY;
    }

    function votingPeriod()
        public
        pure
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return VOTING_PERIOD;
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        pure
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return PROPOSAL_THRESHOLD;
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
