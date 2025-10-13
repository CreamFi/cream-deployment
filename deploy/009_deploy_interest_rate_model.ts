import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const parseEther = hre.ethers.utils.parseEther;

  const { deployer, admin } = await getNamedAccounts();

  let baseRate = parseEther("0.01");
  let multiplier = parseEther("0.15");
  let jump = parseEther("5");
  let kink1 = parseEther("0.9");
  let kink2 = parseEther("0.9");
  let roof = parseEther("1");

  await deploy("StableIRM", {
    from: deployer,
    contract: "TripleSlopeRateModel",
    args: [baseRate, multiplier.mul(kink1).div(parseEther("1")), jump, kink1, kink2, roof, admin],
    log: true,
  });

  // multiplier = parseEther("0.06");
  // jump = parseEther("2");
  // kink1 = parseEther("0.7");
  // kink2 = parseEther("0.7");

  // await deploy("MajorIRM", {
  //   from: deployer,
  //   contract: "TripleSlopeRateModel",
  //   args: [baseRate, multiplier.mul(kink1).div(parseEther("1")), jump, kink1, kink2, roof, admin],
  //   log: true,
  // });

  // baseRate = parseEther("0.05");
  // multiplier = parseEther("0.4");
  // jump = parseEther("2.5");
  // kink1 = parseEther("0.5");
  // kink2 = parseEther("0.5");

  // await deploy("MemeIRM", {
  //   from: deployer,
  //   contract: "TripleSlopeRateModel",
  //   args: [baseRate, multiplier.mul(kink1).div(parseEther("1")), jump, kink1, kink2, roof, admin],
  //   log: true,
  // });
};
export default func;
func.tags = ["InterestRateModel"];
