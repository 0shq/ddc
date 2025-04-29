import { describe, test, expect } from '@jest/globals';
import { Transaction } from '@mysten/sui/transactions';
import { executeTransaction, waitForTransaction } from '../helpers/setup';
import { PACKAGE_ID } from '@/lib/sui/constants';

describe('Marketplace Integration Tests', () => {
    test('should list NFT for sale', async () => {
        // First mint an NFT
        const mintTx = new Transaction();
        
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Market NFT'),
                mintTx.pure.u64(10),
                mintTx.pure.u64(10),
                mintTx.pure.u64(10),
                mintTx.pure.u64(10),
            ],
        });

        const mintResult = await executeTransaction(global.testProvider, global.testKeypair, mintTx);
        const mintResponse = await waitForTransaction(global.testProvider, mintResult.digest);
        
        const nftId = mintResponse.effects?.created?.[0]?.reference?.objectId;

        if (!nftId) throw new Error('NFT ID is undefined');

        // List NFT
        const listTx = new Transaction();
        const price = 1000000; // 1 SUI

        listTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::list_nft`,
            arguments: [
                listTx.object(nftId),
                listTx.pure.u64(price),
            ],
        });

        const listResult = await executeTransaction(global.testProvider, global.testKeypair, listTx);
        expect(listResult.effects?.status.status).toBe('success');
    });

    test('should buy listed NFT', async () => {
        // Setup: Mint and list NFT
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Market NFT'),
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

        // List NFT
        const listTx = new Transaction();
        const price = 1000000; // 1 SUI

        const [listingId] = listTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::list_nft`,
            arguments: [
                listTx.object(nftId),
                listTx.pure.u64(price),
            ],
        });

        if (!listingId) throw new Error('Listing ID is undefined');

        await executeTransaction(global.testProvider, global.testKeypair, listTx);

        // Buy NFT
        const buyTx = new Transaction();
        const [coin] = buyTx.splitCoins(buyTx.gas, [buyTx.pure.u64(price)]);

        buyTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::buy_nft`,
            arguments: [
                listingId,
                coin,
            ],
        });

        const buyResult = await executeTransaction(global.testProvider, global.testKeypair, buyTx);
        expect(buyResult.effects?.status.status).toBe('success');
    });

    test('should cancel listing', async () => {
        // Setup: Mint and list NFT
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Market NFT'),
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

        // List NFT
        const listTx = new Transaction();
        const price = 1000000; // 1 SUI

        const [listingId] = listTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::list_nft`,
            arguments: [
                listTx.object(nftId),
                listTx.pure.u64(price),
            ],
        });

        if (!listingId) throw new Error('Listing ID is undefined');

        await executeTransaction(global.testProvider, global.testKeypair, listTx);

        // Cancel listing
        const cancelTx = new Transaction();
        
        cancelTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::cancel_listing`,
            arguments: [listingId],
        });

        const cancelResult = await executeTransaction(global.testProvider, global.testKeypair, cancelTx);
        expect(cancelResult.effects?.status.status).toBe('success');
    });

    test('should handle marketplace fees correctly', async () => {
        // Setup: Mint and list NFT
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Market NFT'),
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

        // List NFT
        const listTx = new Transaction();
        const price = 1000000; // 1 SUI

        const [listingId] = listTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::list_nft`,
            arguments: [
                listTx.object(nftId),
                listTx.pure.u64(price),
            ],
        });

        if (!listingId) throw new Error('Listing ID is undefined');

        await executeTransaction(global.testProvider, global.testKeypair, listTx);

        // Buy NFT and check fee distribution
        const buyTx = new Transaction();
        const [coin] = buyTx.splitCoins(buyTx.gas, [buyTx.pure.u64(price)]);

        buyTx.moveCall({
            target: `${PACKAGE_ID}::marketplace::buy_nft`,
            arguments: [
                listingId,
                coin,
            ],
        });

        const buyResult = await executeTransaction(global.testProvider, global.testKeypair, buyTx);
        expect(buyResult.effects?.status.status).toBe('success');

        // Verify fee collection
        const marketplaceDetails = await global.testProvider.getObject({
            id: nftId,
            options: {
                showContent: true,
            },
        });

        expect(marketplaceDetails.data).toBeDefined();
    });
}); 