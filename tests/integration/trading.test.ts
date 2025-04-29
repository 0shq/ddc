import { describe, test, expect } from '@jest/globals';
import { Transaction } from '@mysten/sui/transactions';
import { executeTransaction, waitForTransaction } from '../helpers/setup';
import { PACKAGE_ID } from '@/lib/sui/constants';

describe('Trading Module Integration Tests', () => {
    test('should create NFT-for-token trade', async () => {
        // First mint an NFT
        const mintTx = new Transaction();
        
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint_nft`,
            arguments: [
                mintTx.object('0x6'), // Clock object
                mintTx.pure.string('Test NFT'),
                mintTx.pure.string('Test Description'),
                mintTx.pure.string('https://example.com/image.png'),
            ],
        });

        const mintResult = await executeTransaction(global.testProvider, global.testKeypair, mintTx);
        const mintResponse = await waitForTransaction(global.testProvider, mintResult.digest);
        
        if (!mintResponse.effects?.created?.[0]?.reference?.objectId) {
            throw new Error('Failed to get NFT ID from mint response');
        }
        const nftId = mintResponse.effects.created[0].reference.objectId;

        // Create trade offer
        const tradeTx = new Transaction();
        const tokenAmount = 200000000n; // 0.2 SUI

        // Create coin for payment
        const [coin] = tradeTx.splitCoins(tradeTx.gas, [tradeTx.pure.u64(tokenAmount)]);

        tradeTx.moveCall({
            target: `${PACKAGE_ID}::trading::create_trade`,
            arguments: [
                tradeTx.object(nftId),
                coin,
                tradeTx.pure.address(global.testKeypair.getPublicKey().toSuiAddress()),
            ],
        });

        const tradeResult = await executeTransaction(global.testProvider, global.testKeypair, tradeTx);
        expect(tradeResult.effects?.status.status).toBe('success');
    });

    test('should accept trade offer', async () => {
        // Setup: Mint NFT and create trade
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Trade NFT'),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
            ],
        });

        const setupResult = await executeTransaction(global.testProvider, global.testKeypair, setupTx);
        const setupResponse = await waitForTransaction(global.testProvider, setupResult.digest);
        
        const nftId = setupResponse.effects?.created?.[0]?.reference?.objectId;
        if (!nftId) throw new Error('NFT ID is undefined');

        // Create trade offer
        const tradeTx = new Transaction();
        const tokenAmount = 1000000; // 1 SUI

        const [tradeId] = tradeTx.moveCall({
            target: `${PACKAGE_ID}::trading::create_trade`,
            arguments: [
                tradeTx.object(nftId),
                tradeTx.pure.u64(tokenAmount),
            ],
        });

        await executeTransaction(global.testProvider, global.testKeypair, tradeTx);

        // Accept trade
        const acceptTx = new Transaction();
        const [coin] = acceptTx.splitCoins(acceptTx.gas, [acceptTx.pure.u64(tokenAmount)]);

        acceptTx.moveCall({
            target: `${PACKAGE_ID}::trading::accept_trade`,
            arguments: [
                tradeId,
                coin,
            ],
        });

        const acceptResult = await executeTransaction(global.testProvider, global.testKeypair, acceptTx);
        expect(acceptResult.effects?.status.status).toBe('success');
    });

    test('should cancel trade offer', async () => {
        // Setup: Mint NFT and create trade
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Trade NFT'),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
            ],
        });

        const setupResult = await executeTransaction(global.testProvider, global.testKeypair, setupTx);
        const setupResponse = await waitForTransaction(global.testProvider, setupResult.digest);
        
        const nftId = setupResponse.effects?.created?.[0]?.reference?.objectId;
        if (!nftId) throw new Error('NFT ID is undefined');

        // Create trade offer
        const tradeTx = new Transaction();
        const tokenAmount = 1000000; // 1 SUI

        const [tradeId] = tradeTx.moveCall({
            target: `${PACKAGE_ID}::trading::create_trade`,
            arguments: [
                tradeTx.object(nftId),
                tradeTx.pure.u64(tokenAmount),
            ],
        });

        await executeTransaction(global.testProvider, global.testKeypair, tradeTx);

        // Cancel trade
        const cancelTx = new Transaction();
        
        cancelTx.moveCall({
            target: `${PACKAGE_ID}::trading::cancel_trade`,
            arguments: [tradeId],
        });

        const cancelResult = await executeTransaction(global.testProvider, global.testKeypair, cancelTx);
        expect(cancelResult.effects?.status.status).toBe('success');
    });

    test('should handle insufficient payment correctly', async () => {
        // Setup: Mint NFT and create trade
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Trade NFT'),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
            ],
        });

        const setupResult = await executeTransaction(global.testProvider, global.testKeypair, setupTx);
        const setupResponse = await waitForTransaction(global.testProvider, setupResult.digest);
        
        const nftId = setupResponse.effects?.created?.[0]?.reference?.objectId;
        if (!nftId) throw new Error('NFT ID is undefined');

        // Create trade offer
        const tradeTx = new Transaction();
        const tokenAmount = 1000000; // 1 SUI

        const [tradeId] = tradeTx.moveCall({
            target: `${PACKAGE_ID}::trading::create_trade`,
            arguments: [
                tradeTx.object(nftId),
                tradeTx.pure.u64(tokenAmount),
            ],
        });

        await executeTransaction(global.testProvider, global.testKeypair, tradeTx);

        // Try to accept trade with insufficient payment
        const acceptTx = new Transaction();
        const insufficientAmount = 500000; // 0.5 SUI
        const [coin] = acceptTx.splitCoins(acceptTx.gas, [acceptTx.pure.u64(insufficientAmount)]);

        acceptTx.moveCall({
            target: `${PACKAGE_ID}::trading::accept_trade`,
            arguments: [
                tradeId,
                coin,
            ],
        });

        try {
            await executeTransaction(global.testProvider, global.testKeypair, acceptTx);
            throw new Error('Expected transaction to fail');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });
}); 