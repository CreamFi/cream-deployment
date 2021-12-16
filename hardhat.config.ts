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
      avalanche: '0x197939c1ca20C2b506d6811d8B6CDB3394471074',
      fuji: '0x197939c1ca20C2b506d6811d8B6CDB3394471074'
    },
    guardian: {
      hardhat: '0x197939c1ca20C2b506d6811d8B6CDB3394471074',
      avalanche: '0x197939c1ca20C2b506d6811d8B6CDB3394471074',
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
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: 43114,
      accounts: [`0x${process.env.DEPLOY_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
