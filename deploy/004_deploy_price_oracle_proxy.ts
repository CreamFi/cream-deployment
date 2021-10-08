import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get, execute} = deployments;

  const {deployer, nativeUsdAggregator, admin, guardian} = await getNamedAccounts();
  const priceOracleV1Address = (await get('PriceOracleV1')).address

  await deploy('PriceOracleProxyUSD', {
    from: deployer,
    args: [deployer, priceOracleV1Address, nativeUsdAggregator],
    log: true,
  });

  await execute('PriceOracleProxyUSD', {from: deployer}, '_setGuardian', guardian);
  await execute('PriceOracleProxyUSD', {from: deployer}, '_setAdmin', admin);

};
export default func;
func.tags = ['PriceOracleProxyUSD'];
func.dependencies = ['PriceOracleV1'];
