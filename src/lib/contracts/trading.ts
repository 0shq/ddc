import { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';
import { Transaction } from '@mysten/sui/transactions';

export class TradingContract {
    constructor(private provider: SuiClient) {}

    async createTrade(
        nftId: string,
        tokenAmount: bigint,
        recipient: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::trading::create_trade`,
            arguments: [
                tx.pure.string(nftId),
                tx.pure.u64(tokenAmount),
                tx.pure.string(recipient),
            ],
        });

        return signAndExecute(tx);
    }

    async acceptTrade(
        tradeId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(0))]); // Amount will be determined by the contract
        
        tx.moveCall({
            target: `${PACKAGE_ID}::trading::accept_trade`,
            arguments: [
                tx.object(tradeId),
                coin
            ],
        });

        return signAndExecute(tx);
    }

    async cancelTrade(
        tradeId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::trading::cancel_trade`,
            arguments: [tx.object(tradeId)],
        });

        return signAndExecute(tx);
    }

    async getTradeDetails(tradeId: string) {
        return this.provider.getObject({
            id: tradeId,
            options: { showContent: true }
        });
    }

    // async getActiveTradesByUser(address: string) {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::trading::TradeCreated`,
    //         All: [
    //             { EqualTo: { path: '/from', value: address } }
    //         ]
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    // async getIncomingTrades(address: string) {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::trading::TradeCreated`,
    //         All: [
    //             { EqualTo: { path: '/to', value: address } }
    //         ]
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    // async getTradingStats() {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::trading::TradeAccepted`,
    //     };

    //     return this.provider.queryEvents({ filter });
    // }
} 