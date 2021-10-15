const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const ownerAddress = (await hre.ethers.getSigners())[0].address;

  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const CrTokenImpl = await hre.ethers.getContractFactory("CErc20Delegate");
  const IRM = await hre.ethers.getContractFactory("JumpRateModelV2");
  const TT = await hre.ethers.getContractFactory("TestToken");

  // const comptrollerImpl = await Comptroller.deploy();
  // const crTokenImpl = await CrTokenImpl.deploy();
  // const irm = await IRM.deploy("0", "80000000000000000", "1200000000000000000", "800000000000000000", ownerAddress);
  const tt = await TT.deploy(ownerAddress);

  // await Promise.all([
  //   comptrollerImpl.deployed(),
  //   crTokenImpl.deployed(),
  //   irm.deployed()
  // ]);

  await tt.deployed();

  // console.log("compImpl:", comptrollerImpl.address);
  // console.log("crTokenImpl:", crTokenImpl.address);
  // console.log("irm:", irm.address);
  console.log('tt:', tt.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
