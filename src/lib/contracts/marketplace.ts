import { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';
import { Transaction } from '@mysten/sui/transactions';

export class MarketplaceContract {
    constructor(private provider: SuiClient) {}

    async listNFT(
        nftId: string,
        price: bigint,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::marketplace::list_nft`,
            arguments: [
                tx.pure.string(nftId),
                tx.pure.u64(price),
            ],
        });

        return signAndExecute(tx);
    }

    async buyNFT(
        listingId: string,
        price: bigint,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
        
        tx.moveCall({
            target: `${PACKAGE_ID}::marketplace::buy_nft`,
            arguments: [
                tx.object(listingId),
                coin
            ],
        });

        return signAndExecute(tx);
    }

    async cancelListing(
        listingId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::marketplace::cancel_listing`,
            arguments: [tx.object(listingId)],
        });

        return signAndExecute(tx);
    }

    async getListingDetails(listingId: string) {
        return this.provider.getObject({
            id: listingId,
            options: { showContent: true }
        });
    }

    // async getActiveListings() {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::marketplace::NFTListed`,
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    // async getListingsByOwner(owner: string) {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::marketplace::NFTListed`,
    //         All: [
    //             { EqualTo: { path: '/seller', value: owner } }
    //         ]
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    // async getMarketplaceStats() {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::marketplace::NFTSold`,
    //     };

    //     return this.provider.queryEvents({ filter });
    // }
} 