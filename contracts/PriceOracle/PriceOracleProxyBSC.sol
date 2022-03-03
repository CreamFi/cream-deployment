pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./PriceOracle.sol";
import "./interfaces/BandReference.sol";
import "./interfaces/UniswapV2Interface.sol";
import "./interfaces/V1PriceOracleInterface.sol";
import "../CErc20.sol";
import "../CToken.sol";
import "../Exponential.sol";
import "../BEP20Interface.sol";

contract PriceOracleProxyBSC is PriceOracle, Exponential {
    /// @notice Admin address
    address public admin;

    /// @notice Guardian address
    address public guardian;

    struct ReferenceInfo {
        /// @notice The symbol used in reference
        string symbol;
        /// @notice It's being used or not.
        bool isUsed;
    }

    /// @notice Band Reference
    mapping(address => ReferenceInfo) public references;

    /// @notice The v1 price oracle, which will continue to serve prices for v1 assets
    V1PriceOracleInterface public v1PriceOracle;

    /// @notice The BAND oracle contract
    StdReferenceInterface public ref;

    /// @notice Check if the underlying address is Pancakeswap LP
    mapping(address => bool) public isUnderlyingLP;

    /// @notice crBNB address that has a constant price of 1e18
    address public cBnbAddress;

    /// @notice Quote symbol we used for BAND reference contract
    string public constant QUOTE_SYMBOL = "BNB";

    address public constant wbnbAddress = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;

    /**
     * @param admin_ The address of admin to set underlying symbols for BAND oracle
     * @param v1PriceOracle_ The address of the v1 price oracle, which will continue to operate and hold prices for collateral assets
     * @param reference_ The price reference contract, which will be served for our primary price source on BSC
     * @param cBnbAddress_ The address of cBNB, which will return a constant 1e18, since all prices relative to bnb
     */
    constructor(
        address admin_,
        address v1PriceOracle_,
        address reference_,
        address cBnbAddress_
    ) public {
        admin = admin_;
        v1PriceOracle = V1PriceOracleInterface(v1PriceOracle_);
        ref = StdReferenceInterface(reference_);
        cBnbAddress = cBnbAddress_;
    }

    /**
     * @notice Get the underlying price of a listed cToken asset
     * @param cToken The cToken to get the underlying price of
     * @return The underlying asset price mantissa (scaled by 1e18)
     */
    function getUnderlyingPrice(CToken cToken) public view returns (uint256) {
        address cTokenAddress = address(cToken);
        if (cTokenAddress == cBnbAddress) {
            // bnb always worth 1
            return 1e18;
        }

        address underlying = CErc20(cTokenAddress).underlying();
        if (isUnderlyingLP[underlying]) {
            return getLPFairPrice(underlying);
        }

        return getTokenPrice(underlying);
    }

    /*** Internal fucntions ***/

    /**
     * @notice Get the price of a specific token.
     * @param token The token to get the price of
     * @return The price
     */
    function getTokenPrice(address token) internal view returns (uint256) {
        if (token == wbnbAddress) {
            // wbnb always worth 1
            return 1e18;
        }

        // Get price from Band.
        ReferenceInfo storage referenceInfo = references[token];
        if (referenceInfo.isUsed) {
            uint256 price = getPriceFromBAND(referenceInfo.symbol);
            return getNormalizedPrice(price, token);
        }
        return getPriceFromV1(token);
    }

    /**
     * @notice Get price from BAND protocol.
     * @param symbol The symbol that used to get price of
     * @return The price, scaled by 1e18
     */
    function getPriceFromBAND(string memory symbol) internal view returns (uint256) {
        StdReferenceInterface.ReferenceData memory data = ref.getReferenceData(symbol, QUOTE_SYMBOL);
        require(data.rate > 0, "invalid price");

        // Price from BAND is always 1e18 base.
        return data.rate;
    }

    /**
     * @notice Get the fair price of a LP. We use the mechanism from Alpha Finance.
     *         Ref: https://blog.alphafinance.io/fair-lp-token-pricing/
     * @param pair The pair of AMM (Pancakeswap)
     * @return The price
     */
    function getLPFairPrice(address pair) internal view returns (uint256) {
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();
        uint256 totalSupply = IUniswapV2Pair(pair).totalSupply();
        (uint256 r0, uint256 r1, ) = IUniswapV2Pair(pair).getReserves();
        uint256 sqrtR = sqrt(mul_(r0, r1));
        uint256 p0 = getTokenPrice(token0);
        uint256 p1 = getTokenPrice(token1);
        uint256 sqrtP = sqrt(mul_(p0, p1));
        return div_(mul_(2, mul_(sqrtR, sqrtP)), totalSupply);
    }

    /**
     * @notice Normalize the price according to the token decimals.
     * @param price The original price
     * @param tokenAddress The token address
     * @return The normalized price.
     */
    function getNormalizedPrice(uint256 price, address tokenAddress) internal view returns (uint256) {
        uint256 underlyingDecimals = BEP20Interface(tokenAddress).decimals();
        return mul_(price, 10**(18 - underlyingDecimals));
    }

    /**
     * @notice Get price from v1 price oracle
     * @param token The token to get the price of
     * @return The price
     */
    function getPriceFromV1(address token) internal view returns (uint256) {
        return v1PriceOracle.assetPrices(token);
    }

    /*** Admin functions ***/

    event ReferenceUpdated(address tokenAddress, string symbol, bool isUsed);
    event IsLPUpdated(address tokenAddress, bool isLP);
    event SetGuardian(address guardian);
    event SetAdmin(address admin);

    /**
     * @notice Set guardian for price oracle proxy
     * @param _guardian The new guardian
     */
    function _setGuardian(address _guardian) external {
        require(msg.sender == admin, "only the admin may set new guardian");
        guardian = _guardian;
        emit SetGuardian(guardian);
    }

    /**
     * @notice Set admin for price oracle proxy
     * @param _admin The new admin
     */
    function _setAdmin(address _admin) external {
        require(msg.sender == admin, "only the admin may set new admin");
        admin = _admin;
        emit SetAdmin(admin);
    }

    /**
     * @notice See assets as LP tokens for multiple tokens
     * @param tokenAddresses The list of tokens
     * @param isLP The list of cToken properties (it's LP or not)
     */
    function _setLPs(address[] calldata tokenAddresses, bool[] calldata isLP) external {
        require(msg.sender == admin, "only the admin may set LPs");
        require(tokenAddresses.length == isLP.length, "mismatched data");
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            isUnderlyingLP[tokenAddresses[i]] = isLP[i];
            if (isLP[i]) {
                // Sanity check to make sure the token is LP.
                IUniswapV2Pair(tokenAddresses[i]).token0();
                IUniswapV2Pair(tokenAddresses[i]).token1();
            }
            emit IsLPUpdated(tokenAddresses[i], isLP[i]);
        }
    }

    /**
     * @notice Set Band references for multiple tokens
     * @param tokenAddresses The list of underlying tokens
     * @param symbols The list of symbols used by Band reference
     */
    function _setReferences(address[] calldata tokenAddresses, string[] calldata symbols) external {
        require(msg.sender == admin || msg.sender == guardian, "only the admin or guardian may set the references");
        require(tokenAddresses.length == symbols.length, "mismatched data");
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            bool isUsed;
            if (bytes(symbols[i]).length != 0) {
                require(msg.sender == admin, "guardian may only clear the reference");
                isUsed = true;

                // Make sure we could get the price.
                getPriceFromBAND(symbols[i]);
            }

            references[tokenAddresses[i]] = ReferenceInfo({symbol: symbols[i], isUsed: isUsed});
            emit ReferenceUpdated(tokenAddresses[i], symbols[i], isUsed);
        }
    }
}
