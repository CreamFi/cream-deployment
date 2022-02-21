import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-contract-sizer';
import './tasks';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.5.17',
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  namedAccounts: {
    deployer: 0,
    poster: '0xd830A7413CB25FEe57f8115CD64E565B0Be466c3',
    admin: {
      hardhat: '0x197939c1ca20C2b506d6811d8B6CDB3394471074',
      mainnet: '0xA5fC0BbfcD05827ed582869b7254b6f141BA84Eb',
      avalanche: '0x3d4aBA3Af4EEe43d38D64EEf9Ea05340370e3cC9',
      fuji: '0x197939c1ca20C2b506d6811d8B6CDB3394471074'
    },
    guardian: {
      hardhat: '0x197939c1ca20C2b506d6811d8B6CDB3394471074',
      mainnet: '0x9d960dAe0639C95a0C822C9d7769d19d30A430Aa',
      avalanche: '0x93C220cf1Db6ea5Ab593180ccffA7C0C63A9767E',
      fuji: '0x197939c1ca20C2b506d6811d8B6CDB3394471074'
    },
    nativeUsdAggregator: {
      hardhat: '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD',
      avalanche: '0x0A77230d17318075983913bC2145DB16C7366156',
      fuji: '0x5498BB86BC934c8D34FDA08E81D444153d0D06aD',
    },
    wrappedNative: {
      avalanche: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      fuji: '0xd00ae08403B9bbb9124bB305C09058E32C39A48c',
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: 'https://api.avax.network/ext/bc/C/rpc'
      }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org/',
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    fantom: {
      url: 'https://rpc.ftm.tools/',
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
