import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;

  const { deployer } = await getNamedAccounts();

  const cWrappedNative = await get("crWETH");

  await deploy("Maximillion", {
    from: deployer,
    args: [cWrappedNative.address],
    log: true,
  });
};
export default func;
func.tags = ["Maximillion"];
