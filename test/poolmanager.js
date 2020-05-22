const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');
const BPool = artifacts.require('BPool');
const TToken = artifacts.require('TToken');
const truffleAssert = require('truffle-assertions');
const assert = require("chai").assert;

contract('PoolManager', async (accounts) => {
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const { hexToUtf8 } = web3.utils;

    const MAX = web3.utils.toTwosComplement(-1);

    let factory;
    let poolmanager;
    let pool;
    let POOL;
    let WETH;
    let DAI;
    let weth;
    let dai;

    describe('Create BPool', () => {

        before(async () => {
            factory = await BFactory.deployed();
            console.log("owner", owner)
            console.log("factory.address", await factory.address)
            poolmanager = await PoolManager.new(factory.address, { from: owner });
            console.log("poolmanager.address", await poolmanager.address)

            /*
            weth = await TToken.new('Wrapped Ether', 'WETH', 18);
            dai = await TToken.new('Dai Stablecoin', 'DAI', 18);

            WETH = weth.address;
            DAI = dai.address;

            // admin balances
            await weth.mint(owner, toWei('5'));
            await dai.mint(owner, toWei('200'));

            // nonAdmin balances
            await weth.mint(user1, toWei('1'), { from: owner });
            await dai.mint(user1, toWei('50'), { from: owner });

            await weth.approve(POOL, MAX, { from: owner });
            await dai.approve(POOL, MAX, { from: owner });

            await weth.approve(POOL, MAX, { from: user1 });
            await dai.approve(POOL, MAX, { from: user1 });
            */
        });

        it('should create a new smart pool', async () => {
            POOL = await poolmanager.createPool.call();
            tx = await poolmanager.createPool({ from: owner, gas: 5000000 } );
            console.log("tx:",tx);
            console.log("tx.logs[0].args.bpoolAddress: ", tx.logs[0].args.bpoolAddress);
            console.log("isaddress: ", web3.utils.isAddress(tx.logs[0].args.bpoolAddress));
            pool = await BPool.at(POOL)
            console.log("pool.address", await pool.address)
            assert.isTrue(web3.utils.isAddress(await pool.address));
        });

        it('owner should be owner of pool manager', async () => {
            const pmowner = await poolmanager.owner.call();
            assert.isTrue(owner == pmowner);
        });

        it('factory in poolmanager should be set to correct address', async () => {
            const factoryaddress = await poolmanager.factory.call();
            assert.isTrue(factory.address == factoryaddress);
        });



        it('pool should not be finalized', async () => {
            assert.isFalse(await pool.isFinalized.call());
        });

        it('isBPool on pool returns true', async () => {
            const isBPool = await factory.isBPool(POOL);
            assert.isTrue(isBPool);
        });

        it('isBPool on non pool returns false', async () => {
            const isBPool = await factory.isBPool(owner);
            assert.isFalse(isBPool);
        });

        it('poolmanager is controller of BPool', async () => {
            const controller = await pool.getController.call();
            assert.isTrue(controller == poolmanager.address);
        });


    });
});
