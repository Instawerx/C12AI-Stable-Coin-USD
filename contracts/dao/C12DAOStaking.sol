// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title C12DAOStaking
 * @notice Staking contract for C12DAO with 5-tier system and reward multipliers
 * @dev Allows users to stake C12DAO tokens and earn rewards based on lock duration
 * @custom:security-contact security@c12usd.com
 */
contract C12DAOStaking is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public c12daoToken;
    address public treasury;

    // Staking tiers
    struct StakingTier {
        string name;
        uint256 lockDuration;     // Lock period in seconds
        uint256 rewardMultiplier; // 100 = 1x, 300 = 3x
        uint256 votingMultiplier; // Voting power boost
        uint256 baseAPY;          // Base APY in basis points (1000 = 10%)
    }

    mapping(uint256 => StakingTier) public tiers;

    // Staking positions
    struct StakingPosition {
        uint256 amount;
        uint256 tier;
        uint256 startTime;
        uint256 unlockTime;
        uint256 rewardsClaimed;
        bool active;
    }

    mapping(address => StakingPosition[]) public userPositions;

    // Total staked tracking
    uint256 public totalStaked;
    mapping(uint256 => uint256) public stakedPerTier;

    // Events
    event Staked(address indexed user, uint256 amount, uint256 tier, uint256 positionIndex);
    event Unstaked(address indexed user, uint256 positionIndex, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 positionIndex, uint256 amount);
    event EmergencyUnstaked(address indexed user, uint256 positionIndex, uint256 amount, uint256 penalty);

    /**
     * @dev Constructor for C12DAOStaking
     * @param _c12daoToken Address of C12DAO token
     * @param _treasury Address of treasury contract
     * @param _admin Admin address
     */
    constructor(
        address _c12daoToken,
        address _treasury,
        address _admin
    ) {
        require(_c12daoToken != address(0), "Staking: Invalid token address");
        require(_treasury != address(0), "Staking: Invalid treasury address");
        require(_admin != address(0), "Staking: Invalid admin address");

        c12daoToken = _c12daoToken;
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        // Initialize staking tiers
        // Tier 0: Flexible - No lock, 1x rewards, 1x voting, 10% APY
        tiers[0] = StakingTier({
            name: "Flexible",
            lockDuration: 0,
            rewardMultiplier: 100,
            votingMultiplier: 100,
            baseAPY: 1000 // 10%
        });

        // Tier 1: Bronze - 30 days, 1.2x rewards, 1.25x voting, 12% APY
        tiers[1] = StakingTier({
            name: "Bronze",
            lockDuration: 30 days,
            rewardMultiplier: 120,
            votingMultiplier: 125,
            baseAPY: 1200 // 12%
        });

        // Tier 2: Silver - 90 days, 1.5x rewards, 1.5x voting, 15% APY
        tiers[2] = StakingTier({
            name: "Silver",
            lockDuration: 90 days,
            rewardMultiplier: 150,
            votingMultiplier: 150,
            baseAPY: 1500 // 15%
        });

        // Tier 3: Gold - 180 days, 2x rewards, 2x voting, 20% APY
        tiers[3] = StakingTier({
            name: "Gold",
            lockDuration: 180 days,
            rewardMultiplier: 200,
            votingMultiplier: 200,
            baseAPY: 2000 // 20%
        });

        // Tier 4: Platinum - 365 days, 3x rewards, 3x voting, 30% APY
        tiers[4] = StakingTier({
            name: "Platinum",
            lockDuration: 365 days,
            rewardMultiplier: 300,
            votingMultiplier: 300,
            baseAPY: 3000 // 30%
        });
    }

    /**
     * @dev Stake tokens in a specific tier
     * @param amount Amount of C12DAO to stake
     * @param tier Tier ID (0-4)
     */
    function stake(uint256 amount, uint256 tier) external nonReentrant {
        require(tier < 5, "Staking: Invalid tier");
        require(amount > 0, "Staking: Amount must be > 0");

        StakingTier memory selectedTier = tiers[tier];

        // Transfer tokens from user
        IERC20(c12daoToken).safeTransferFrom(msg.sender, address(this), amount);

        // Create staking position
        userPositions[msg.sender].push(StakingPosition({
            amount: amount,
            tier: tier,
            startTime: block.timestamp,
            unlockTime: block.timestamp + selectedTier.lockDuration,
            rewardsClaimed: 0,
            active: true
        }));

        totalStaked += amount;
        stakedPerTier[tier] += amount;

        emit Staked(msg.sender, amount, tier, userPositions[msg.sender].length - 1);
    }

    /**
     * @dev Calculate rewards for a staking position
     * @param user User address
     * @param positionIndex Position index
     * @return Rewards amount
     */
    function calculateRewards(address user, uint256 positionIndex) public view returns (uint256) {
        require(positionIndex < userPositions[user].length, "Staking: Invalid position");

        StakingPosition memory position = userPositions[user][positionIndex];
        if (!position.active) return 0;

        StakingTier memory tier = tiers[position.tier];

        uint256 timeStaked = block.timestamp - position.startTime;
        uint256 baseReward = (position.amount * tier.baseAPY * timeStaked) / (365 days * 10000);
        uint256 multipliedReward = (baseReward * tier.rewardMultiplier) / 100;

        return multipliedReward - position.rewardsClaimed;
    }

    /**
     * @dev Claim rewards for a staking position
     * @param positionIndex Position index
     */
    function claimRewards(uint256 positionIndex) external nonReentrant {
        require(positionIndex < userPositions[msg.sender].length, "Staking: Invalid position");

        uint256 rewards = calculateRewards(msg.sender, positionIndex);
        require(rewards > 0, "Staking: No rewards to claim");

        userPositions[msg.sender][positionIndex].rewardsClaimed += rewards;

        // Transfer rewards from treasury
        IERC20(c12daoToken).safeTransferFrom(treasury, msg.sender, rewards);

        emit RewardsClaimed(msg.sender, positionIndex, rewards);
    }

    /**
     * @dev Unstake tokens after lock period
     * @param positionIndex Position index
     */
    function unstake(uint256 positionIndex) external nonReentrant {
        require(positionIndex < userPositions[msg.sender].length, "Staking: Invalid position");

        StakingPosition storage position = userPositions[msg.sender][positionIndex];
        require(position.active, "Staking: Position not active");
        require(block.timestamp >= position.unlockTime, "Staking: Still locked");

        // Auto-claim remaining rewards
        uint256 rewards = calculateRewards(msg.sender, positionIndex);
        if (rewards > 0) {
            position.rewardsClaimed += rewards;
            IERC20(c12daoToken).safeTransferFrom(treasury, msg.sender, rewards);
            emit RewardsClaimed(msg.sender, positionIndex, rewards);
        }

        uint256 amount = position.amount;
        position.active = false;

        totalStaked -= amount;
        stakedPerTier[position.tier] -= amount;

        // Return staked tokens
        IERC20(c12daoToken).safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, positionIndex, amount);
    }

    /**
     * @dev Emergency unstake with 10% penalty
     * @param positionIndex Position index
     */
    function emergencyUnstake(uint256 positionIndex) external nonReentrant {
        require(positionIndex < userPositions[msg.sender].length, "Staking: Invalid position");

        StakingPosition storage position = userPositions[msg.sender][positionIndex];
        require(position.active, "Staking: Position not active");

        uint256 penalty = (position.amount * 10) / 100; // 10% penalty
        uint256 amountAfterPenalty = position.amount - penalty;

        position.active = false;

        totalStaked -= position.amount;
        stakedPerTier[position.tier] -= position.amount;

        // Transfer principal minus penalty
        IERC20(c12daoToken).safeTransfer(msg.sender, amountAfterPenalty);

        // Send penalty to treasury
        IERC20(c12daoToken).safeTransfer(treasury, penalty);

        emit EmergencyUnstaked(msg.sender, positionIndex, amountAfterPenalty, penalty);
    }

    /**
     * @dev Get user's total staked amount
     * @param user User address
     * @return Total staked amount
     */
    function getUserTotalStaked(address user) external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < userPositions[user].length; i++) {
            if (userPositions[user][i].active) {
                total += userPositions[user][i].amount;
            }
        }
        return total;
    }

    /**
     * @dev Get user's position count
     * @param user User address
     * @return Number of positions
     */
    function getUserPositionCount(address user) external view returns (uint256) {
        return userPositions[user].length;
    }

    /**
     * @dev Get tier details
     * @param tierId Tier ID
     * @return name Name of the tier
     * @return lockDuration Lock duration in seconds
     * @return rewardMultiplier Reward multiplier
     * @return votingMultiplier Voting multiplier
     * @return baseAPY Base APY
     */
    function getTier(uint256 tierId)
        external
        view
        returns (
            string memory name,
            uint256 lockDuration,
            uint256 rewardMultiplier,
            uint256 votingMultiplier,
            uint256 baseAPY
        )
    {
        require(tierId < 5, "Staking: Invalid tier");
        StakingTier memory tier = tiers[tierId];
        return (
            tier.name,
            tier.lockDuration,
            tier.rewardMultiplier,
            tier.votingMultiplier,
            tier.baseAPY
        );
    }
}
