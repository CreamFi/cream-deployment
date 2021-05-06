const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const adminAddress = "0x197939c1ca20C2b506d6811d8B6CDB3394471074";

  const TripleSlopeRateModel = await hre.ethers.getContractFactory("TripleSlopeRateModel");

  const baseRate = 0;
  const multiplier = parseEther('0.23');
  const jump = parseEther('8');
  const kink1 = parseEther('0.8');
  const kink2 = parseEther('0.9');
  const roof = parseEther('1.5');
  const interestRateModel = await TripleSlopeRateModel.deploy(
    0,
    multiplier.mul(kink1).div(parseEther('1')),
    jump,
    kink1,
    kink2,
    roof,
    adminAddress
  );

  console.log('IRM:', interestRateModel.address);
  console.log('deployment success.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
