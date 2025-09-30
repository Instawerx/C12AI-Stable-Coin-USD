// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockFlashBorrower
 * @dev Mock contract for testing flash loans
 */
contract MockFlashBorrower is IERC3156FlashBorrower {

    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    enum Action { NORMAL, REENTRANCY, STEAL }
    Action public action = Action.NORMAL;

    event FlashLoanReceived(address token, uint256 amount, uint256 fee);

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {

        emit FlashLoanReceived(token, amount, fee);

        // Verify we received the tokens
        require(IERC20(token).balanceOf(address(this)) >= amount, "Flash loan not received");

        if (action == Action.REENTRANCY) {
            // Try to call flash loan again (should fail)
            IERC3156FlashLender(msg.sender).flashLoan(this, token, amount, data);
        } else if (action == Action.STEAL) {
            // Try to steal tokens (don't approve repayment)
            return CALLBACK_SUCCESS;
        }

        // Approve the lender to take the tokens back + fee
        uint256 repayAmount = amount + fee;
        require(IERC20(token).approve(msg.sender, repayAmount), "Approval failed");

        return CALLBACK_SUCCESS;
    }

    function setAction(Action _action) external {
        action = _action;
    }

    function executeFlashLoan(
        IERC3156FlashLender lender,
        address token,
        uint256 amount
    ) external {
        lender.flashLoan(this, token, amount, "");
    }
}