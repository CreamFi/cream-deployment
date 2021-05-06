import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseEther} = ethers.utils;
const {execute, get} = deployments;

const markets = [
  // crToken address
];

const cfs = [
  // collateral factors. For example: parseEther('0.75') is 75%
];

const rfs = [
  // reserve factors.
];

const sources = [
  // sources for Chainlink price feeds
];


async function main() {
  const {deployer} = await getNamedAccounts();

  const wrappedNativeMarket = '';

  await execute('PriceOracleProxyUSD', { from: deployer }, '_setAggregators', markets, sources, Array(markets.length).fill(0));

  for (let i=0; i < markets.length; i++) {
    await execute('CTokenAdmin', { from: deployer }, '_setReserveFactor', markets[i], rfs[i]);
    await execute('Comptroller', { from: deployer }, '_supportMarket', markets[i], markets[i] == wrappedNativeMarket ? 2 : 1);
    // await execute('Comptroller', { from: deployer }, '_setCollateralFactor', markets[i], cfs[i]);
  }

  await execute('FlashloanLender', { from: deployer }, 'updateUnderlyingMapping', markets);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
