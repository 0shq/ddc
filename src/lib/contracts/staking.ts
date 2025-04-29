import { SuiClient, SuiEventFilter } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';
import { Transaction } from '@mysten/sui/transactions';

export class StakingContract {
    constructor(private provider: SuiClient) {}

    async stakeNFT(
        nftId: string,
        poolId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::staking::stake_nft`,
            arguments: [
                tx.object(poolId),
                tx.object(nftId)
            ],
        });

        return signAndExecute(tx);
    }

    async unstakeNFT(
        nftId: string,
        poolId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::staking::unstake_nft`,
            arguments: [
                tx.object(poolId),
                tx.object(nftId)
            ],
        });

        return signAndExecute(tx);
    }

    async claimRewards(
        nftId: string,
        poolId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::staking::claim_rewards`,
            arguments: [
                tx.object(poolId),
                tx.object(nftId)
            ],
        });

        return signAndExecute(tx);
    }

    async getStakeInfo(poolId: string, nftId: string) {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::staking::NFTStaked`,
        };
        const events = await this.provider.queryEvents({ query: filter });
        return events.data.filter(
            (event) => {
                const parsed = event.parsedJson as { nft_id?: string; pool_id?: string } | undefined;
                return parsed && parsed.nft_id === nftId && parsed.pool_id === poolId;
            }
        );
    }

    async getStakedNFTs(owner: string) {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::staking::NFTStaked`,
        };
        const events = await this.provider.queryEvents({ query: filter });
        return events.data.filter(
            (event) => {
                const parsed = event.parsedJson as { owner?: string } | undefined;
                return parsed && parsed.owner === owner;
            }
        );
    }

    async getPoolInfo(poolId: string) {
        return this.provider.getObject({
            id: poolId,
            options: { showContent: true }
        });
    }

    async getStakingStats() {
        const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::staking::RewardsClaimed`,
        };

        return this.provider.queryEvents({ query: filter });
    }
} 