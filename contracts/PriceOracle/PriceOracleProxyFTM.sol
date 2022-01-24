pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./PriceOracle.sol";
import "./interfaces/AggregatorV3Interface.sol";
import "./interfaces/BandReference.sol";
import "./interfaces/V1PriceOracleInterface.sol";
import "../CErc20.sol";
import "../CToken.sol";
import "../Exponential.sol";
import "../EIP20Interface.sol";

contract PriceOracleProxyFTM is PriceOracle, Exponential {
    /// @notice Admin address
    address public admin;

    /// @notice Guardian address
    address public guardian;

    struct AggregatorInfo {
        /// @notice The aggregator
        address aggregator;
        /// @notice It's being used or not.
        bool isUsed;
    }

    struct ReferenceInfo {
        /// @notice The symbol used in reference
        string symbol;
        /// @notice It's being used or not.
        bool isUsed;
    }

    /// @notice BAND reference
    StdReferenceInterface public ref;

    /// @notice Chainlink Aggregators
    mapping(address => AggregatorInfo) public aggregators;

    /// @notice Band Reference
    mapping(address => ReferenceInfo) public references;

    /// @notice The v1 price oracle, maintain by CREAM
    V1PriceOracleInterface public v1PriceOracle;

    /// @notice Quote symbol we used for BAND reference contract
    string public constant QUOTE_SYMBOL = "USD";

    /**
     * @param admin_ The address of admin to set aggregators
     * @param v1PriceOracle_ The address of the v1 price oracle, which will continue to operate and hold prices for collateral assets
     * @param reference_ The price reference contract, which will be served for one of our primary price source on Fantom
     */
    constructor(
        address admin_,
        address v1PriceOracle_,
        address reference_
    ) public {
        admin = admin_;
        v1PriceOracle = V1PriceOracleInterface(v1PriceOracle_);
        ref = StdReferenceInterface(reference_);
    }

    /**
     * @notice Get the underlying price of a listed cToken asset
     * @param cToken The cToken to get the underlying price of
     * @return The underlying asset price mantissa (scaled by 1e18)
     */
    function getUnderlyingPrice(CToken cToken) public view returns (uint256) {
        address underlying = CErc20(address(cToken)).underlying();

        // Get price from ChainLink.
        AggregatorInfo storage aggregatorInfo = aggregators[underlying];
        if (aggregatorInfo.isUsed) {
            uint256 price = getPriceFromChainlink(aggregatorInfo.aggregator);
            return getNormalizedPrice(price, underlying);
        }

        // Get price from Band.
        ReferenceInfo storage referenceInfo = references[underlying];
        if (referenceInfo.isUsed) {
            uint256 price = getPriceFromBAND(referenceInfo.symbol);
            return getNormalizedPrice(price, underlying);
        }

        // Get price from v1.
        return getPriceFromV1(underlying);
    }

    /*** Internal fucntions ***/

    /**
     * @notice Get price from ChainLink.
     * @param aggregator The aggregator address
     * @return The price, scaled by 1e18
     */
    function getPriceFromChainlink(address aggregator) internal view returns (uint256) {
        (, int256 price, , , ) = AggregatorV3Interface(aggregator).latestRoundData();
        require(price > 0, "invalid price");

        // Extend the decimals to 1e18.
        return mul_(uint256(price), 10**(18 - uint256(AggregatorV3Interface(aggregator).decimals())));
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
     * @notice Normalize the price according to the token decimals.
     * @param price The original price
     * @param tokenAddress The token address
     * @return The normalized price.
     */
    function getNormalizedPrice(uint256 price, address tokenAddress) internal view returns (uint256) {
        uint256 underlyingDecimals = EIP20Interface(tokenAddress).decimals();
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

    /*** Admin fucntions ***/

    event AggregatorUpdated(address tokenAddress, address aggregator, bool isUsed);
    event ReferenceUpdated(address tokenAddress, string symbol, bool isUsed);
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
     * @notice Set ChainLink aggregators for multiple tokens
     * @param tokenAddresses The list of underlying tokens
     * @param aggregatorAddresses The list of ChainLink aggregator addresses
     */
    function _setAggregators(address[] calldata tokenAddresses, address[] calldata aggregatorAddresses) external {
        require(msg.sender == admin || msg.sender == guardian, "only the admin or guardian may set the aggregators");
        require(tokenAddresses.length == aggregatorAddresses.length, "mismatched data");
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            bool isUsed;
            if (aggregatorAddresses[i] != address(0)) {
                require(msg.sender == admin, "guardian may only clear the aggregator");
                isUsed = true;

                // Make sure the aggregator exists.
                getPriceFromChainlink(aggregatorAddresses[i]);
            }
            aggregators[tokenAddresses[i]] = AggregatorInfo({aggregator: aggregatorAddresses[i], isUsed: isUsed});
            emit AggregatorUpdated(tokenAddresses[i], aggregatorAddresses[i], isUsed);
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
