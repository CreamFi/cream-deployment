import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, get, getArtifact } = deployments;
  const { parseUnits } = ethers.utils;

  const { deployer } = await getNamedAccounts();

  const comptrollerAddress = (await get("Comptroller")).address;
  const cTokenAdminAddress = (await get("CTokenAdmin")).address;
  const majorIRMAddress = (await get("MajorIRM")).address;
  const stableIRMAddress = (await get("StableIRM")).address;
  // const memeIRMAddress = (await get("MemeIRM")).address;
  const cTokenImplementationAddress = (await get("CCollateralCapErc20Delegate")).address;

  const erc20ABI = (await getArtifact("EIP20Interface")).abi;

  const tokensToDeploy = [
    // {
    //   symbol: "crUSDT",
    //   name: "Cream Tether USD",
    //   address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    //   irm: stableIRMAddress,
    // },
    // {
    //   symbol: "crUSDC",
    //   name: "Cream USD Coin",
    //   address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    //   irm: stableIRMAddress,
    // },
    // {
    //   symbol: "crWstETH",
    //   name: "Cream Wrapped liquid staked Ether 2.0",
    //   address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    //   irm: majorIRMAddress,
    // },
    // {
    //   symbol: "crWBTC",
    //   name: "Cream Wrapped BTC",
    //   address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    //   irm: majorIRMAddress,
    // },
    // {
    //   symbol: "crCbBTC",
    //   name: "Cream Coinbase Wrapped BTC",
    //   address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    //   irm: majorIRMAddress,
    // },
    // {
    //   symbol: "crFAI",
    //   name: "Cream FAI",
    //   address: "0xb33Ff54b9F7242EF1593d2C9Bcd8f9df46c77935",
    //   irm: memeIRMAddress,
    // },
    {
      symbol: "crUSD1",
      name: "Cream World Liberty Financial USD",
      address: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
      irm: stableIRMAddress,
    },
  ];

  for (let token of tokensToDeploy) {
    const underlying = await ethers.getContractAt(erc20ABI, token.address);
    const underlyingDecimal = await underlying.decimals();
    const initialExchangeRate = parseUnits("0.02", 18 + underlyingDecimal - 8);

    await deploy(token.symbol, {
      from: deployer,
      contract: "CErc20Delegator",
      args: [
        token.address,
        comptrollerAddress,
        token.irm,
        initialExchangeRate,
        token.name,
        token.symbol,
        8,
        cTokenAdminAddress,
        cTokenImplementationAddress,
        "0x",
      ],
      log: true,
    });
  }
};
export default func;
func.tags = ["DeployMarket"];
