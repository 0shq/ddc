import { describe, test, expect } from '@jest/globals';
import { Transaction } from '@mysten/sui/transactions';
import { executeTransaction, waitForTransaction } from '../helpers/setup';
import { PACKAGE_ID } from '@/lib/sui/constants';

describe('Battle System Integration Tests', () => {
    test('should create a battle', async () => {
        // First mint two NFTs for battle
        const mintTx = new Transaction();
        
        // Mint first NFT
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Attacker NFT'),
                mintTx.pure.u64(10),
                mintTx.pure.u64(10),
                mintTx.pure.u64(10),
                mintTx.pure.u64(10),
            ],
        });

        // Mint second NFT
        mintTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                mintTx.pure.string('Defender NFT'),
                mintTx.pure.u64(8),
                mintTx.pure.u64(8),
                mintTx.pure.u64(8),
                mintTx.pure.u64(8),
            ],
        });

        const mintResult = await executeTransaction(global.testProvider, global.testKeypair, mintTx);
        const mintResponse = await waitForTransaction(global.testProvider, mintResult.digest);
        
        const attackerNftId = mintResponse.effects?.created?.[0]?.reference?.objectId;
        const defenderNftId = mintResponse.effects?.created?.[1]?.reference?.objectId;

        if (!attackerNftId) throw new Error('Attacker NFT ID is undefined');
        if (!defenderNftId) throw new Error('Defender NFT ID is undefined');

        // Create battle
        const battleTx = new Transaction();
        battleTx.moveCall({
            target: `${PACKAGE_ID}::battle::create_battle`,
            arguments: [
                battleTx.object(attackerNftId),
                battleTx.object(defenderNftId),
            ],
        });

        const battleResult = await executeTransaction(global.testProvider, global.testKeypair, battleTx);
        expect(battleResult.effects?.status.status).toBe('success');
    });

    test('should resolve battle and distribute rewards', async () => {
        // First mint two NFTs and create battle
        const setupTx = new Transaction();
        
        // Mint NFTs
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Attacker NFT'),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
            ],
        });

        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('Defender NFT'),
                setupTx.pure.u64(8),
                setupTx.pure.u64(8),
                setupTx.pure.u64(8),
                setupTx.pure.u64(8),
            ],
        });

        const setupResult = await executeTransaction(global.testProvider, global.testKeypair, setupTx);
        const setupResponse = await waitForTransaction(global.testProvider, setupResult.digest);
        
        const attackerNftId = setupResponse.effects?.created?.[0]?.reference?.objectId;
        const defenderNftId = setupResponse.effects?.created?.[1]?.reference?.objectId;

        if (!attackerNftId) throw new Error('Attacker NFT ID is undefined');
        if (!defenderNftId) throw new Error('Defender NFT ID is undefined');

        // Create and resolve battle
        const battleTx = new Transaction();
        
        // Create battle
        const [battleId] = battleTx.moveCall({
            target: `${PACKAGE_ID}::battle::create_battle`,
            arguments: [
                battleTx.object(attackerNftId),
                battleTx.object(defenderNftId),
            ],
        });

        if (!battleId) throw new Error('Battle ID is undefined');

        // Resolve battle
        battleTx.moveCall({
            target: `${PACKAGE_ID}::battle::resolve_battle`,
            arguments: [battleId],
        });

        const battleResult = await executeTransaction(global.testProvider, global.testKeypair, battleTx);
        expect(battleResult.effects?.status.status).toBe('success');

        // Verify NFT states after battle
        const attackerDetails = await global.testProvider.getObject({
            id: attackerNftId,
            options: {
                showContent: true,
            },
        });

        const defenderDetails = await global.testProvider.getObject({
            id: defenderNftId,
            options: {
                showContent: true,
            },
        });

        expect(attackerDetails.data).toBeDefined();
        expect(defenderDetails.data).toBeDefined();
    });

    test('should handle equal power battles correctly', async () => {
        // Mint two NFTs with equal stats
        const setupTx = new Transaction();
        
        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('NFT One'),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
            ],
        });

        setupTx.moveCall({
            target: `${PACKAGE_ID}::nft::mint`,
            arguments: [
                setupTx.pure.string('NFT Two'),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
                setupTx.pure.u64(10),
            ],
        });

        const setupResult = await executeTransaction(global.testProvider, global.testKeypair, setupTx);
        const setupResponse = await waitForTransaction(global.testProvider, setupResult.digest);
        
        const nftOneId = setupResponse.effects?.created?.[0]?.reference?.objectId;
        const nftTwoId = setupResponse.effects?.created?.[1]?.reference?.objectId;

        if (!nftOneId) throw new Error('NFT One ID is undefined');
        if (!nftTwoId) throw new Error('NFT Two ID is undefined');

        // Create and resolve battle
        const battleTx = new Transaction();
        
        const [battleId] = battleTx.moveCall({
            target: `${PACKAGE_ID}::battle::create_battle`,
            arguments: [
                battleTx.object(nftOneId),
                battleTx.object(nftTwoId),
            ],
        });

        if (!battleId) throw new Error('Battle ID is undefined');

        battleTx.moveCall({
            target: `${PACKAGE_ID}::battle::resolve_battle`,
            arguments: [battleId],
        });

        const battleResult = await executeTransaction(global.testProvider, global.testKeypair, battleTx);
        expect(battleResult.effects?.status.status).toBe('success');
    });
}); 