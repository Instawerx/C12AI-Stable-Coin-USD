// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@layerzerolabs/oft-evm/contracts/OFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";

/**
 * @title C12USD - Enhanced C12AI DAO Stablecoin
 * @dev Cross-chain USD-pegged stablecoin with Flash Loans, Permit, and LayerZero OFT
 * @notice Features:
 *   - ERC-3156 Flash Loans with competitive fees
 *   - EIP-2612 Permit for gasless approvals
 *   - LayerZero OFT for seamless cross-chain transfers
 *   - Role-based access control with circuit breaker
 *   - Pilot phase with supply constraints
 */
contract C12USDTokenEnhanced is OFT, AccessControl, Pausable, ReentrancyGuard, ERC20FlashMint, ERC20Permit {

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant CIRCUIT_BREAKER_ROLE = keccak256("CIRCUIT_BREAKER_ROLE");
    bytes32 public constant FLASH_LOAN_ADMIN_ROLE = keccak256("FLASH_LOAN_ADMIN_ROLE");

    // Circuit breaker state
    bool public circuitBreakerTripped = false;

    // Treasury and liquidity strategy
    uint256 public constant TREASURY_INITIAL_MINT = 100_000_000 * 10**18; // 100 million C12USD for treasury
    uint256 public constant INITIAL_LIQUIDITY_POOL = 100 * 10**18; // $100 each for Uniswap and PancakeSwap

    // Pilot phase supply limit
    uint256 public constant PILOT_MAX_SUPPLY = 100 * 10**18; // 100 USD

    // Transaction limits (no daily limits for USD/stablecoin purchases)
    uint256 public constant MAX_TRANSACTION_LIMIT = 1_000_000 * 10**18; // 1 million C12USD per transaction

    // Flash loan configuration
    uint256 public flashLoanFee = 5; // 0.05% (5 basis points) - competitive with major protocols
    uint256 public constant MAX_FLASH_LOAN_FEE = 100; // 1.00% maximum fee (10000 basis points = 100%)
    uint256 public constant FEE_BASIS_POINTS = 10000; // 100.00% in basis points

    // Flash loan limits
    uint256 public maxFlashLoanAmount = type(uint256).max; // No limit by default
    bool public flashLoansEnabled = true;

    // Events
    event CircuitBreakerTripped(address indexed triggeredBy, string reason);
    event CircuitBreakerReset(address indexed resetBy);
    event PilotMint(address indexed to, uint256 amount, bytes32 indexed receiptHash);
    event PilotBurn(address indexed from, uint256 amount, bytes32 indexed receiptHash);

    // Flash loan events
    event FlashLoanFeeUpdated(uint256 oldFee, uint256 newFee);
    event FlashLoansToggled(bool enabled);
    event MaxFlashLoanAmountUpdated(uint256 oldAmount, uint256 newAmount);

    constructor(
        address _lzEndpoint,
        address _delegate,
        address _owner
    )
        OFT("C12USD", "C12USD", _lzEndpoint, _delegate)
        ERC20Permit("C12USD")
    {
        // Set up access control roles
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(MINTER_ROLE, _owner);
        _grantRole(BURNER_ROLE, _owner);
        _grantRole(PAUSER_ROLE, _owner);
        _grantRole(CIRCUIT_BREAKER_ROLE, _owner);
        _grantRole(FLASH_LOAN_ADMIN_ROLE, _owner);

        // Transfer ownership to the specified owner (OFT inherits from Ownable through OAppCore)
        _transferOwnership(_owner);
    }

    // =============================================================
    //                    PILOT PHASE FUNCTIONS
    // =============================================================

    function mintWithReceipt(
        address to,
        uint256 amount,
        bytes32 receiptHash
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused {
        require(!circuitBreakerTripped, "C12USD: Circuit breaker is active");
        require(amount <= MAX_TRANSACTION_LIMIT, "C12USD: Exceeds per-transaction limit");
        require(to != address(0), "C12USD: Cannot mint to zero address");
        require(amount > 0, "C12USD: Amount must be greater than zero");
        require(totalSupply() + amount <= PILOT_MAX_SUPPLY, "C12USD: Exceeds pilot max supply");

        _mint(to, amount);
        emit PilotMint(to, amount, receiptHash);
    }

    function treasuryMint(
        address treasury
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(totalSupply() == 0, "C12USD: Treasury mint only allowed at deployment");
        require(treasury != address(0), "C12USD: Cannot mint to zero address");

        _mint(treasury, TREASURY_INITIAL_MINT);
        emit PilotMint(treasury, TREASURY_INITIAL_MINT, keccak256("TREASURY_INITIAL_MINT"));
    }

    function burnWithReceipt(
        address from,
        uint256 amount,
        bytes32 receiptHash
    ) external onlyRole(BURNER_ROLE) nonReentrant whenNotPaused {
        require(!circuitBreakerTripped, "C12USD: Circuit breaker is active");
        require(amount <= MAX_TRANSACTION_LIMIT, "C12USD: Exceeds per-transaction limit");
        require(from != address(0), "C12USD: Cannot burn from zero address");
        require(amount > 0, "C12USD: Amount must be greater than zero");
        require(balanceOf(from) >= amount, "C12USD: Insufficient balance to burn");

        _burn(from, amount);
        emit PilotBurn(from, amount, receiptHash);
    }

    // =============================================================
    //                    FLASH LOAN FUNCTIONS
    // =============================================================

    /**
     * @dev Override maxFlashLoan to implement custom limits and circuit breaker
     */
    function maxFlashLoan(address token) public view virtual override returns (uint256) {
        if (!flashLoansEnabled || circuitBreakerTripped || token != address(this)) {
            return 0;
        }
        // Allow flash loans up to configured maximum (default: unlimited)
        return maxFlashLoanAmount;
    }

    /**
     * @dev Override flashFee to implement competitive fee structure
     * @param token The loan currency (must be this token)
     * @param amount The amount of tokens lent
     * @return The amount of `token` to be charged for the loan, on top of the returned principal
     */
    function flashFee(address token, uint256 amount) public view virtual override returns (uint256) {
        require(token == address(this), "C12USD: Flash loan token not supported");
        require(flashLoansEnabled && !circuitBreakerTripped, "C12USD: Flash loans not available");

        // Calculate fee: amount * flashLoanFee / FEE_BASIS_POINTS
        // Example: 1000 tokens * 5 / 10000 = 0.5 tokens (0.05% fee)
        return amount * flashLoanFee / FEE_BASIS_POINTS;
    }

    /**
     * @dev Override flashLoan to add additional security checks
     */
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) public virtual override nonReentrant whenNotPaused returns (bool) {
        require(!circuitBreakerTripped, "C12USD: Circuit breaker is active");
        require(flashLoansEnabled, "C12USD: Flash loans are disabled");
        require(token == address(this), "C12USD: Flash loan token not supported");
        require(amount <= maxFlashLoan(token), "C12USD: Amount exceeds max flash loan");

        return super.flashLoan(receiver, token, amount, data);
    }

    // =============================================================
    //                    ADMIN FUNCTIONS
    // =============================================================

    /**
     * @dev Set the flash loan fee (only admin)
     * @param newFee Fee in basis points (e.g., 5 = 0.05%, 100 = 1%)
     */
    function setFlashLoanFee(uint256 newFee) external onlyRole(FLASH_LOAN_ADMIN_ROLE) {
        require(newFee <= MAX_FLASH_LOAN_FEE, "C12USD: Fee too high");

        uint256 oldFee = flashLoanFee;
        flashLoanFee = newFee;

        emit FlashLoanFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Enable or disable flash loans
     */
    function setFlashLoansEnabled(bool enabled) external onlyRole(FLASH_LOAN_ADMIN_ROLE) {
        flashLoansEnabled = enabled;
        emit FlashLoansToggled(enabled);
    }

    /**
     * @dev Set maximum flash loan amount
     */
    function setMaxFlashLoanAmount(uint256 amount) external onlyRole(FLASH_LOAN_ADMIN_ROLE) {
        uint256 oldAmount = maxFlashLoanAmount;
        maxFlashLoanAmount = amount;
        emit MaxFlashLoanAmountUpdated(oldAmount, amount);
    }

    // =============================================================
    //                    CIRCUIT BREAKER
    // =============================================================

    function tripCircuitBreaker(string calldata reason)
        external
        onlyRole(CIRCUIT_BREAKER_ROLE)
    {
        require(!circuitBreakerTripped, "C12USD: Circuit breaker already active");
        circuitBreakerTripped = true;
        _pause();
        emit CircuitBreakerTripped(msg.sender, reason);
    }

    function resetCircuitBreaker() external onlyRole(CIRCUIT_BREAKER_ROLE) {
        require(circuitBreakerTripped, "C12USD: Circuit breaker not active");
        circuitBreakerTripped = false;
        _unpause();
        emit CircuitBreakerReset(msg.sender);
    }

    // =============================================================
    //                    PAUSABLE FUNCTIONS
    // =============================================================

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // =============================================================
    //                    VIEW FUNCTIONS
    // =============================================================

    function remainingPilotSupply() external view returns (uint256) {
        uint256 current = totalSupply();
        return current >= PILOT_MAX_SUPPLY ? 0 : PILOT_MAX_SUPPLY - current;
    }

    /**
     * @dev Get current flash loan configuration
     */
    function getFlashLoanConfig() external view returns (
        uint256 feeInBasisPoints,
        uint256 maxAmount,
        bool enabled
    ) {
        return (flashLoanFee, maxFlashLoanAmount, flashLoansEnabled && !circuitBreakerTripped);
    }

    // =============================================================
    //                    OVERRIDES
    // =============================================================

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(!circuitBreakerTripped, "C12USD: Circuit breaker is active");
        super._beforeTokenTransfer(from, to, amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Handle potential naming conflicts between inherited contracts
    function name() public view virtual override returns (string memory) {
        return "C12USD";
    }

    function symbol() public view virtual override returns (string memory) {
        return "C12USD";
    }
}