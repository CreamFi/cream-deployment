const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

const adminAddress = "0x5b4058A9000e86fe136Ac896352C4DFD539E32a1";
const comptrollerAddress = "0xbadaC56c9aca307079e8B8FC699987AAc89813ee";
const cTokenImplementationAddress = "0x20d5d319C2964ecb52e1B006a4C059b7f6d6ad0a";
const cWrappedNativeDelegateAddress = "0x468a7BF78f11Da82c90b17a93adb7B14999aF5AB";

const wETHAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";


const majorIRMAddress = "0x3FaE5e5722C51cdb5B0afD8c7082e8a6AF336Ee8";
const stableIRMAddress = "0x7ef18d0a9C3Fb1A716FF6c3ED0Edf52a2427F716";

const underlyingAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const initialExchangeRate = "200000000000000";
const crName = "Cream Tether USD";
const crSymbol = "crUSDT";

async function main() {
  // const CrETH = await hre.ethers.getContractFactory("CWrappedNativeDelegator");
  // const crETH = await CrETH.deploy(
  //   wETHAddress,
  //   comptrollerAddress,
  //   majorIRMAddress,
  //   "200000000000000000000000000",
  //   "Cream Ether",
  //   "crETH",
  //   8,
  //   adminAddress,
  //   cWrappedNativeDelegateAddress,
  //   "0x"
  // );
  // console.log("crETH deployed:", crETH.address);

  const CrToken = await hre.ethers.getContractFactory("CCollateralCapErc20Delegator");
  const crToken = await CrToken.deploy(
    underlyingAddress,
    comptrollerAddress,
    stableIRMAddress,
    initialExchangeRate,
    crName,
    crSymbol,
    8,
    adminAddress,
    cTokenImplementationAddress,
    "0x"
  );
  console.log(crSymbol, "deployed:", crToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
