const hre = require("hardhat");

const parseEther = hre.ethers.utils.parseEther;

async function main() {
  const Comptroller = await hre.ethers.getContractFactory("Comptroller");
  const comptroller = Comptroller.attach("0x66e9c76b76F73B7F04108E26d201bC4023386Fa6");

  const CTokenAdmin = await hre.ethers.getContractFactory("CTokenAdmin");
  const cTokenAdmin = CTokenAdmin.attach("0x0a4AcCD9D150AD4DDC7eA2e6151243CE668Bf2f5");

  const PriceOracleProxy = await hre.ethers.getContractFactory("PriceOracleProxyUSD");
  const priceOracleProxy = PriceOracleProxy.attach("0xd528697008aC67A21818751A5e3c58C8daE54696");

  const FlashloanLender = await hre.ethers.getContractFactory("FlashloanLender");
  const flashloanLender = FlashloanLender.attach("0x328A7b4d538A2b3942653a9983fdA3C12c571141");


  cTokenAddresses = [
    "0x73CF8c5D14Aa0EbC89f18272A568319F5BAB6cBD",
    "0xf976C9bc0E16B250E0B1523CffAa9E4c07Bc5C8a",
    "0x5b4058A9000e86fe136Ac896352C4DFD539E32a1"
  ];

  sources = [
    "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
    "0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470",
    "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD"
  ];

  cfs = [
    parseEther("0.75"),
    parseEther("0.45"),
    parseEther("0.75"),
  ];

  rfs = [
    parseEther("0.15"),
    parseEther("0.4"),
    parseEther("0.15"),
  ];

  await priceOracleProxy._setAggregators(
    cTokenAddresses,
    sources,
    Array(cTokenAddresses.length).fill(0)
  );

  for (let i=0; i < cTokenAddresses.length; i++) {
    await cTokenAdmin._setReserveFactor(cTokenAddresses[i], rfs[i]);
    await comptroller._supportMarket(cTokenAddresses[i], 1); // beware of Wrapped native market
    await comptroller._setCollateralFactor(cTokenAddresses[i], cfs[i]);
  }

  await flashloanLender.updateUnderlyingMapping(cTokenAddresses);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
