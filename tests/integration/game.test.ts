import { describe, expect, it, beforeAll } from '@jest/globals';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { NFTContract, BattleContract, MarketplaceContract, TradingContract, StakingContract } from '@/lib/contracts';

describe('DDC Game Integration Tests', () => {
    let provider: SuiClient;
    let nftContract: NFTContract;
    let battleContract: BattleContract;
    let marketplaceContract: MarketplaceContract;
    let tradingContract: TradingContract;
    let stakingContract: StakingContract;
    let keypair: Ed25519Keypair;

    beforeAll(async () => {
        provider = new SuiClient({ url: getFullnodeUrl('testnet') });
        nftContract = new NFTContract(provider);
        battleContract = new BattleContract(provider);
        marketplaceContract = new MarketplaceContract(provider);
        tradingContract = new TradingContract(provider);
        stakingContract = new StakingContract(provider);
        keypair = Ed25519Keypair.generate();
    });

    describe('NFT Module', () => {
        it('should mint a new NFT', async () => {
            const name = 'Test NFT';
            const description = 'Test Description';
            const imageUrl = 'https://example.com/image.png';
            const rarity = 1;

            const tx = new Transaction();
            const result = await nftContract.mintNFT(
                name,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(result).toBeDefined();
            // Add more specific assertions based on the response structure
        });

        it('should get NFT details', async () => {
            // First mint an NFT
            const name = 'Test NFT';
            const description = 'Test Description';
            const imageUrl = 'https://example.com/image.png';
            const rarity = 1;

            const mintTx = new Transaction();
            const mintResult = await nftContract.mintNFT(
                name,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            // Get the NFT ID from the mint result
            const nftId = ''; // Extract NFT ID from mint result

            const details = await nftContract.getNFTDetails(nftId);
            expect(details).toBeDefined();
            // Add more specific assertions
        });
    });

    describe('Battle Module', () => {
        it('should initiate a battle', async () => {
            // First mint two NFTs
            const name1 = 'Fighter 1';
            const name2 = 'Fighter 2';
            const description = 'Test Fighter';
            const imageUrl = 'https://example.com/fighter.png';
            const rarity = 1;

            const mintTx1 = new Transaction();
            const mintResult1 = await nftContract.mintNFT(
                name1,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            const mintTx2 = new Transaction();
            const mintResult2 = await nftContract.mintNFT(
                name2,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            // Extract NFT IDs
            const nft1Id = ''; // Extract from mintResult1
            const nft2Id = ''; // Extract from mintResult2

            const battleResult = await battleContract.initiateBattle(
                nft1Id,
                nft2Id,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(battleResult).toBeDefined();
            // Add more specific assertions
        });
    });

    describe('Marketplace Module', () => {
        it('should list and buy an NFT', async () => {
            // First mint an NFT
            const name = 'Market NFT';
            const description = 'Test NFT for marketplace';
            const imageUrl = 'https://example.com/nft.png';
            const rarity = 1;

            const mintTx = new Transaction();
            const mintResult = await nftContract.mintNFT(
                name,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            // Extract NFT ID
            const nftId = ''; // Extract from mintResult

            // List the NFT
            const price = BigInt(1000000);
            const listingResult = await marketplaceContract.listNFT(
                nftId,
                price,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(listingResult).toBeDefined();

            // Get the listing ID
            const listingId = ''; // Extract from listingResult

            // Buy the NFT
            const buyResult = await marketplaceContract.buyNFT(
                listingId,
                price,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(buyResult).toBeDefined();
            // Add more specific assertions
        });
    });

    describe('Trading Module', () => {
        it('should create and accept a trade', async () => {
            // First mint an NFT
            const name = 'Trade NFT';
            const description = 'Test NFT for trading';
            const imageUrl = 'https://example.com/trade.png';
            const rarity = 1;

            const mintTx = new Transaction();
            const mintResult = await nftContract.mintNFT(
                name,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            // Extract NFT ID
            const nftId = ''; // Extract from mintResult

            // Create a trade
            const tokenAmount = BigInt(1000000);
            const recipient = '0x123...'; // Use a valid address

            const tradeResult = await tradingContract.createTrade(
                nftId,
                tokenAmount,
                recipient,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(tradeResult).toBeDefined();

            // Get the trade ID
            const tradeId = ''; // Extract from tradeResult

            // Accept the trade
            const acceptResult = await tradingContract.acceptTrade(
                tradeId,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(acceptResult).toBeDefined();
            // Add more specific assertions
        });
    });

    describe('Staking Module', () => {
        it('should stake and unstake an NFT', async () => {
            // First mint an NFT
            const name = 'Stake NFT';
            const description = 'Test NFT for staking';
            const imageUrl = 'https://example.com/stake.png';
            const rarity = 1;

            const mintTx = new Transaction();
            const mintResult = await nftContract.mintNFT(
                name,
                description,
                imageUrl,
                rarity,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            // Extract NFT ID
            const nftId = ''; // Extract from mintResult

            // Get staking pool ID
            const poolId = ''; // Use a valid pool ID

            // Stake the NFT
            const stakeResult = await stakingContract.stakeNFT(
                nftId,
                poolId,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(stakeResult).toBeDefined();

            // Wait some time for rewards to accumulate
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Claim rewards
            const claimResult = await stakingContract.claimRewards(
                nftId,
                poolId,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(claimResult).toBeDefined();

            // Unstake the NFT
            const unstakeResult = await stakingContract.unstakeNFT(
                nftId,
                poolId,
                async (tx) => await provider.signAndExecuteTransaction({ transaction: tx, signer: keypair, options: { showEffects: true, showEvents: true } })
            );

            expect(unstakeResult).toBeDefined();
            // Add more specific assertions
        });
    });
}); 