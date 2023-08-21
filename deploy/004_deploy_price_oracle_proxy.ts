import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, get } = deployments;

  const { deployer, feedRegistry, guardian } = await getNamedAccounts();

  const v1PriceOracleAddress = (await get("PriceOracleV1")).address;

  await deploy("PriceOracleProxyUSD", {
    from: deployer,
    args: [deployer, v1PriceOracleAddress, feedRegistry],
    log: true,
  });

  await execute("PriceOracleProxyUSD", { from: deployer, log: true }, "_setGuardian", guardian);
};
export default func;
func.tags = ["PriceOracleProxyUSD"];
