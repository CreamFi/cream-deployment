const hre = require("hardhat");
const axios = require("axios");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const ownerAddress = (await hre.ethers.getSigners())[0].address;

  const Unitroller = await hre.ethers.getContractFactory("Unitroller");
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const InterestRateModel = await hre.ethers.getContractFactory("JumpRateModelV2");
  const PriceOracle = await hre.ethers.getContractFactory("SimplePriceOracle");
  const CrETH = await hre.ethers.getContractFactory("CEther");
  const CrTokenImpl = await hre.ethers.getContractFactory("CErc20Delegate");
  const CrToken = await hre.ethers.getContractFactory("CErc20Delegator");

  // // Pre-deployed contracts
  const comptrollerImpl = Comptroller.attach("0x3c2bbe1d652129b2d5786e51c88991998a894551");
  const interestRateModel = InterestRateModel.attach("0x494f09038e82ca8e5a4c1324c80f9401bcc138f9");
  const crTokenImpl = CrTokenImpl.attach("0x699ea595932e6e43158374710ef6b70eaf601fef");
  const testTokenAddress = "0x70B62aDf0d1f01fbffdbf2a0C5f27D3dbF76f6cC";

  // const unitroller = await Unitroller.deploy();
  // const priceOracle = await PriceOracle.deploy();

  // await Promise.all([
  //   unitroller.deployed(),
  //   priceOracle.deployed(),
  // ]);

  // console.log("Comptroller:", unitroller.address);
  // console.log("PriceOracle:", priceOracle.address);

  // let tx = await unitroller._setPendingImplementation(comptrollerImpl.address);
  // await tx.wait();
  // tx = await comptrollerImpl._become(unitroller.address);
  // await tx.wait();
  // const comptroller = Comptroller.attach(unitroller.address);
  // await comptroller._setCloseFactor(parseEther("0.5"));
  // await comptroller._setLiquidationIncentive(parseEther("1.08"));
  // await comptroller._setPriceOracle(priceOracle.address);

  // const crETH = await CrETH.deploy(comptroller.address, interestRateModel.address, "200000000000000000000000000", "Cream ETH", "crETH", 8, ownerAddress);

  // await crETH.deployed();
  // console.log("crETH:", crETH.address);

  const comptroller = Comptroller.attach("0x0E12d58F3860DCCE03a6930f505B72d88A6F6B2a");
  const crToken = await CrToken.deploy(testTokenAddress, comptroller.address, interestRateModel.address, "200000000000000000000000000", "Cream Test Token", "crTT", 8, ownerAddress, crTokenImpl.address, "0x");
  await crToken.deployed();
  console.log("crTT:", crToken.address);

  await comptroller._supportMarket(crETH.address);
  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
