import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute } = deployments;

  const { deployer, feedRegistry, guardian } = await getNamedAccounts();

  await deploy("PriceOracleProxyUSD", {
    from: deployer,
    args: [deployer, feedRegistry],
    log: true,
  });

  await execute("PriceOracleProxyUSD", { from: deployer, log: true }, "_setGuardian", guardian);
};
export default func;
func.tags = ["PriceOracleProxyUSD"];
