import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { parseUnits } = ethers.utils;

  const { deployer, wrappedNative } = await getNamedAccounts();

  const comptrollerAddress = (await get("Unitroller")).address;
  const majorIRMAddress = (await get("MajorIRM")).address;

  const cTokenAdminAddress = (await get("CTokenAdmin")).address;
  const cWrappedNativeImplementationAddress = (await get("CWrappedNativeDelegate")).address;

  const underlyingDecimal = 18;
  const initialExchangeRate = parseUnits("0.01", 18 + underlyingDecimal - 8);

  const result = await deploy("crWETH", {
    from: deployer,
    contract: "CWrappedNativeDelegator",
    args: [
      wrappedNative,
      comptrollerAddress,
      majorIRMAddress,
      initialExchangeRate,
      "Cream Wrapped Ether",
      "crWETH",
      8,
      cTokenAdminAddress,
      cWrappedNativeImplementationAddress,
      "0x",
    ],
    log: true,
  });
};
export default func;
func.tags = ["DeployWETHMarket"];
func.runAtTheEnd = true;
