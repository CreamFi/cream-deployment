const { run } = require("hardhat");

const adminAddress = "0x197939c1ca20C2b506d6811d8B6CDB3394471074";
const deployerAddress = '0x11df15F0C90524D3644843e1A137095373138F5a';
const unitrollerAddress = '0xbadaC56c9aca307079e8B8FC699987AAc89813ee';
const comptrollerImpAddress = '0xcc3E89fBc10e155F1164f8c9Cf0703aCDe53f6Fd';
const posterAddress = "0xd830A7413CB25FEe57f8115CD64E565B0Be466c3";
const priceOracleV1Address = '0x20ca53e2395fa571798623f1cfbd11fe2c114c24';
const ethUsdAggregatorAddress = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612";
const flagsAddress = "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83";
const priceOracleProxyAddress = '0xE82225bA6BeD28406912522F01C7102DD9f07e78';
const cTokenAdminAddress = '0x5b4058A9000e86fe136Ac896352C4DFD539E32a1';
const lensAddress = '0x139Dd8Bb6355d20342e08ff013150b1aE5040a42';
const flashloanLenderAddress = '0x4eCEDdF62277eD78623f9A94995c680f8fd6C00e';

async function main() {
  await run("verify:verify", {
    address: unitrollerAddress,
    contract: "contracts/Unitroller.sol:Unitroller",
    constructorArguments: []
  });

  await run("verify:verify", {
    address: comptrollerImpAddress,
    contract: "contracts/Comptroller.sol:Comptroller",
    constructorArguments: []
  });

  await run("verify:verify", {
    address: priceOracleV1Address,
    contract: "contracts/PriceOracle/v1PriceOracle.sol:PriceOracleV1",
    constructorArguments: [posterAddress]
  });

  await run("verify:verify", {
    address: priceOracleProxyAddress,
    contract: "contracts/PriceOracle/PriceOracleProxyUSD.sol:PriceOracleProxyUSD",
    constructorArguments: [deployerAddress, priceOracleV1Address, ethUsdAggregatorAddress, flagsAddress]
  });

  await run("verify:verify", {
    address: cTokenAdminAddress,
    contract: "contracts/CTokenAdmin.sol:CTokenAdmin",
    constructorArguments: [adminAddress]
  });

  await run("verify:verify", {
    address: lensAddress,
    contract: "contracts/Lens/CompoundLens.sol:CompoundLens",
    constructorArguments: []
  });

  await run("verify:verify", {
    address: flashloanLenderAddress,
    contract: "contracts/FlashloanLender.sol:FlashloanLender",
    constructorArguments: [unitrollerAddress, deployerAddress]
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
