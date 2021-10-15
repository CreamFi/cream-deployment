const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

const adminAddress = "0x0a4AcCD9D150AD4DDC7eA2e6151243CE668Bf2f5";
const comptrollerAddress = "0x66e9c76b76F73B7F04108E26d201bC4023386Fa6";
const cTokenImplementationAddress = "0x79EA17bEE0a8dcb900737E8CAa247c8358A5dfa1";
const cWrappedNativeDelegateAddress = "0x98d6AFDA3A488bB8B080c66009326466e986D583";

const wETHAddress = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";


const majorIRMAddress = "0x0980f2F0D2af35eF2c4521b2342D59db575303F7";
const stableIRMAddress = "0x379555965fcdbA7A40e8B5b5eF4786f51ADeeF31";

const underlyingAddress = "0x1741B9C475e0861a43B03F984928082Ac4f3fB95";
const exchangeRate1e6 = "200000000000000";
const exchangeRate1e18 = "200000000000000000000000000";
const crName = "Cream Chainlink";
const crSymbol = "crLINK";

async function main() {
  const CrETH = await hre.ethers.getContractFactory("CWrappedNativeDelegator");
  const crETH = await CrETH.deploy(
    wETHAddress,
    comptrollerAddress,
    majorIRMAddress,
    exchangeRate1e18,
    "Cream Avalanche",
    "crAVAX",
    8,
    adminAddress,
    cWrappedNativeDelegateAddress,
    "0x"
  );
  console.log("crETH deployed:", crETH.address);

  // const CrToken = await hre.ethers.getContractFactory("CCollateralCapErc20Delegator");
  // const crToken = await CrToken.deploy(
  //   underlyingAddress,
  //   comptrollerAddress,
  //   majorIRMAddress,
  //   exchangeRate1e18,
  //   crName,
  //   crSymbol,
  //   8,
  //   adminAddress,
  //   cTokenImplementationAddress,
  //   "0x"
  // );
  // console.log(crSymbol, "deployed:", crToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
