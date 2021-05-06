const hre = require("hardhat");
const axios = require("axios");

const parseEther = hre.ethers.utils.parseEther;
const BUSD_ADDRESS = "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee";

async function main() {
  const ownerAddress = (await hre.ethers.getSigners())[0].address;

  const Unitroller = await hre.ethers.getContractFactory("Unitroller");
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const InterestRateModel = await hre.ethers.getContractFactory("JumpRateModelV2");
  const PriceOracle = await hre.ethers.getContractFactory("SimplePriceOracle");
  const CrETH = await hre.ethers.getContractFactory("CEther");
  // const CrTokenImpl = await hre.ethers.getContractFactory("CErc20Delegate");
  // const CrBUSD = await hre.ethers.getContractFactory("CErc20Delegator");

  // Pre-deployed contracts
  const comptrollerImpl = Comptroller.attach("0x699ea595932e6e43158374710ef6b70eaf601fef");
  const interestRateModel = InterestRateModel.attach("0x494F09038E82CA8E5a4C1324c80F9401Bcc138F9");
  // const crTokenImpl = CrTokenImpl.attach("0x1cB4e063e0Fd957BDB2B24134ee9577AB65eA878");

  const unitroller = await Unitroller.deploy();
  const priceOracle = await PriceOracle.deploy();

  await Promise.all([
    unitroller.deployed(),
    priceOracle.deployed(),
  ]);

  console.log("Comptroller:", unitroller.address);
  console.log("PriceOracle:", priceOracle.address);

  let tx = await unitroller._setPendingImplementation(comptrollerImpl.address);
  await tx.wait();
  tx = await comptrollerImpl._become(unitroller.address);
  await tx.wait();
  const comptroller = Comptroller.attach(unitroller.address);
  await comptroller._setCloseFactor(parseEther("0.5"));
  await comptroller._setLiquidationIncentive(parseEther("1.08"));
  await comptroller._setPriceOracle(priceOracle.address);

  const crETH = await CrETH.deploy(comptroller.address, interestRateModel.address, "200000000000000000000000000", "Cream ETH", "crETH", 8, ownerAddress);

  await crETH.deployed();
  console.log("crETH:", crETH.address);

  await comptroller._supportMarket(crETH.address);
  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
