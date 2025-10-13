import { deployments, ethers, getNamedAccounts } from "hardhat";
const { parseEther } = ethers.utils;
const { execute, get } = deployments;

const markets = [
  // crToken address
  "0x98887ED12565cd9518f41A009d2EcE7c71ff271e",
  "0x8CfDf1048AaEdF83E17364263D76a732Fa80A025",
  "0xad2CE941B56D1a4415A7634851a1cF4Db1d3152A",
  "0xc1C7f818A8cD45742EAa068b188bFB0B37E3EFB1",
  "0xF3647b385089bb02211250548148068341d9b7Fe",
  "0x154077bFbdd3C100B57a40099C0399cb865E632A",
  "0x24De494e5119cC1a9a93677dE909eD4054cDF18a",
  "0x9060a9e7F010B24554aC3FF67D4A92B703F464Fe",
];

const cfs = [
  // collateral factors. For example: parseEther('0.75') is 75%
];

const rfs = [
  // reserve factors.
  // parseEther("0.2"),
  // parseEther("0.2"),
  // parseEther("0.2"),
  // parseEther("0.4"),
  // parseEther("0.4"),
  // parseEther("0.4"),
  parseEther("0.4"),
];

const sources = [
  // sources for Chainlink price feeds
];

async function main() {
  const { deployer } = await getNamedAccounts();

  const wrappedNativeMarket = "0xc1C7f818A8cD45742EAa068b188bFB0B37E3EFB1";

  // await execute(
  //   "PriceOracleProxyUSD",
  //   { from: deployer },
  //   "_setAggregators",
  //   markets,
  //   sources,
  //   Array(markets.length).fill(0)
  // );

  for (let i = 0; i < markets.length; i++) {
    // await execute("CTokenAdmin", { from: deployer }, "_setReserveFactor", markets[i], rfs[i]);
    await execute(
      "Comptroller",
      { from: deployer },
      "_supportMarket",
      markets[i],
      markets[i] == wrappedNativeMarket ? 2 : 1
    );
    // await execute('Comptroller', { from: deployer }, '_setCollateralFactor', markets[i], cfs[i]);
  }

  // await execute("FlashloanLender", { from: deployer }, "updateUnderlyingMapping", markets);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
