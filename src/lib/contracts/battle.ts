import { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';
import { Transaction } from '@mysten/sui/transactions';

export class BattleContract {
    constructor(private provider: SuiClient) {}

    async initiateBattle(
        nft1Id: string,
        nft2Id: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::battle::initiate_battle`,
            arguments: [
                tx.pure.string(nft1Id),
                tx.pure.string(nft2Id)
            ],
        });

        return signAndExecute(tx);
    }

    async executeTurn(
        arenaId: string,
        battleId: string,
        attackerNftId: string,
        defenderNftId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::battle::execute_turn`,
            arguments: [
                tx.pure.string(arenaId),
                tx.pure.string(battleId),
                tx.pure.string(attackerNftId),
                tx.pure.string(defenderNftId)
            ],
        });

        return signAndExecute(tx);
    }

    async getBattleDetails(battleId: string) {
        return this.provider.getObject({
            id: battleId,
            options: { showContent: true }
        });
    }

    // async getActiveBattles(arenaId: string) {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::battle::BattleInitiated`,
    //         All: [
    //             { EqualTo: { path: '/arena_id', value: arenaId } }
    //         ]
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    // async getBattleResults(battleId: string) {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::battle::BattleFinished`,
    //         All: [
    //             { EqualTo: { path: '/battle_id', value: battleId } }
    //         ]
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    async claimRewards(
        battleId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::battle::claim_rewards`,
            arguments: [tx.pure.string(battleId)],
        });

        return signAndExecute(tx);
    }
} 