import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseEther} = ethers.utils;
const {execute, get} = deployments;

const markets = [
  '0x338EEE1F7B89CE6272f302bDC4b952C13b221f1d',
  '0xCEb1cE674f38398432d20bc8f90345E91Ef46fd3',
  '0xe28965073C49a02923882B8329D3E8C1D805E832',
  '0x085682716f61a72bf8C573FBaF88CCA68c60E99B',
  '0xB09b75916C5F4097C8b5812E63e216FEF97661Fc',
  '0x18931772Adb90e7f214B6CbC78DdD6E0F090D4B1'
];

const cfs = [
  parseEther('0.75'),
  parseEther('0.75'),
  parseEther('0.75'),
  parseEther('0.75'),
  parseEther('0.75'),
  parseEther('0.45'),
];

const rfs = [
  parseEther('0.20'),
  parseEther('0.15'),
  parseEther('0.15'),
  parseEther('0.15'),
  parseEther('0.20'),
  parseEther('0.40'),
];

const sources = [
  '0x976B3D034E162d8bD72D6b9C989d545b839003b0',
  '0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a',
  '0xF096872672F44d6EBA71458D74fe67F9a77a23B9',
  '0x51D7180edA2260cc4F6e4EebB82FEF5c3c2B8300',
  '0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743',
  '0x49ccd9ca821EfEab2b98c60dC60F518E765EDe9a',
];


async function main() {
  const {deployer} = await getNamedAccounts();

  const wrappedNativeMarket = '0xb3c68d69E95B095ab4b33B4cB67dBc0fbF3Edf56';

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
