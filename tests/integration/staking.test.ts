import { describe, test, expect } from '@jest/globals';
import { Transaction } from '@mysten/sui/transactions';
import { executeTransaction, waitForTransaction } from '../helpers/setup';
import { PACKAGE_ID } from '@/lib/sui/constants';

describe('Staking System Integration Tests', () => {
    test('should stake NFT successfully', async () => {
        // First mint an NFT
        const mintTx = new Transaction();
        
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Stake NFT'),
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

        // Stake NFT
        const stakeTx = new Transaction();

        stakeTx.moveCall({
            target: `${PACKAGE_ID}::staking::stake_nft`,
            arguments: [
                stakeTx.object(nftId),
            ],
        });

        const stakeResult = await executeTransaction(global.testProvider, global.testKeypair, stakeTx);
        expect(stakeResult.effects?.status.status).toBe('success');
    });

    test('should unstake NFT and claim rewards', async () => {
        // Setup: Mint and stake NFT
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Stake NFT'),
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

        // Stake NFT
        const stakeTx = new Transaction();

        stakeTx.moveCall({
            target: `${PACKAGE_ID}::staking::stake_nft`,
            arguments: [
                stakeTx.object(nftId),
            ],
        });

        await executeTransaction(global.testProvider, global.testKeypair, stakeTx);

        // Unstake NFT and claim rewards
        const unstakeTx = new Transaction();
        
        unstakeTx.moveCall({
            target: `${PACKAGE_ID}::staking::unstake_and_claim`,
            arguments: [
                unstakeTx.object(nftId),
            ],
        });

        const unstakeResult = await executeTransaction(global.testProvider, global.testKeypair, unstakeTx);
        expect(unstakeResult.effects?.status.status).toBe('success');
    });

    test('should handle unstaking non-staked NFT correctly', async () => {
        // Mint NFT but don't stake it
        const mintTx = new Transaction();
        
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Unstaked NFT'),
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

        // Try to unstake non-staked NFT
        const unstakeTx = new Transaction();
        
        unstakeTx.moveCall({
            target: `${PACKAGE_ID}::staking::unstake_and_claim`,
            arguments: [
                unstakeTx.object(nftId),
            ],
        });

        try {
            await executeTransaction(global.testProvider, global.testKeypair, unstakeTx);
            throw new Error('Expected transaction to fail');
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('should calculate rewards correctly', async () => {
        // Setup: Mint and stake NFT
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Stake NFT'),
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

        // Stake NFT
        const stakeTx = new Transaction();

        stakeTx.moveCall({
            target: `${PACKAGE_ID}::staking::stake_nft`,
            arguments: [
                stakeTx.object(nftId),
            ],
        });

        await executeTransaction(global.testProvider, global.testKeypair, stakeTx);

        // Check rewards (without claiming)
        const checkTx = new Transaction();
        
        const [rewardsAmount] = checkTx.moveCall({
            target: `${PACKAGE_ID}::staking::get_pending_rewards`,
            arguments: [
                checkTx.object(nftId),
            ],
        });

        const checkResult = await executeTransaction(global.testProvider, global.testKeypair, checkTx);
        expect(checkResult.effects?.status.status).toBe('success');
        
        // Verify rewards amount is a non-negative number
        const rewards = Number(rewardsAmount);
        expect(rewards).toBeGreaterThanOrEqual(0);
    });
}); 