// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title C12DAOTreasury
 * @notice Treasury contract for managing C12DAO funds and revenue distribution
 * @dev Handles revenue tracking, budget management, and distribution to stakers
 * @custom:security-contact security@c12usd.com
 */
contract C12DAOTreasury is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");

    address public c12usdToken;
    address public c12daoToken;
    address public stakingContract;

    uint256 public totalRevenueReceived;
    uint256 public totalDistributed;

    // Revenue tracking by source
    mapping(address => uint256) public revenueBySource;

    // Budget management
    uint256 public nextBudgetId;
    mapping(uint256 => Budget) public budgets;

    struct Budget {
        string category;
        uint256 allocated;
        uint256 spent;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    // Multi-sig withdrawal tracking
    uint256 public constant MULTI_SIG_THRESHOLD = 100_000e18; // $100K requires multi-sig
    mapping(bytes32 => WithdrawalRequest) public withdrawalRequests;

    struct WithdrawalRequest {
        address to;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) approved;
        bool executed;
    }

    // Events
    event RevenueReceived(address indexed source, uint256 amount);
    event BudgetCreated(uint256 indexed budgetId, string category, uint256 allocated, uint256 duration);
    event BudgetSpent(uint256 indexed budgetId, address indexed to, uint256 amount);
    event RevenueDistributed(string destination, uint256 amount);
    event WithdrawalRequested(bytes32 indexed requestId, address indexed to, uint256 amount);
    event WithdrawalApproved(bytes32 indexed requestId, address indexed approver);
    event WithdrawalExecuted(bytes32 indexed requestId, address indexed to, uint256 amount);

    /**
     * @dev Constructor for C12DAOTreasury
     * @param _c12daoToken Address of C12DAO governance token
     * @param _c12usdToken Address of C12USD stablecoin
     * @param _admin Admin address for role management
     */
    constructor(
        address _c12daoToken,
        address _c12usdToken,
        address _admin
    ) {
        require(_c12daoToken != address(0), "Treasury: Invalid C12DAO address");
        require(_c12usdToken != address(0), "Treasury: Invalid C12USD address");
        require(_admin != address(0), "Treasury: Invalid admin address");

        c12daoToken = _c12daoToken;
        c12usdToken = _c12usdToken;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(TREASURER_ROLE, _admin);
        _grantRole(FINANCE_ROLE, _admin);
    }

    /**
     * @dev Set the staking contract address
     * @param _stakingContract Address of C12DAOStaking contract
     */
    function setStakingContract(address _stakingContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_stakingContract != address(0), "Treasury: Invalid staking address");
        stakingContract = _stakingContract;
    }

    /**
     * @dev Receive revenue from flash loan fees or other sources
     * @param source The source of the revenue
     * @param amount The amount of revenue received
     */
    function receiveRevenue(address source, uint256 amount) external nonReentrant {
        require(amount > 0, "Treasury: Amount must be > 0");

        // Transfer tokens to treasury
        IERC20(c12usdToken).safeTransferFrom(msg.sender, address(this), amount);

        totalRevenueReceived += amount;
        revenueBySource[source] += amount;

        emit RevenueReceived(source, amount);
    }

    /**
     * @dev Create a new budget
     * @param category Budget category (e.g., "Development", "Marketing")
     * @param amount Amount allocated to this budget
     * @param duration Duration of the budget in seconds
     */
    function createBudget(
        string memory category,
        uint256 amount,
        uint256 duration
    ) external onlyRole(TREASURER_ROLE) {
        require(amount > 0, "Treasury: Amount must be > 0");
        require(duration > 0, "Treasury: Duration must be > 0");

        uint256 budgetId = nextBudgetId++;

        budgets[budgetId] = Budget({
            category: category,
            allocated: amount,
            spent: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            active: true
        });

        emit BudgetCreated(budgetId, category, amount, duration);
    }

    /**
     * @dev Withdraw from a budget
     * @param budgetId The budget to withdraw from
     * @param to The recipient address
     * @param amount The amount to withdraw
     */
    function withdrawFromBudget(
        uint256 budgetId,
        address to,
        uint256 amount
    ) external onlyRole(FINANCE_ROLE) nonReentrant {
        Budget storage budget = budgets[budgetId];

        require(budget.active, "Treasury: Budget not active");
        require(block.timestamp <= budget.endTime, "Treasury: Budget expired");
        require(budget.spent + amount <= budget.allocated, "Treasury: Exceeds budget");
        require(to != address(0), "Treasury: Invalid recipient");

        budget.spent += amount;

        IERC20(c12usdToken).safeTransfer(to, amount);

        emit BudgetSpent(budgetId, to, amount);
    }

    /**
     * @dev Distribute revenue to stakers
     * @param amount The amount to distribute
     */
    function distributeToStakers(uint256 amount) external onlyRole(TREASURER_ROLE) nonReentrant {
        require(stakingContract != address(0), "Treasury: Staking contract not set");
        require(amount > 0, "Treasury: Amount must be > 0");
        require(amount <= IERC20(c12usdToken).balanceOf(address(this)), "Treasury: Insufficient balance");

        IERC20(c12usdToken).safeTransfer(stakingContract, amount);
        totalDistributed += amount;

        emit RevenueDistributed("Staking", amount);
    }

    /**
     * @dev Emergency withdrawal (Governor-only via governance)
     * @param token Token address to withdraw
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        require(to != address(0), "Treasury: Invalid recipient");
        require(amount > 0, "Treasury: Amount must be > 0");

        IERC20(token).safeTransfer(to, amount);

        emit RevenueDistributed("Emergency", amount);
    }

    /**
     * @dev Get treasury balance of a specific token
     * @param token The token address
     * @return The balance
     */
    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev Get budget details
     * @param budgetId The budget ID
     * @return category Budget category
     * @return allocated Allocated amount
     * @return spent Amount spent
     * @return startTime Start time
     * @return endTime End time
     * @return active Active status
     */
    function getBudget(uint256 budgetId)
        external
        view
        returns (
            string memory category,
            uint256 allocated,
            uint256 spent,
            uint256 startTime,
            uint256 endTime,
            bool active
        )
    {
        Budget storage budget = budgets[budgetId];
        return (
            budget.category,
            budget.allocated,
            budget.spent,
            budget.startTime,
            budget.endTime,
            budget.active
        );
    }
}
