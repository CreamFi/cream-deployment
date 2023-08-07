import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute } = deployments;

  const { deployer, admin } = await getNamedAccounts();

  await execute("Unitroller", { from: deployer, log: true }, "_setPendingAdmin", admin);
  await execute("PriceOracleProxyUSD", { from: deployer, log: true }, "_setAdmin", admin);
  await execute("CTokenAdmin", { from: deployer, log: true }, "setAdmin", admin);
};
export default func;
func.tags = ["SetAdmin"];
