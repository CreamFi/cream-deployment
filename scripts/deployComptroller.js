const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const adminAddress = "0x197939c1ca20C2b506d6811d8B6CDB3394471074";
  const deployerAddress = (await hre.ethers.getSigners())[0].address;
  const posterAddress = "0xd830A7413CB25FEe57f8115CD64E565B0Be466c3";
  const ethUsdAggregatorAddress = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612";
  const flagsAddress = "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83";

  const Unitroller = await hre.ethers.getContractFactory("Unitroller");
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const Lens = await hre.ethers.getContractFactory("CompoundLens");
  const CTokenAdmin = await hre.ethers.getContractFactory("CTokenAdmin");
  const FlashloanLender = await hre.ethers.getContractFactory("FlashloanLender");
  const PriceOracleV1 = await hre.ethers.getContractFactory("PriceOracleV1");
  const PriceOracleProxy = await hre.ethers.getContractFactory("PriceOracleProxyUSD");

  const unitroller = await Unitroller.deploy();
  const comptrollerImpl = await Comptroller.deploy();
  const priceOracleV1 = await PriceOracleV1.deploy(posterAddress);

  await Promise.all([
    unitroller.deployed(),
    comptrollerImpl.deployed(),
    priceOracleV1.deployed()
  ]);
  console.log("Unitroller:", unitroller.address);
  console.log("Comptroller Impl:", comptrollerImpl.address);
  console.log("PriceOracleV1:", priceOracleV1.address);

  const priceOracleProxy = await PriceOracleProxy.deploy(
    deployerAddress,
    priceOracleV1.address,
    ethUsdAggregatorAddress,
    flagsAddress
  );
  console.log("PriceOracleProxy:", priceOracleProxy.address);

  const cTokenAdmin = await CTokenAdmin.deploy(adminAddress);
  console.log('cTokenAdmin:', cTokenAdmin.address);

  const lens = await Lens.deploy();
  console.log('Lens:', lens.address);

  const flashloanLender = await FlashloanLender.deploy(comptrollerAddress, deployerAddress);
  console.log('FlashloanLender:', flashloanLender.address);

  let tx = await unitroller._setPendingImplementation(comptrollerImpl.address);
  await tx.wait();
  tx = await comptrollerImpl._become(unitroller.address);
  await tx.wait();
  const comptroller = Comptroller.attach(unitroller.address);
  await comptroller._setCloseFactor(parseEther("0.5"));
  await comptroller._setLiquidationIncentive(parseEther("1.08"));
  await priceOracleProxy.deployed();
  await comptroller._setPriceOracle(priceOracle.address);

  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
