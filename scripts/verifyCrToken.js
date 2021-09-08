const { run } = require("hardhat");

const comptrollerAddress = '0xbadaC56c9aca307079e8B8FC699987AAc89813ee';
const comptrollerImpAddress = '0xcc3E89fBc10e155F1164f8c9Cf0703aCDe53f6Fd';
const admin = '0x11df15F0C90524D3644843e1A137095373138F5a';

async function main() {
  await run("verify:verify", {
    address: comptrollerImpAddress,
    contract: "contracts/Comptroller.sol:Comptroller",
    constructorArguments: []
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
