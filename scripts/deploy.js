const hre = require("hardhat");
const axios = require("axios");
const { parseUnits } = require("ethers/lib/utils");

const parseEther = hre.ethers.utils.parseEther;

// TODO: deploy USDC
const USDC_ADDRESS = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C";

async function main() {
  const ownerAddress = (await hre.ethers.getSigners())[0].address;

  const Unitroller = await hre.ethers.getContractFactory("Unitroller");
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const InterestRateModel = await hre.ethers.getContractFactory("JumpRateModelV2");
  const PriceOracle = await hre.ethers.getContractFactory("SimplePriceOracle");
  const CrETH = await hre.ethers.getContractFactory("CEther");
  const CrTokenImpl = await hre.ethers.getContractFactory("CErc20Delegate");
  const CrUSDC = await hre.ethers.getContractFactory("CErc20Delegator");

  // Pre-deployed contracts
  // TODO: deploy these contracts and update to the right contract addresses
  const comptrollerImpl = Comptroller.attach("0x0a76187Cee5FBA5D018e8245dF9D85F1aFC467c3");
  const interestRateModel = InterestRateModel.attach("0xf16Cd14db1c297ba425b4E58E3c9D056f932f2B4");
  const crTokenImpl = CrTokenImpl.attach("0x35B6719972d6d4055E8b8C3424f812FC6DEf8AB7");
  // const cCapableErc20Delegate = CrTokenImpl.attach("0xC977C6427f255D0Ec38dA7fc6b46ecd9640eA2bF"); // with flashloan feature

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

  const usdcPrice = (await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=eth")).data["usd-coin"].eth;
  tx = await priceOracle.setDirectPrice(USDC_ADDRESS, parseUnits(usdcPrice.toString(), 18 + 18 - 6));

  const crETH = await CrETH.deploy(comptroller.address, interestRateModel.address, "200000000000000000000000000", "Cream Ether", "crETH", 8, ownerAddress);
  const crUSDC = await CrUSDC.deploy(USDC_ADDRESS, comptroller.address, interestRateModel.address, "200000000000000", "Cream USDC", "crUSDC", 8, ownerAddress, crTokenImpl.address, "0x");

  await Promise.all([
    crETH.deployed(),
    crUSDC.deployed(),
  ]);
  console.log("crETH:", crETH.address);
  console.log("crUSDC:", crUSDC.address);

  await comptroller._supportMarket(crETH.address, 0);
  await comptroller._supportMarket(crUSDC.address, 0);

  await comptroller._setCollateralFactor(crETH.address, parseEther('0.75'));
  // price must be set before giving collateral
  await tx.wait();
  await comptroller._setCollateralFactor(crUSDC.address, parseEther('0.8'));

  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
