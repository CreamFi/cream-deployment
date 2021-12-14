import {deployments, ethers, getNamedAccounts} from 'hardhat';
const {parseEther, parseUnits} = ethers.utils;
const {get} = deployments;

const BORROWER = '0x376d16C7dE138B01455a51dA79AD65806E9cd694';

async function main() {
  const comptroller = (await get('Comptroller'))
  const crWAVAXAddress = (await get('crWAVAX')).address;
  const crUSDTAddress = (await get('crUSDT.E')).address;
  const crUSDCAddress = (await get('crUSDC.E')).address;
  const crDAIAddress = (await get('crDAI.E')).address;
  const crWBTCAddress = (await get('crWBTC.E')).address;
  const crWETHAddress = (await get('crWETH.E')).address;

  const comptrollerContract = new ethers.Contract(comptroller.address, comptroller.abi, ethers.provider);

  let tx;
  // tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crUSDCAddress, parseUnits('43500000', 6));
  // console.log('USDC:', tx)
  // tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crUSDTAddress, parseUnits('37000000', 6));
  // console.log('USDT:', tx)
  tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crWAVAXAddress, parseEther('750000'));
  console.log('AVAX:', tx)
  // tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crDAIAddress, parseEther('5000000'));
  // console.log('DAI:', tx)
  // tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crWETHAddress, parseEther('2100'));
  // console.log('ETH:', tx)
  // tx = await comptrollerContract.populateTransaction._setCreditLimit(BORROWER, crWBTCAddress, parseUnits('32', 8));
  // console.log('BTC:', tx)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
