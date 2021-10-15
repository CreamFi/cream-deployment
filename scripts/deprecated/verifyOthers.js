const { run } = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

const adminAddress = '0x197939c1ca20C2b506d6811d8B6CDB3394471074';
const interestRateModelAddress = '0x3FaE5e5722C51cdb5B0afD8c7082e8a6AF336Ee8';
const cTokenImplAddress = '0x20d5d319C2964ecb52e1B006a4C059b7f6d6ad0a';
const cWrappedNativeImplAddress = '0x468a7BF78f11Da82c90b17a93adb7B14999aF5AB';

const baseRate = 0;
const multiplier = parseEther('0.15');
const jump = parseEther('5');
const kink1 = parseEther('0.8');
const kink2 = parseEther('0.9');
const roof = parseEther('1.5');

async function main() {
  // await run("verify:verify", {
  //   address: interestRateModelAddress,
  //   contract: "contracts/TripleSlopeRateModel.sol:TripleSlopeRateModel",
  //   constructorArguments: [baseRate, multiplier.mul(kink1).div(parseEther('1')), jump, kink1, kink2, roof, adminAddress]
  // });

  await run("verify:verify", {
    address: cTokenImplAddress,
    contract: "contracts/CCollateralCapErc20Delegate.sol:CCollateralCapErc20Delegate",
    constructorArguments: []
  });

  await run("verify:verify", {
    address: cWrappedNativeImplAddress,
    contract: "contracts/CWrappedNativeDelegate.sol:CWrappedNativeDelegate",
    constructorArguments: []
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
