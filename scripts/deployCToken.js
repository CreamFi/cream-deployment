const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const adminAddress = "0x197939c1ca20C2b506d6811d8B6CDB3394471074";

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
