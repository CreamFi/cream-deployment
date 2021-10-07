import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseUnits} = ethers.utils;
const {deploy, execute, get, getArtifact} = deployments;

const crSymbol = 'crWAVAX';
const crName = 'Cream Wrapped AVAX';

async function main() {
  const {deployer, wrappedNative} = await getNamedAccounts();
  const comptrollerAddress = (await get('Unitroller')).address;
  const majorIRMAddress = (await get('MajorIRM')).address;
  const cTokenAdminAddress = (await get('CTokenAdmin')).address;
  const cWrappedNativeImplementationAddress = (await get('CWrappedNativeDelegate')).address;

  const erc20ABI = (await getArtifact('EIP20Interface')).abi;

  const underlying = await ethers.getContractAt(erc20ABI, wrappedNative);
  const underlyingDecimal = await underlying.decimals();
  const initialExchangeRate = parseUnits('0.02', 18 + underlyingDecimal - 8);

  const result = await deploy(crSymbol, {
    from: deployer,
    contract: 'CWrappedNativeDelegator',
    args: [
      wrappedNative,
      comptrollerAddress,
      majorIRMAddress,
      initialExchangeRate,
      crName,
      crSymbol,
      8,
      cTokenAdminAddress,
      cWrappedNativeImplementationAddress,
      "0x"
    ],
    log: true,
  });

  console.log(crSymbol, 'deployed at:', result.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
