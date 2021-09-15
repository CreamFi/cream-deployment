const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const comptroller = Comptroller.attach("0xbadaC56c9aca307079e8B8FC699987AAc89813ee");

  const CTokenAdmin = await hre.ethers.getContractFactory("CTokenAdmin");
  const cTokenAdmin = CTokenAdmin.attach("0x5b4058A9000e86fe136Ac896352C4DFD539E32a1");

  const PriceOracleProxy = await hre.ethers.getContractFactory("PriceOracleProxyUSD");
  const priceOracleProxy = PriceOracleProxy.attach("0xE82225bA6BeD28406912522F01C7102DD9f07e78");

  const FlashloanLender = await hre.ethers.getContractFactory("FlashloanLender");
  const flashloanLender = FlashloanLender.attach("0x4eCEDdF62277eD78623f9A94995c680f8fd6C00e");


  cTokenAddresses = [
    "0x5441090C0401EE256b09DEb35679Ad175d1a0c97",
    "0xd5794ea7b269dB3a0CCB396774Cc2D0936FFBD86",
    "0x5eb35dAF9EF97E9e8cc33C486Bad884a62CAe9Ce"
  ];

  sources = [
    "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7"
  ];

  cfs = [
    parseEther("0.75"),
    parseEther("0.75"),
    parseEther("0.75"),
  ];

  rfs = [
    parseEther("0.15"),
    parseEther("0.1"),
    parseEther("0.1"),
  ];

  await priceOracleProxy._setAggregators(
    cTokenAddresses,
    sources,
    Array(cTokenAddresses.length).fill(0)
  );

  for (let i=0; i < cTokenAddresses.length; i++) {
    await cTokenAdmin._setReserveFactor(cTokenAddresses[i], rfs[i]);
  }

  await flashloanLender.updateUnderlyingMapping(cTokenAddresses);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
