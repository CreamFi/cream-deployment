import "dotenv/config";
import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "./tasks";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.5.17",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
    admin: "0x6d5a7597896a703fe8c85775b23395a48f971305",
    guardian: "0x13ab2941254ae3c22dfa6e6a83a3ff8c090dd6bd",
    feedRegistry: "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf",
    wrappedNative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
