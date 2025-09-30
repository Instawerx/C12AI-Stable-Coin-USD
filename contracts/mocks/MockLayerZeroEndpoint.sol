// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockLayerZeroEndpoint
 * @dev Simple mock for LayerZero endpoint for testing purposes
 */
contract MockLayerZeroEndpoint {

    mapping(address => address) public delegates;

    event DelegateSet(address indexed oapp, address indexed delegate);

    function setDelegate(address _delegate) external {
        delegates[msg.sender] = _delegate;
        emit DelegateSet(msg.sender, _delegate);
    }

    function getDelegate(address _oapp) external view returns (address) {
        return delegates[_oapp];
    }

    // Mock function to satisfy LayerZero interface requirements
    function send(
        bytes calldata,
        bytes calldata
    ) external payable {
        // Mock implementation - does nothing in tests
    }
}