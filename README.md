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

Development plan 
1) smart contract - bind new token: smart contract bind, ui function must convert to address, wei, wei
2) test bind new token
3) wire bind new token: need selector for token, check ranges for last 2, 
4) smart contract status table
5) wire status table
6) smart contract change balance/weight
7) wire change balance/weight
8) balances, withdraw funds
9) clean up UI: fonts and colors
10) readme
11) video demo
12) social media

New functions:
newBPool
approve spend
bind
get current tokens
get balances
get denorm/norm
set swap fee
set public swap
rebind tokens
withdraw tokens


May need to npm install @material/typography