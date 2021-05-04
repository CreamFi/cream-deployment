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
        enabled: true,
        runs: 200,
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://data-seed-prebsc-2-s2.binance.org:8545/"
      }
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-2-s2.binance.org:8545/",
      allowUnlimitedContractSize: true,
      accounts: ["0x<YOUR_PRIVATE_KEY>"]
    }
  }
};
