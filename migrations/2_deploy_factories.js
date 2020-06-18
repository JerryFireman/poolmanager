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
  console.log("BFactory.address: ", BFactory.address)
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
