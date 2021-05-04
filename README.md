Cream Finance Deployment Script
=================

Installation
------------

    git clone https://github.com/CreamFi/cream-deployment
    cd cream-deployment
    yarn install

Setup
------------
Replace `<YOUR_PRIVATE_KEY>` in `hardhat.config.js` with your private key

Deploy
------
    npx hardhat run scripts/deploy.js --network bsc_testnet
