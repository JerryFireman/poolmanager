const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');
const TToken = artifacts.require('TToken')
module.exports = function(deployer) {
  deployer.deploy(TToken, 'Wrapped Ether', 'WETH', 18)
  deployer.deploy(BFactory).then(function() {
    return deployer.deploy(PoolManager, BFactory.address);
  });
};


/*
const TMath = artifacts.require('TMath');
const BToken = artifacts.require('BToken');
const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');

module.exports = async function (deployer, network, accounts) {
    if (network === 'development' || network === 'coverage') {
        deployer.deploy(TMath);
    }
    deployer.deploy(PoolManager);
};
*/
