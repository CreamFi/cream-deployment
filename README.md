Cream Finance Deployment Script
=================

Installation
------------
```
git clone https://github.com/CreamFi/cream-deployment
cd cream-deployment
yarn install
```

Setup
------------
Copy the example env file to a local .env, and replace the infura project token and private key
```
cp .env_default .env
```

Deploy
------
    npx hardhat run scripts/deploy.js --network bsc_testnet




