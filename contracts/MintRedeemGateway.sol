// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./C12USDTokenEnhanced.sol";

/**
 * @title MintRedeemGateway - Gateway for C12USD mint/redeem operations
 * @dev Handles mint and redeem operations based on signed receipts from off-chain services
 *
 * Features:
 * - Signature-based mint/redeem authorization
 * - Nonce-based replay attack prevention
 * - Role-based access control
 * - Integration with C12USD token contract
 */
contract MintRedeemGateway is AccessControl, Pausable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Role definitions
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Contract references
    C12USDTokenEnhanced public immutable c12usdToken;

    // Nonce tracking for replay protection
    mapping(bytes32 => bool) public usedNonces;

    // Events
    event MintExecuted(
        address indexed recipient,
        uint256 amount,
        bytes32 indexed receiptHash,
        bytes32 nonce
    );

    event RedeemExecuted(
        address indexed from,
        uint256 amount,
        bytes32 indexed receiptHash,
        bytes32 nonce
    );

    event NonceUsed(bytes32 indexed nonce);

    /**
     * @dev Constructor sets up the gateway with token contract reference
     * @param _c12usdToken Address of the C12USD token contract
     * @param _owner Initial owner/admin of the gateway
     */
    constructor(address _c12usdToken, address _owner) {
        require(_c12usdToken != address(0), "Gateway: Invalid token address");
        require(_owner != address(0), "Gateway: Invalid owner address");

        c12usdToken = C12USDTokenEnhanced(_c12usdToken);

        // Set up access control roles
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(SIGNER_ROLE, _owner);
        _grantRole(PAUSER_ROLE, _owner);
    }

    /**
     * @dev Executes a mint operation based on a signed receipt
     * @param recipient Address to receive the minted tokens
     * @param amount Amount of tokens to mint (18 decimals)
     * @param nonce Unique nonce to prevent replay attacks
     * @param expiryTime Timestamp when the receipt expires
     * @param receiptHash Hash of the original receipt data
     * @param signature Signature from authorized signer
     */
    function executeMint(
        address recipient,
        uint256 amount,
        bytes32 nonce,
        uint256 expiryTime,
        bytes32 receiptHash,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        require(recipient != address(0), "Gateway: Invalid recipient");
        require(amount > 0, "Gateway: Amount must be greater than zero");
        require(block.timestamp <= expiryTime, "Gateway: Receipt expired");
        require(!usedNonces[nonce], "Gateway: Nonce already used");

        // Verify signature
        bytes32 messageHash = _getMintMessageHash(
            recipient,
            amount,
            nonce,
            expiryTime,
            receiptHash
        );

        address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(messageHash), signature);
        require(hasRole(SIGNER_ROLE, signer), "Gateway: Invalid signature");

        // Mark nonce as used
        usedNonces[nonce] = true;
        emit NonceUsed(nonce);

        // Execute mint through token contract
        c12usdToken.mintWithReceipt(recipient, amount, receiptHash);

        emit MintExecuted(recipient, amount, receiptHash, nonce);
    }

    /**
     * @dev Executes a redeem operation based on a signed receipt
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (18 decimals)
     * @param nonce Unique nonce to prevent replay attacks
     * @param expiryTime Timestamp when the receipt expires
     * @param receiptHash Hash of the original receipt data
     * @param signature Signature from authorized signer
     */
    function executeRedeem(
        address from,
        uint256 amount,
        bytes32 nonce,
        uint256 expiryTime,
        bytes32 receiptHash,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        require(from != address(0), "Gateway: Invalid from address");
        require(amount > 0, "Gateway: Amount must be greater than zero");
        require(block.timestamp <= expiryTime, "Gateway: Receipt expired");
        require(!usedNonces[nonce], "Gateway: Nonce already used");

        // Verify signature
        bytes32 messageHash = _getRedeemMessageHash(
            from,
            amount,
            nonce,
            expiryTime,
            receiptHash
        );

        address signer = ECDSA.recover(ECDSA.toEthSignedMessageHash(messageHash), signature);
        require(hasRole(SIGNER_ROLE, signer), "Gateway: Invalid signature");

        // Mark nonce as used
        usedNonces[nonce] = true;
        emit NonceUsed(nonce);

        // Execute burn through token contract
        c12usdToken.burnWithReceipt(from, amount, receiptHash);

        emit RedeemExecuted(from, amount, receiptHash, nonce);
    }

    /**
     * @dev Pauses gateway operations (admin only)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses gateway operations (admin only)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Returns the message hash for mint operations
     */
    function _getMintMessageHash(
        address recipient,
        uint256 amount,
        bytes32 nonce,
        uint256 expiryTime,
        bytes32 receiptHash
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "MINT",
                recipient,
                amount,
                nonce,
                expiryTime,
                receiptHash
            )
        );
    }

    /**
     * @dev Returns the message hash for redeem operations
     */
    function _getRedeemMessageHash(
        address from,
        uint256 amount,
        bytes32 nonce,
        uint256 expiryTime,
        bytes32 receiptHash
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "REDEEM",
                from,
                amount,
                nonce,
                expiryTime,
                receiptHash
            )
        );
    }

    /**
     * @dev Allows checking if a nonce has been used (view function)
     */
    function isNonceUsed(bytes32 nonce) external view returns (bool) {
        return usedNonces[nonce];
    }

    /**
     * @dev Returns the contract version for upgrades
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}