import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute} = deployments;

  const {deployer, admin} = await getNamedAccounts();

  await deploy('Unitroller', {
    from: deployer,
    log: true,
  });

  await execute('Unitroller', { from: deployer }, '_setPendingAdmin', admin);
};
export default func;
func.tags = ['Unitroller'];
