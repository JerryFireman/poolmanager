const BFactory = artifacts.require('BFactory');
const PoolManager = artifacts.require('PoolManager');
const BPool = artifacts.require('BPool');
const TToken = artifacts.require('TToken');
const truffleAssert = require('truffle-assertions');
const assert = require("chai").assert;

contract('PoolManager', async (accounts) => {
    const owner = accounts[0];
    const user1 = accounts[1];
    const { toWei } = web3.utils;
    const { fromWei } = web3.utils;
    const MAX = web3.utils.toTwosComplement(-1);

    let factory; // contract factory that produces smart pool
    let poolmanager; //smart contract that manages smart pool
    let pool; // smart pool
    let POOL; 
    // token addresses
    let WETH; 
    let MKR; 
    let DAI; 
    // tokens
    let weth; 
    let mkr; 
    let dai; 

    before(async () => {
        factory = await BFactory.deployed();
        poolmanager = await PoolManager.new(factory.address, { from: owner });

        weth = await TToken.new('Wrapped Ether', 'WETH', 18);
        mkr = await TToken.new('Maker', 'MKR', 18);
        dai = await TToken.new('Dai Stablecoin', 'DAI', 18);

        WETH = weth.address;
        MKR = mkr.address;
        DAI = dai.address;

        /*
            Tests assume token prices
            WETH - $200
            MKR  - $500
            DAI  - $1
        */

        // Owner balances
        await weth.mint(owner, toWei('100'));
        await mkr.mint(owner, toWei('40'));
        await dai.mint(owner, toWei('50000'));

        // Poolmanager balances
        await weth.mint(poolmanager.address, toWei('75'), { from: owner } );
        await mkr.mint(poolmanager.address, toWei('30'), { from: owner });
        await dai.mint(poolmanager.address, toWei('40000'), { from: owner });

    });
    
    describe('Create BPool', () => {

            it('owner should also be owner of pool manager', async () => {
            const pmowner = await poolmanager.owner.call();
            assert.isTrue(owner == pmowner);
        });

        it('factory should be set to correct address', async () => {
            const factoryaddress = await poolmanager.factory.call();
            assert.isTrue(factory.address == factoryaddress);
        });

        it('should create new smart pool and emit PoolCreated event', async () => {
            POOL = await poolmanager.createPool.call();
            tx = await poolmanager.createPool({ from: owner, gas: 5000000 } );
            pool = await BPool.at(POOL)
            assert.isTrue(web3.utils.isAddress(await pool.address));
            assert.isTrue(web3.utils.isAddress(tx.logs[0].args.bpoolAddress));
        });

        it('isBPool should return true', async () => {
            const isBPool = await factory.isBPool(pool.address);
            assert.isTrue(isBPool);
        });

        it('isBPool on non pool should return false', async () => {
            const isBPool = await factory.isBPool(owner);
            assert.isFalse(isBPool);
        });

        it('poolmanager should be controller of smart pool', async () => {
            const controller = await pool.getController.call();
            assert.isTrue(controller == poolmanager.address);
        });

    });

    describe('Binding Tokens', () => {

        it('should start with no bound tokens', async () => {
            const numTokens = await pool.getNumTokens();
            assert.equal(0, numTokens);
            const isBound = await pool.isBound.call(WETH);
            assert(!isBound);
        });

        it('should not bind tokens that are not approved', async () => {
            await truffleAssert.reverts(
                poolmanager.bindToken(pool.address, MKR, toWei('10'), toWei('2.5'), { from: owner, gas: 5000000 }),
                'ERR_BTOKEN_BAD_CALLER',
            );
        });

        it('should approve tokens', async () => {
            await poolmanager.approveToken(WETH, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(DAI, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(MKR, pool.address, MAX, { from: owner });
        });

        it('should bind token to current smart pool', async () => {
            await poolmanager.bindToken(pool.address, WETH, toWei('50'), toWei('5'), { from: owner, gas: 5000000 });
            assert(poolmanager.checkToken(pool.address, WETH));
        });

        it('should bind more tokens', async () => {
            await poolmanager.bindToken(pool.address, MKR, toWei('20'), toWei('5'), { from: owner, gas: 5000000 });
            await poolmanager.bindToken(pool.address, DAI, toWei('10000'), toWei('5'));
            const currentTokens = await poolmanager.currentTokens(pool.address);
            assert.sameMembers(currentTokens, [WETH, MKR, DAI]);
        });

        it('should yield correct normalized weight', async () => {
            const wethNormalizedWeight = await poolmanager.normalizedWeight(pool.address, WETH);
            assert.equal(0.333333333333333333, fromWei(wethNormalizedWeight));
        });

        it('should rebind a token with new balance', async () => {
            await poolmanager.rebindToken(pool.address, MKR, toWei('15'), toWei('5'), { from: owner, gas: 5000000 });
            const mkrBalance = await poolmanager.tokenBalance(pool.address, MKR);
            assert.equal(15, fromWei(mkrBalance));
        });

        it('should unbind a token', async () => {
            await poolmanager.unbindToken(pool.address, DAI, { from: owner, gas: 5000000 });
            const currentTokens = await poolmanager.currentTokens(pool.address);
            assert.sameMembers(currentTokens, [WETH, MKR]);
        });

        it('should set swap fee', async () => {
            await poolmanager.setFee(pool.address, (toWei('0.003')));
            const swapFee = await poolmanager.swapFee(pool.address)
            assert.equal(0.003, fromWei(swapFee));
        });

        it('should set the current smart pool as public', async () => {
            await poolmanager.setPublic(pool.address, true, { from: owner, gas: 5000000 });
            assert(await poolmanager.isPublic(pool.address));
        });
    });
});
