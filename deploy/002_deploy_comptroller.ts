import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, execute, get, save} = deployments;

  const {deployer} = await getNamedAccounts();

  const comptrollerImpl = await deploy('Comptroller_Implementation', {
    from: deployer,
    contract: 'Comptroller',
    log: true
  });

  const unitrollerAddress = (await get('Unitroller')).address;

  await execute('Unitroller', { from: deployer }, '_setPendingImplementation', comptrollerImpl.address);
  await execute('Comptroller_Implementation', { from: deployer }, '_become', unitrollerAddress);

  // update Comptroller ABI
  await save('Comptroller', {
    abi: comptrollerImpl.abi,
    address: unitrollerAddress
  });
};
export default func;
func.tags = ['Comptroller'];
func.dependencies = ['Unitroller'];
