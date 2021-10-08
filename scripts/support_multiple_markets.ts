import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseEther} = ethers.utils;
const {execute, get} = deployments;

const wrappedNativeMarket = '0xb3c68d69E95B095ab4b33B4cB67dBc0fbF3Edf56';

const markets = [
  '0xb3c68d69E95B095ab4b33B4cB67dBc0fbF3Edf56',
];

const cfs = [
  parseEther('0.75'),
];

const rfs = [
  parseEther('0.15')
];

const sources = [
  '0x0A77230d17318075983913bC2145DB16C7366156',
];


async function main() {
  const {deployer, wrappedNative} = await getNamedAccounts();
  const comptrollerAddress = (await get('Unitroller')).address;
  const majorIRMAddress = (await get('MajorIRM')).address;
  const cTokenAdminAddress = (await get('CTokenAdmin')).address;

  await execute('PriceOracleProxyUSD', { from: deployer }, '_setAggregators', markets, sources, Array(markets.length).fill(0));

  for (let i=0; i < markets.length; i++) {
    await execute('CTokenAdmin', { from: deployer }, '_setReserveFactor', markets[i], rfs[i]);
    await execute('Comptroller', { from: deployer }, '_supportMarket', markets[i], markets[i] == wrappedNativeMarket ? 2 : 1);
    // await execute('Comptroller', { from: deployer }, '_setCollateralFactor', markets[i], cfs[i]);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
