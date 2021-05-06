import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute} = deployments;

  const {deployer, poster, admin} = await getNamedAccounts();

  await deploy('PriceOracleV1', {
    from: deployer,
    args: [poster],
    log: true,
  });

  await execute('PriceOracleV1', {from: deployer}, '_setPendingAnchorAdmin', admin);
};
export default func;
func.tags = ['PriceOracleV1'];
