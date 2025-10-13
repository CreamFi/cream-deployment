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
    admin: {
      "mainnet-cream": "0x6d5a7597896a703fe8c85775b23395a48f971305",
      "mainnet-crv": "0x6d5a7597896a703fe8c85775b23395a48f971305",
      "mainnet-meme": "0x6d5a7597896a703fe8c85775b23395a48f971305",
      "base-main": "0x40dE493d8c0298909f5e50c5d0a6c5790Bc4Be80",
      "base-meme": "0x40dE493d8c0298909f5e50c5d0a6c5790Bc4Be80",
    },
    guardian: "0x13ab2941254ae3c22dfa6e6a83a3ff8c090dd6bd",
    feedRegistry: {
      "mainnet-cream": "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf",
      "mainnet-crv": "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf",
      "mainnet-meme": "0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf",
    },
    wrappedNative: {
      "mainnet-cream": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "mainnet-crv": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "mainnet-meme": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "base-main": "0x4200000000000000000000000000000000000006",
      "base-meme": "0x4200000000000000000000000000000000000006",
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      },
    },
    "mainnet-cream": {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
    "mainnet-crv": {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
    "mainnet-meme": {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
    "base-main": {
      url: "https://mainnet.base.org",
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
    "base-meme": {
      url: "https://mainnet.base.org",
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [`0x${process.env.BSC_DEPLOY_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
