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
    const { hexToUtf8 } = web3.utils;
    const MAX = web3.utils.toTwosComplement(-1);

    let factory;
    let poolmanager;
    let pool;
    let POOL;
    let WETH; let MKR; let DAI; let
        XXX; // addresses
    let weth; let mkr; let dai; let
        xxx; // TTokens

        before(async () => {
            factory = await BFactory.deployed();
            console.log("owner", owner)
            console.log("factory.address", await factory.address)
            poolmanager = await PoolManager.new(factory.address, { from: owner });
            console.log("poolmanager.address", await poolmanager.address)

            weth = await TToken.new('Wrapped Ether', 'WETH', 18);
            mkr = await TToken.new('Maker', 'MKR', 18);
            dai = await TToken.new('Dai Stablecoin', 'DAI', 18);
            xxx = await TToken.new('XXX', 'XXX', 18);
    
            WETH = weth.address;
            MKR = mkr.address;
            DAI = dai.address;
            XXX = xxx.address;
    
            /*
                Tests assume token prices
                WETH - $200
                MKR  - $500
                DAI  - $1
                XXX  - $0
            */
    
            // Owner balances
            await weth.mint(owner, toWei('100'));
            await mkr.mint(owner, toWei('40'));
            await dai.mint(owner, toWei('50000'));
            await xxx.mint(owner, toWei('20'));
    
            // Poolmanager balances
            await weth.mint(poolmanager.address, toWei('75'), { from: owner } );
            console.log("owner balance: ", await weth.balanceOf(owner).toString());
            await mkr.mint(poolmanager.address, toWei('30'), { from: owner });
            await dai.mint(poolmanager.address, toWei('40000'), { from: owner });
            await xxx.mint(poolmanager.address, toWei('15'), { from: owner });
    
            // User1 balances
            await weth.mint(user1, toWei('12.2222'), { from: owner });
            await mkr.mint(user1, toWei('1.015333'), { from: owner });
            await dai.mint(user1, toWei('0'), { from: owner });
            await xxx.mint(user1, toWei('51'), { from: owner });
        });
    
    describe('Create BPool', () => {

            it('calling account should be owner of pool manager', async () => {
            const pmowner = await poolmanager.owner.call();
            assert.isTrue(owner == pmowner);
        });

        it('factory in poolmanager should be set to correct address', async () => {
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
            const isBPool = await factory.isBPool(POOL);
            assert.isTrue(isBPool);
        });

        it('isBPool on non pool should return false', async () => {
            const isBPool = await factory.isBPool(owner);
            assert.isFalse(isBPool);
        });

        it('poolmanager should be controller of BPool', async () => {
            const controller = await pool.getController.call();
            assert.isTrue(controller == poolmanager.address);
        });

        it('pool should not be finalized', async () => {
            assert.isFalse(await pool.isFinalized.call());
        });
    });

    describe('Binding Tokens', () => {


        it('Pool starts with no bound tokens', async () => {
            const numTokens = await pool.getNumTokens();
            assert.equal(0, numTokens);
            const isBound = await pool.isBound.call(WETH);
            assert(!isBound);
        });

        it('Fails binding tokens that are not approved', async () => {
            await truffleAssert.reverts(
                poolmanager.bindToken(pool.address, MKR, toWei('10'), toWei('2.5'), { from: owner, gas: 5000000 }),
                'ERR_BTOKEN_BAD_CALLER',
            );
        });

        it('Pool manager approves tokens', async () => {
            await poolmanager.approveToken(WETH, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(DAI, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(MKR, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(XXX, pool.address, MAX, { from: owner });
        });

        it('Pool manager should be able to bind tokens in current smart pool', async () => {
            await poolmanager.bindToken(pool.address, WETH, toWei('50'), toWei('5'), { from: owner, gas: 5000000 });
            await poolmanager.bindToken(pool.address, MKR, toWei('20'), toWei('5'), { from: owner, gas: 5000000 });
            await poolmanager.bindToken(pool.address, DAI, toWei('10000'), toWei('5'));
            assert(poolmanager.checkToken(pool.address, WETH));
            const currentTokens = await poolmanager.currentTokens(pool.address);
            assert.sameMembers(currentTokens, [WETH, MKR, DAI]);
        });

            /*

        it('Pool manager binds more tokens', async () => {
            // Equal weights WETH, MKR, DAI
            const numTokens = await pool.getNumTokens();
            assert.equal(3, numTokens);
            const totalDernomWeight = await pool.getTotalDenormalizedWeight();
            assert.equal(15, fromWei(totalDernomWeight));
            const wethDenormWeight = await pool.getDenormalizedWeight(WETH);
            assert.equal(5, fromWei(wethDenormWeight));
            const wethNormWeight = await pool.getNormalizedWeight(WETH);
            assert.equal(0.333333333333333333, fromWei(wethNormWeight));
            const mkrBalance = await pool.getBalance(MKR);
            assert.equal(20, fromWei(mkrBalance));
        });
            */
        });
});
