require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();


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
      url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_TOKEN,
      chainId: 4,
      accounts: [`0x${process.env.KOVAN_DEPLOY_PRIVATE_KEY}`],
    }
  },
  etherscan: {
    apiKey: "API_KEY"
  }
};
