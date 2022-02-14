import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseUnits} = ethers.utils;
const {deploy, get, getArtifact, save, run} = deployments;

enum IRM {
  Major = 'MajorIRM',
  Stable = 'StableIRM',
  Gov = 'GovIRM'
}

const crSymbol = 'iUST';
const crName = 'Iron Bank Axelar Wrapped UST';
const underlyingAddress = '0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11';
const interestRateModel = IRM.Stable;
const exchangeRate = '0.02';


async function main() {
  const {deployer} = await getNamedAccounts();
  const comptrollerAddress = (await get('Comptroller')).address;
  const irmAddress = (await get(interestRateModel)).address;
  const cTokenAdminAddress = (await get('CTokenAdmin')).address;
  const cTokenImplementationAddress = (await get('CCollateralCapErc20Delegate')).address;

  const erc20ABI = (await getArtifact('EIP20Interface')).abi;
  const underlying = await ethers.getContractAt(erc20ABI, underlyingAddress);
  const underlyingDecimal = await underlying.decimals();
  const initialExchangeRate = parseUnits(exchangeRate, 18 + underlyingDecimal - 8);

  const result = await deploy(crSymbol, {
    from: deployer,
    contract: 'CErc20Delegator',
    args: [
      underlyingAddress,
      comptrollerAddress,
      irmAddress,
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
