import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseEther, parseUnits} = ethers.utils;
const {deploy, execute, get, getArtifact} = deployments;

const crSymbol = 'crWETH.e';
const crName = 'Cream Wrapped Ether';
const underlyingAddress = '0x7fCDc2C1EF3e4A0bCC8155a558bB20a7218f2b05';


async function main() {
  const {deployer} = await getNamedAccounts();
  const comptrollerAddress = (await get('Unitroller')).address;
  const majorIRMAddress = (await get('MajorIRM')).address;
  const stableIRMAddress = (await get('StableIRM')).address;
  const govIRMAddress = (await get('GovIRM')).address;
  const cTokenAdminAddress = (await get('CTokenAdmin')).address;
  const cTokenImplementationAddress = (await get('CCollateralCapErc20Delegate')).address;

  const erc20ABI = (await getArtifact('EIP20Interface')).abi;
  const underlying = await ethers.getContractAt(erc20ABI, underlyingAddress);
  const underlyingDecimal = await underlying.decimals();
  const initialExchangeRate = parseUnits('0.02', 18 + underlyingDecimal - 8);

  const result = await deploy(crSymbol, {
    from: deployer,
    contract: 'CErc20Delegator',
    args: [
      underlyingAddress,
      comptrollerAddress,
      majorIRMAddress,
      initialExchangeRate,
      crName,
      crSymbol,
      8,
      cTokenAdminAddress,
      cTokenImplementationAddress,
      "0x"
    ],
  });

  console.log(crSymbol, 'deployed at:', result.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
