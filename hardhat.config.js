require("@nomiclabs/hardhat-waffle");

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
        url: "https://kovan5.arbitrum.io/rpc"
      }
    },
    arbitrum: {
      url: "https://kovan5.arbitrum.io/rpc",
      gasPrice: 0,
      accounts: ["0x0"]
    }
  }
};
