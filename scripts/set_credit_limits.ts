import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseEther, parseUnits} = ethers.utils;
const {get} = deployments;

const BORROWER = '0x376d16C7dE138B01455a51dA79AD65806E9cd694';

async function main() {
  const comptroller = (await get('Comptroller'))
  const crWAVAXAddress = (await get('crWAVAX')).address;
  const crUSDTAddress = (await get('crUSDT.E')).address;
  const crUSDCAddress = (await get('crUSDC.E')).address;

  const comptrollerContract = new ethers.Contract(comptroller.address, comptroller.abi, ethers.provider)

  let tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crWAVAXAddress, parseEther('2'));
  console.log(tx)
  tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crUSDTAddress, parseUnits('100', 6));
  console.log(tx)
  tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crUSDCAddress, parseUnits('100', 6));
  console.log(tx)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
