Cream Finance Deployment Script
=================

Installation
------------

    git clone https://github.com/CreamFi/cream-deployment
    cd cream-deployment
    yarn install

Setup
------------

    cp .env.default .env
Fill in environment variables

Deploy
------
    npx hardhat run scripts/deployComptroller.js --network <NETWORK>
