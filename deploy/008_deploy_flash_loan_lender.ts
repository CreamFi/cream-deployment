import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get} = deployments;

  const {deployer, guardian} = await getNamedAccounts();

  const unitrollerAddress = (await get('Unitroller')).address

  await deploy('FlashloanLender', {
    from: deployer,
    args: [unitrollerAddress, guardian],
    log: true,
  });
};
export default func;
func.tags = ['FlashloanLender'];
func.dependencies = ['Unitroller', 'Comptroller'];
