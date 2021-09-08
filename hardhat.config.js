require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.5.17",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://arb1.arbitrum.io/rpc"
      }
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
