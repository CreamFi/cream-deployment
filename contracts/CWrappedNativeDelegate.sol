pragma solidity ^0.5.16;

import "./CWrappedNative.sol";

/**
 * @title Cream's CWrappedNativeDelegate Contract
 * @notice CTokens which wrap an EIP-20 underlying and are delegated to
 * @author Cream
 */
contract CWrappedNativeDelegate is CWrappedNative {
    /**
     * @notice Construct an empty delegate
     */
    constructor() public {}

    /**
     * @notice Called by the delegator on a delegate to initialize it for duty
     * @param data The encoded bytes data for any initialization
     */
    function _becomeImplementation(bytes memory data) public {
        // Shh -- currently unused
        data;

        // Shh -- we don't ever want this hook to be marked pure
        if (false) {
            implementation = address(0);
        }

        require(msg.sender == admin, "admin only");

        // Set CToken version in comptroller and convert native token to wrapped token.
        ComptrollerInterfaceExtension(address(comptroller)).updateCTokenVersion(
            address(this),
            ComptrollerV2Storage.Version.WRAPPEDNATIVE
        );
        uint256 balance = address(this).balance;
        if (balance > 0) {
            WrappedNativeInterface(underlying).deposit.value(balance)();
        }
    }

    /**
     * @notice Called by the delegator on a delegate to forfeit its responsibility
     */
    function _resignImplementation() public {
        // Shh -- we don't ever want this hook to be marked pure
        if (false) {
            implementation = address(0);
        }

        require(msg.sender == admin, "admin only");
    }
}
