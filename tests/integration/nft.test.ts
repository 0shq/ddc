import { describe, test, expect } from '@jest/globals';
import { Transaction } from '@mysten/sui/transactions';
import { executeTransaction, waitForTransaction } from '../helpers/setup';
import { PACKAGE_ID } from '@/lib/sui/constants';

describe('NFT Module Integration Tests', () => {
    test('should mint a new NFT', async () => {
        const tx = new Transaction();
        
        // Call mint function from the NFT module
        tx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                tx.pure.string('Test NFT'),
                tx.pure.u64(10), // strength
                tx.pure.u64(10), // agility
                tx.pure.u64(10), // intelligence
                tx.pure.u64(10), // stamina
            ],
        });

        const result = await executeTransaction(global.testProvider, global.testKeypair, tx);
        expect(result.effects?.status.status).toBe('success');

        const txResponse = await waitForTransaction(global.testProvider, result.digest);
        expect(txResponse).toBeDefined();
    });

    test('should level up NFT', async () => {
        // First mint an NFT
        const mintTx = new Transaction();
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Test NFT'),
                mintTx.pure.u64(10), // strength
                mintTx.pure.u64(10), // agility
                mintTx.pure.u64(10), // intelligence
                mintTx.pure.u64(10), // stamina
            ],
        });

        const mintResult = await executeTransaction(global.testProvider, global.testKeypair, mintTx);
        const mintResponse = await waitForTransaction(global.testProvider, mintResult.digest);
        const nftId = mintResponse.effects?.created?.[0]?.reference?.objectId;

        if (!nftId) throw new Error('NFT ID is undefined');

        // Then level it up
        const levelUpTx = new Transaction();
        levelUpTx.moveCall({
            target: `${PACKAGE_ID}::nft::level_up`,
            arguments: [
                levelUpTx.object(nftId),
            ],
        });

        const levelUpResult = await executeTransaction(global.testProvider, global.testKeypair, levelUpTx);
        expect(levelUpResult.effects?.status.status).toBe('success');
    });

    test('should get NFT details', async () => {
        // First mint an NFT
        const mintTx = new Transaction();
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Test NFT'),
                mintTx.pure.u64(10), // strength
                mintTx.pure.u64(10), // agility
                mintTx.pure.u64(10), // intelligence
                mintTx.pure.u64(10), // stamina
            ],
        });

        const mintResult = await executeTransaction(global.testProvider, global.testKeypair, mintTx);
        const mintResponse = await waitForTransaction(global.testProvider, mintResult.digest);
        const nftId = mintResponse.effects?.created?.[0]?.reference?.objectId;

        if (!nftId) throw new Error('NFT ID is undefined');

        // Then get its details
        const nftDetails = await global.testProvider.getObject({
            id: nftId,
            options: {
                showContent: true,
            },
        });

        if (!nftDetails.data) throw new Error('NFT details data is undefined');

        expect(nftDetails.data).toBeDefined();
        expect(nftDetails.data.content).toBeDefined();
    });
}); 