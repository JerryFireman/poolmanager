>>1. Deploy on development network with UI:

<2_deploy_factories.js>
const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');

module.exports = function(deployer) {
  deployer.deploy(BFactory).then(function() {
    return deployer.deploy(PoolManager, BFactory.address);
  });
};

ganache-cli -l 10000000 

truffle migrate --reset

client$ npm start

>>2. Testing:

<2_deploy_factories.js>

const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');

module.exports = function(deployer) {
  deployer.deploy(BFactory)
};

ganache-cli -l 10000000

truffle test ./test/poolmanager.js

>>3. Kovan:
Need to run ganache on specific addresses to access account with testnet coins
Use .env to pass private key, deploy poolmanager with BFactory account on Kovan

<2_deploy_factories.js>

const PoolManager = artifacts.require('PoolManager');

module.exports = function(deployer) {
  deployer.deploy(PoolManager, 0x8f7F78080219d4066A8036ccD30D588B416a40DB)
};

ganache-cli --account="0x11E74CD4FAEDE6AFFABE0D36645DB3372C1A37A376AEC237B85FCD2EB62318A9,100000000000000000000"

truffle migrate --network kovan

client$ npm start


Consider making 2_deploy_factories conditional so it doesn't have to be changed manually, 
such as ...
module.exports = async function (deployer, network, accounts) {
    if (network === 'development' || network === 'coverage') {
        deployer.deploy(TMath);
    }
    deployer.deploy(PoolManager);
};