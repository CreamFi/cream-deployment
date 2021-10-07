import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {parseEther} from 'ethers/lib/utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get, getArtifact, save} = deployments;

  const {deployer} = await getNamedAccounts();

  const closeFactor = parseEther('0.5');
  const liquidationIncentive = parseEther('1.08');

  const priceOracleAddress = (await deployments.get('PriceOracleProxyUSD')).address;

  await execute('Comptroller', { from: deployer }, '_setCloseFactor', closeFactor);
  await execute('Comptroller', { from: deployer }, '_setLiquidationIncentive', liquidationIncentive);
  await execute('Comptroller', { from: deployer }, '_setPriceOracle', priceOracleAddress);
};
export default func;
func.tags = ['SetupComptroller'];
func.dependencies = ['Comptroller', 'PriceOracleProxyUSD'];
