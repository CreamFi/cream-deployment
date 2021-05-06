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
  const CrBNB = await hre.ethers.getContractFactory("CEther");
  const CrTokenImpl = await hre.ethers.getContractFactory("CErc20Delegate");
  const CrBUSD = await hre.ethers.getContractFactory("CErc20Delegator");

  // Pre-deployed contracts
  const comptrollerImpl = Comptroller.attach("0x028337c13489DFf71f8afE9aa9D1D17969aA48b3");
  const interestRateModel = InterestRateModel.attach("0x54eCE7a254583D51935E9cec498CE9f971F45043");
  const crTokenImpl = CrTokenImpl.attach("0x1cB4e063e0Fd957BDB2B24134ee9577AB65eA878");

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

  const busdPrice = (await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=busd&vs_currencies=bnb")).data.busd.bnb;
  tx = await priceOracle.setDirectPrice(BUSD_ADDRESS, parseEther(busdPrice.toString()));

  const crBNB = await CrBNB.deploy(comptroller.address, interestRateModel.address, "200000000000000000000000000", "Cream BNB", "crBNB", 8, ownerAddress);
  const crBUSD = await CrBUSD.deploy(BUSD_ADDRESS, comptroller.address, interestRateModel.address, "200000000000000000000000000", "Cream BUSD", "crBUSD", 8, ownerAddress, crTokenImpl.address, "0x");

  await Promise.all([
    crBNB.deployed(),
    crBUSD.deployed(),
  ]);
  console.log("crBNB:", crBNB.address);
  console.log("crBUSD:", crBUSD.address);

  await comptroller._supportMarket(crBNB.address);
  await comptroller._supportMarket(crBUSD.address);

  await comptroller._setCollateralFactor(crBNB.address, parseEther('0.75'));
  // price must be set before giving collateral
  await tx.wait();
  await comptroller._setCollateralFactor(crBUSD.address, parseEther('0.8'));

  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
