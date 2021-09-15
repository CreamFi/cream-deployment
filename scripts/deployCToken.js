const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const adminAddress = "0x5b4058A9000e86fe136Ac896352C4DFD539E32a1";

  const CCollateralCapErc20Delegate = await hre.ethers.getContractFactory("CCollateralCapErc20Delegate");
  const cTokenImplementationAddress = (await CCollateralCapErc20Delegate.deploy()).address;

  const CWrappedNativeDelegate = await hre.ethers.getContractFactory("CWrappedNativeDelegate");
  const cWrappedNativeDelegateAddress = (await CWrappedNativeDelegate.deploy()).address;


  console.log('cTokenImpl:', cTokenImplementationAddress);
  console.log('cWrappedNativeImpl:', cWrappedNativeDelegateAddress);
  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
