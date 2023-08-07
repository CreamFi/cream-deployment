import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther } from "ethers/lib/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute } = deployments;

  const { deployer, guardian } = await getNamedAccounts();

  const closeFactor = parseEther("0.5");
  const liquidationIncentive = parseEther("1.08");

  const priceOracleAddress = (await deployments.get("PriceOracleProxyUSD")).address;

  await execute("Comptroller", { from: deployer }, "_setCloseFactor", closeFactor);
  await execute("Comptroller", { from: deployer }, "_setLiquidationIncentive", liquidationIncentive);
  await execute("Comptroller", { from: deployer }, "_setPriceOracle", priceOracleAddress);
  await execute("Comptroller", { from: deployer }, "_setPauseGuardian", guardian);
  await execute("Comptroller", { from: deployer }, "_setBorrowCapGuardian", guardian);
};
export default func;
func.tags = ["SetupComptroller"];
func.dependencies = ["Comptroller", "PriceOracleProxyUSD"];
