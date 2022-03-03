pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./CCapableErc20Delegate.sol";
import "../BEP20Interface.sol";

// Ref: https://bscscan.com/address/73feaa1ee314f8c655e354234017be2193c9e24e#code
interface IMasterChef {
    struct PoolInfo {
        address lpToken;
    }

    struct UserInfo {
        uint256 amount;
    }

    function deposit(uint256, uint256) external;

    function withdraw(uint256, uint256) external;

    function cake() external view returns (address);

    function poolInfo(uint256) external view returns (PoolInfo memory);

    function userInfo(uint256, address) external view returns (UserInfo memory);

    function pendingCake(uint256, address) external view returns (uint256);
}

/**
 * @title Cream's CCakeLP's Contract
 * @notice CToken which wraps Pancake's LP token
 * @author Cream
 */
contract CCakeLPDelegate is CCapableErc20Delegate {
    /**
     * @notice MasterChef address
     */
    address public masterChef;

    /**
     * @notice Cake token address
     */
    address public cake;

    /**
     * @notice Pool ID of this LP in MasterChef
     */
    uint256 public pid;

    /**
     * @notice Container for cake rewards state
     * @member balance The balance of cake
     * @member index The last updated index
     */
    struct CakeRewardState {
        uint256 balance;
        uint256 index;
    }

    /**
     * @notice The state of CakeLP supply
     */
    CakeRewardState public clpSupplyState;

    /**
     * @notice The index of every CakeLP supplier
     */
    mapping(address => uint256) public clpSupplierIndex;

    /**
     * @notice The CAKE amount of every user
     */
    mapping(address => uint256) public cakeUserAccrued;

    /**
     * @notice Delegate interface to become the implementation
     * @param data The encoded arguments for becoming
     */
    function _becomeImplementation(bytes memory data) public {
        super._becomeImplementation(data);

        (address masterChefAddress_, uint256 pid_) = abi.decode(data, (address, uint256));
        masterChef = masterChefAddress_;
        cake = IMasterChef(masterChef).cake();

        IMasterChef.PoolInfo memory poolInfo = IMasterChef(masterChef).poolInfo(pid_);
        require(poolInfo.lpToken == underlying, "mismatch underlying token");
        pid = pid_;

        // Approve moving our CakeLP into the master chef contract.
        BEP20Interface(underlying).approve(masterChefAddress_, uint256(-1));
    }

    /**
     * @notice Manually claim cake rewards by user
     * @return The amount of cake rewards user claims
     */
    function claimCake(address account) public returns (uint256) {
        harvestCake();

        updateCakeLPSupplyIndex();
        updateSupplierIndex(account);

        // Get user's cake accrued.
        uint256 cakeBalance = cakeUserAccrued[account];
        if (cakeBalance > 0) {
            // Transfer user cake and subtract the balance in supplyState
            BEP20Interface(cake).transfer(account, cakeBalance);
            clpSupplyState.balance = sub_(clpSupplyState.balance, cakeBalance);

            // Clear user's cake accrued.
            cakeUserAccrued[account] = 0;

            return cakeBalance;
        }
        return 0;
    }

    /*** CToken Overrides ***/

    /**
     * @notice Transfer `tokens` tokens from `src` to `dst` by `spender`
     * @param spender The address of the account performing the transfer
     * @param src The address of the source account
     * @param dst The address of the destination account
     * @param tokens The number of tokens to transfer
     * @return Whether or not the transfer succeeded
     */
    function transferTokens(
        address spender,
        address src,
        address dst,
        uint256 tokens
    ) internal returns (uint256) {
        harvestCake();

        updateCakeLPSupplyIndex();
        updateSupplierIndex(src);
        updateSupplierIndex(dst);

        return super.transferTokens(spender, src, dst, tokens);
    }

    /*** Safe Token ***/

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @return The quantity of underlying tokens owned by this contract
     */
    function getCashPrior() internal view returns (uint256) {
        IMasterChef.UserInfo memory userInfo = IMasterChef(masterChef).userInfo(pid, address(this));
        return userInfo.amount;
    }

    /**
     * @notice Transfer the underlying to this contract and sweep into master chef
     * @param from Address to transfer funds from
     * @param amount Amount of underlying to transfer
     * @return The actual amount that is transferred
     */
    function doTransferIn(address from, uint256 amount) internal returns (uint256) {
        // Perform the EIP-20 transfer in
        BEP20Interface token = BEP20Interface(underlying);
        require(token.transferFrom(from, address(this), amount), "unexpected EIP-20 transfer in return");

        // Deposit to masterChef.
        IMasterChef(masterChef).deposit(pid, amount);

        updateCakeLPSupplyIndex();
        updateSupplierIndex(from);

        return amount;
    }

    /**
     * @notice Transfer the underlying from this contract, after sweeping out of master chef
     * @param to Address to transfer funds to
     * @param amount Amount of underlying to transfer
     */
    function doTransferOut(address payable to, uint256 amount) internal {
        // Withdraw the underlying tokens from masterChef.
        IMasterChef(masterChef).withdraw(pid, amount);

        updateCakeLPSupplyIndex();
        updateSupplierIndex(to);

        BEP20Interface token = BEP20Interface(underlying);
        require(token.transfer(to, amount), "unexpected EIP-20 transfer out return");
    }

    /*** Internal functions ***/

    function harvestCake() internal {
        // Deposit 0 CakeLP into MasterChef to claim cake rewards.
        IMasterChef(masterChef).deposit(pid, 0);
    }

    function updateCakeLPSupplyIndex() internal {
        uint256 cakeBalance = cakeBalance();
        uint256 cakeAccrued = sub_(cakeBalance, clpSupplyState.balance);
        uint256 supplyTokens = CToken(address(this)).totalSupply();
        Double memory ratio = supplyTokens > 0 ? fraction(cakeAccrued, supplyTokens) : Double({mantissa: 0});
        Double memory index = add_(Double({mantissa: clpSupplyState.index}), ratio);

        // Update clpSupplyState.
        clpSupplyState.index = index.mantissa;
        clpSupplyState.balance = cakeBalance;
    }

    function updateSupplierIndex(address supplier) internal {
        Double memory supplyIndex = Double({mantissa: clpSupplyState.index});
        Double memory supplierIndex = Double({mantissa: clpSupplierIndex[supplier]});
        Double memory deltaIndex = sub_(supplyIndex, supplierIndex);
        if (deltaIndex.mantissa > 0) {
            uint256 supplierTokens = CToken(address(this)).balanceOf(supplier);
            uint256 supplierDelta = mul_(supplierTokens, deltaIndex);
            cakeUserAccrued[supplier] = add_(cakeUserAccrued[supplier], supplierDelta);
            clpSupplierIndex[supplier] = supplyIndex.mantissa;
        }
    }

    function cakeBalance() internal view returns (uint256) {
        return BEP20Interface(cake).balanceOf(address(this));
    }
}
