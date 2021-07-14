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
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/<PROJECT_ID>",
      accounts: ["0x_PRIVATE_KEY"]
    }
  },
  etherscan: {
    apiKey: "API_KEY"
  }
};
