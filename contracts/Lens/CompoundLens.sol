pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "../CErc20.sol";
import "../CToken.sol";
import "../CTokenInterfaces.sol";
import "../PriceOracle.sol";
import "../EIP20Interface.sol";
import "../Governance/Comp.sol";

interface ComptrollerLensInterface {
    function markets(address) external view returns (bool, uint, bool, uint);
    function oracle() external view returns (PriceOracle);
    function getAccountLiquidity(address) external view returns (uint, uint, uint);
    function getAssetsIn(address) external view returns (CToken[] memory);
    function checkMembership(address account, CToken cToken) external view returns (bool);
    function claimComp(address) external;
    function compAccrued(address) external view returns (uint);
}

interface CSLPInterface {
    function claimSushi(address) external returns (uint);
}

interface CCTokenInterface {
    function claimComp(address) external returns (uint);
}

contract CompoundLens {
    struct CTokenMetadata {
        address cToken;
        uint exchangeRateCurrent;
        uint supplyRatePerBlock;
        uint borrowRatePerBlock;
        uint reserveFactorMantissa;
        uint totalBorrows;
        uint totalReserves;
        uint totalSupply;
        uint totalCash;
        uint totalCollateralTokens;
        bool isListed;
        uint collateralFactorMantissa;
        address underlyingAssetAddress;
        uint cTokenDecimals;
        uint underlyingDecimals;
        uint version;
        uint collateralCap;
        uint underlyingPrice;
    }

    function cTokenMetadataInternal(CToken cToken, ComptrollerLensInterface comptroller, PriceOracle priceOracle) internal returns (CTokenMetadata memory) {
        uint exchangeRateCurrent = cToken.exchangeRateCurrent();
        (bool isListed, uint collateralFactorMantissa, , uint version) = comptroller.markets(address(cToken));
        address underlyingAssetAddress;
        uint underlyingDecimals;
        uint collateralCap;
        uint totalCollateralTokens;

        if (compareStrings(cToken.symbol(), "crETH")) {
            underlyingAssetAddress = address(0);
            underlyingDecimals = 18;
        } else {
            CErc20 cErc20 = CErc20(address(cToken));
            underlyingAssetAddress = cErc20.underlying();
            underlyingDecimals = EIP20Interface(cErc20.underlying()).decimals();
        }

        if (version == 1) {
            collateralCap = CCollateralCapErc20Interface(address(cToken)).collateralCap();
            totalCollateralTokens = CCollateralCapErc20Interface(address(cToken)).totalCollateralTokens();
        }

        return CTokenMetadata({
            cToken: address(cToken),
            exchangeRateCurrent: exchangeRateCurrent,
            supplyRatePerBlock: cToken.supplyRatePerBlock(),
            borrowRatePerBlock: cToken.borrowRatePerBlock(),
            reserveFactorMantissa: cToken.reserveFactorMantissa(),
            totalBorrows: cToken.totalBorrows(),
            totalReserves: cToken.totalReserves(),
            totalSupply: cToken.totalSupply(),
            totalCash: cToken.getCash(),
            totalCollateralTokens: totalCollateralTokens,
            isListed: isListed,
            collateralFactorMantissa: collateralFactorMantissa,
            underlyingAssetAddress: underlyingAssetAddress,
            cTokenDecimals: cToken.decimals(),
            underlyingDecimals: underlyingDecimals,
            version: version,
            collateralCap: collateralCap,
            underlyingPrice: priceOracle.getUnderlyingPrice(cToken)
        });
    }

    function cTokenMetadata(CToken cToken) public returns (CTokenMetadata memory) {
        ComptrollerLensInterface comptroller = ComptrollerLensInterface(address(cToken.comptroller()));
        PriceOracle priceOracle = comptroller.oracle();
        return cTokenMetadataInternal(cToken, comptroller, priceOracle);
    }

    function cTokenMetadataAll(CToken[] calldata cTokens) external returns (CTokenMetadata[] memory) {
        uint cTokenCount = cTokens.length;
        require(cTokenCount > 0, "invalid input");
        CTokenMetadata[] memory res = new CTokenMetadata[](cTokenCount);
        ComptrollerLensInterface comptroller = ComptrollerLensInterface(address(cTokens[0].comptroller()));
        PriceOracle priceOracle = comptroller.oracle();
        for (uint i = 0; i < cTokenCount; i++) {
            require(address(comptroller) == address(cTokens[i].comptroller()), "mismatch comptroller");
            res[i] = cTokenMetadataInternal(cTokens[i], comptroller, priceOracle);
        }
        return res;
    }

    struct CTokenBalances {
        address cToken;
        uint balanceOf;
        uint borrowBalanceCurrent;
        uint balanceOfUnderlying;
        uint tokenBalance;
        uint tokenAllowance;
        uint collateralBalance;
        uint nativeTokenBalance;
    }

    function cTokenBalances(CToken cToken, address payable account) public returns (CTokenBalances memory) {
        uint balanceOf = cToken.balanceOf(account);
        uint borrowBalanceCurrent = cToken.borrowBalanceCurrent(account);
        uint balanceOfUnderlying = cToken.balanceOfUnderlying(account);
        address comptroller = address(cToken.comptroller());
        uint tokenBalance;
        uint tokenAllowance;
        uint collateralBalance;
        uint nativeTokenBalance = account.balance;

        if (compareStrings(cToken.symbol(), "crETH")) {
            tokenBalance = nativeTokenBalance;
            tokenAllowance = nativeTokenBalance;
        } else {
            CErc20 cErc20 = CErc20(address(cToken));
            EIP20Interface underlying = EIP20Interface(cErc20.underlying());
            tokenBalance = underlying.balanceOf(account);
            tokenAllowance = underlying.allowance(account, address(cToken));
        }

        if (ComptrollerLensInterface(comptroller).checkMembership(account, cToken)) {
            (, collateralBalance, , ) = cToken.getAccountSnapshot(account);
        }

        return CTokenBalances({
            cToken: address(cToken),
            balanceOf: balanceOf,
            borrowBalanceCurrent: borrowBalanceCurrent,
            balanceOfUnderlying: balanceOfUnderlying,
            tokenBalance: tokenBalance,
            tokenAllowance: tokenAllowance,
            collateralBalance: collateralBalance,
            nativeTokenBalance: nativeTokenBalance
        });
    }

    function cTokenBalancesAll(CToken[] calldata cTokens, address payable account) external returns (CTokenBalances[] memory) {
        uint cTokenCount = cTokens.length;
        CTokenBalances[] memory res = new CTokenBalances[](cTokenCount);
        for (uint i = 0; i < cTokenCount; i++) {
            res[i] = cTokenBalances(cTokens[i], account);
        }
        return res;
    }

    struct CTokenUnderlyingPrice {
        address cToken;
        uint underlyingPrice;
    }

    function cTokenUnderlyingPrice(CToken cToken) public returns (CTokenUnderlyingPrice memory) {
        ComptrollerLensInterface comptroller = ComptrollerLensInterface(address(cToken.comptroller()));
        PriceOracle priceOracle = comptroller.oracle();

        return CTokenUnderlyingPrice({
            cToken: address(cToken),
            underlyingPrice: priceOracle.getUnderlyingPrice(cToken)
        });
    }

    function cTokenUnderlyingPriceAll(CToken[] calldata cTokens) external returns (CTokenUnderlyingPrice[] memory) {
        uint cTokenCount = cTokens.length;
        CTokenUnderlyingPrice[] memory res = new CTokenUnderlyingPrice[](cTokenCount);
        for (uint i = 0; i < cTokenCount; i++) {
            res[i] = cTokenUnderlyingPrice(cTokens[i]);
        }
        return res;
    }

    struct AccountLimits {
        CToken[] markets;
        uint liquidity;
        uint shortfall;
    }

    function getAccountLimits(ComptrollerLensInterface comptroller, address account) public returns (AccountLimits memory) {
        (uint errorCode, uint liquidity, uint shortfall) = comptroller.getAccountLiquidity(account);
        require(errorCode == 0);

        return AccountLimits({
            markets: comptroller.getAssetsIn(account),
            liquidity: liquidity,
            shortfall: shortfall
        });
    }

    struct CompBalanceMetadata {
        uint balance;
        uint votes;
        address delegate;
    }

    function getCompBalanceMetadata(Comp comp, address account) external view returns (CompBalanceMetadata memory) {
        return CompBalanceMetadata({
            balance: comp.balanceOf(account),
            votes: uint256(comp.getCurrentVotes(account)),
            delegate: comp.delegates(account)
        });
    }

    struct CompBalanceMetadataExt {
        uint balance;
        uint votes;
        address delegate;
        uint allocated;
    }

    function getCompBalanceMetadataExt(Comp comp, ComptrollerLensInterface comptroller, address account) external returns (CompBalanceMetadataExt memory) {
        uint balance = comp.balanceOf(account);
        comptroller.claimComp(account);
        uint newBalance = comp.balanceOf(account);
        uint accrued = comptroller.compAccrued(account);
        uint total = add(accrued, newBalance, "sum comp total");
        uint allocated = sub(total, balance, "sub allocated");

        return CompBalanceMetadataExt({
            balance: balance,
            votes: uint256(comp.getCurrentVotes(account)),
            delegate: comp.delegates(account),
            allocated: allocated
        });
    }

    struct CompVotes {
        uint blockNumber;
        uint votes;
    }

    function getCompVotes(Comp comp, address account, uint32[] calldata blockNumbers) external view returns (CompVotes[] memory) {
        CompVotes[] memory res = new CompVotes[](blockNumbers.length);
        for (uint i = 0; i < blockNumbers.length; i++) {
            res[i] = CompVotes({
                blockNumber: uint256(blockNumbers[i]),
                votes: uint256(comp.getPriorVotes(account, blockNumbers[i]))
            });
        }
        return res;
    }

    function getClaimableSushiRewards(CSLPInterface[] calldata cTokens, address sushi, address account) external returns (uint[] memory) {
        uint cTokenCount = cTokens.length;
        uint[] memory rewards = new uint[](cTokenCount);
        for (uint i = 0; i < cTokenCount; i++) {
            uint balanceBefore = EIP20Interface(sushi).balanceOf(account);
            cTokens[i].claimSushi(account);
            uint balanceAfter = EIP20Interface(sushi).balanceOf(account);
            rewards[i] = sub(balanceAfter, balanceBefore, "subtraction underflow");
        }
        return rewards;
    }

    function getClaimableCompRewards(CCTokenInterface[] calldata cTokens, address comp, address account) external returns (uint[] memory) {
        uint cTokenCount = cTokens.length;
        uint[] memory rewards = new uint[](cTokenCount);
        for (uint i = 0; i < cTokenCount; i++) {
            uint balanceBefore = EIP20Interface(comp).balanceOf(account);
            cTokens[i].claimComp(account);
            uint balanceAfter = EIP20Interface(comp).balanceOf(account);
            rewards[i] = sub(balanceAfter, balanceBefore, "subtraction underflow");
        }
        return rewards;
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function add(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
        uint c = a + b;
        require(c >= a, errorMessage);
        return c;
    }

    function sub(uint a, uint b, string memory errorMessage) internal pure returns (uint) {
        require(b <= a, errorMessage);
        uint c = a - b;
        return c;
    }
}
