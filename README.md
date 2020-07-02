>>1. Deploy on development network with UI:

<2_deploy_factories.js>
const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');
const Weth = artifacts.require('Weth');
const Dai = artifacts.require('Dai')
const Mkr = artifacts.require('Mkr')
module.exports = function(deployer) {
  deployer.deploy(Weth, 'Wrapped Ether', 'WETH', 18);
  deployer.deploy(Dai, 'Dai Stablecoin', 'DAI', 18)
  deployer.deploy(Mkr, 'Maker', 'MKR', 18)
  deployer.deploy(BFactory).then(function() {
    return deployer.deploy(PoolManager, BFactory.address);
  });
};

ganache-cli -l 10000000 

truffle migrate --reset

client$ npm start

>>2 Testing

No need to change 2_deploy_factories.js -- it's not used for testing

Just run: truffle test ./test/poolmanager.js

>>3ow . Kovan:
Need to run ganache on specific addresses to access account with testnet coins
Use .env to pass private key, deploy poolmanager with BFactory account on Kovan

Make 2_deploy_factories conditional so it doesn't have to be changed manually, 
such as ...
module.exports = async function (deployer, network, accounts) {
    if (network === 'development' || network === 'coverage') {
        deployer.deploy(TMath);
    }
    deployer.deploy(PoolManager);
};


<2_deploy_factories.js>

const PoolManager = artifacts.require('PoolManager');

module.exports = function(deployer) {
  deployer.deploy(PoolManager, 0x8f7F78080219d4066A8036ccD30D588B416a40DB)
};

ganache-cli --account="0x11E74CD4FAEDE6AFFABE0D36645DB3372C1A37A376AEC237B85FCD2EB62318A9,100000000000000000000"

truffle migrate --network kovan

client$ npm start

Development plan 
1) fix user interface to where i was (consider resetting to "")
reset master to current position: new commit, checkout master, git reset --hard <new commit>, git push -f origin master -- test bind frequently
2) add some validation -- test bind frequently
3) review code, remove instrumentation, check, check docs
4) readme: what its for, install, operate
6) social media
