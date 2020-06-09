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

        it('Owner approves poolmanager tokens', async () => {
            await poolmanager.approveToken(WETH, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(DAI, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(MKR, pool.address, MAX, { from: owner });
            await poolmanager.approveToken(XXX, pool.address, MAX, { from: owner });
        });

        it('Admin binds tokens', async () => {
            console.log("pool.address", pool.address);
            console.log("WETH", WETH);
            console.log("balance", toWei('10'));
            console.log("denorm", toWei('5'));
            console.log("owner", owner);
            console.log("poolmanager.owner", await poolmanager.owner.call());
            await poolmanager.bindToken(pool.address, WETH, toWei('50'), toWei('5'), { from: owner, gas: 5000000 });
            assert(poolmanager.checkToken(poolmanager.address, WETH));
        });
/*


        /*
        it('Fails binding weights and balances outside MIX MAX', async () => {
            await truffleAssert.reverts(
                poolmanager.bindToken(pool.address, WETH, toWei('51'), toWei('1'), { from: owner, gas: 5000000 }),
                'ERR_INSUFFICIENT_BAL',
            );
        });
            await truffleAssert.reverts(
                pool.bind(MKR, toWei('0.0000000000001'), toWei('1')),
                'ERR_MIN_BALANCE',
            );
            await truffleAssert.reverts(
                pool.bind(DAI, toWei('1000'), toWei('0.99')),
                'ERR_MIN_WEIGHT',
            );
            await truffleAssert.reverts(
                pool.bind(WETH, toWei('5'), toWei('50.01')),
                'ERR_MAX_WEIGHT',
            );
        });

        it('Fails finalizing pool without 2 tokens', async () => {
            await truffleAssert.reverts(
                pool.finalize(),
                'ERR_MIN_TOKENS',
            );
        });

        it('Admin binds tokens', async () => {
            // Equal weights WETH, MKR, DAI
            await pool.bind(WETH, toWei('50'), toWei('5'));
            await pool.bind(MKR, toWei('20'), toWei('5'));
            await pool.bind(DAI, toWei('10000'), toWei('5'));
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

        it('Admin unbinds token', async () => {
            await pool.bind(XXX, toWei('10'), toWei('5'));
            let adminBalance = await xxx.balanceOf(admin);
            assert.equal(0, fromWei(adminBalance));
            await pool.unbind(XXX);
            adminBalance = await xxx.balanceOf(admin);
            assert.equal(10, fromWei(adminBalance));
            const numTokens = await pool.getNumTokens();
            assert.equal(3, numTokens);
            const totalDernomWeight = await pool.getTotalDenormalizedWeight();
            assert.equal(15, fromWei(totalDernomWeight));
        });

        it('Fails binding above MAX TOTAL WEIGHT', async () => {
            await truffleAssert.reverts(
                pool.bind(XXX, toWei('1'), toWei('40')),
                'ERR_MAX_TOTAL_WEIGHT',
            );
        });

        it('Fails rebinding token or unbinding random token', async () => {
            await truffleAssert.reverts(
                pool.bind(WETH, toWei('0'), toWei('1')),
                'ERR_IS_BOUND',
            );
            await truffleAssert.reverts(
                pool.rebind(XXX, toWei('0'), toWei('1')),
                'ERR_NOT_BOUND',
            );
            await truffleAssert.reverts(
                pool.unbind(XXX),
                'ERR_NOT_BOUND',
            );
        });

        it('Get current tokens', async () => {
            const currentTokens = await pool.getCurrentTokens();
            assert.sameMembers(currentTokens, [WETH, MKR, DAI]);
        });

        it('Fails getting final tokens before finalized', async () => {
            await truffleAssert.reverts(
                pool.getFinalTokens(),
                'ERR_NOT_FINALIZED',
            );
        });
        */
    });
});
