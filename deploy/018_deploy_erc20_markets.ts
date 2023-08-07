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
  const govIRMAddress = (await get("GovIRM")).address;
  const cTokenImplementationAddress = (await get("CCollateralCapErc20Delegate")).address;

  const erc20ABI = (await getArtifact("EIP20Interface")).abi;

  const tokensToDeploy = [
    {
      symbol: "crWBTC",
      name: "Cream Wrapped BTC",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      irm: majorIRMAddress,
    },
    {
      symbol: "crUSDT",
      name: "Cream Tether USD",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      irm: stableIRMAddress,
    },
    {
      symbol: "crUSDC",
      name: "Cream USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      irm: stableIRMAddress,
    },
    {
      symbol: "crDAI",
      name: "Cream Dai Stablecoin",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      irm: stableIRMAddress,
    },
    {
      symbol: "crFRAX",
      name: "Cream Frax",
      address: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
      irm: stableIRMAddress,
    },
    {
      symbol: "crCRV",
      name: "Cream Curve DAO Token",
      address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      irm: govIRMAddress,
    },
  ];

  for (let token of tokensToDeploy) {
    const underlying = await ethers.getContractAt(erc20ABI, token.address);
    const underlyingDecimal = await underlying.decimals();
    const initialExchangeRate = parseUnits("0.01", 18 + underlyingDecimal - 8);

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
