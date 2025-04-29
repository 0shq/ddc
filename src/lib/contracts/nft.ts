import { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID } from '../sui/constants';
import { Transaction } from '@mysten/sui/transactions';

export class NFTContract {
    constructor(private provider: SuiClient) {}

    async mintNFT(
        name: string,
        description: string,
        imageUrl: string,
        rarity: number,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::nft::mint_nft`,
            arguments: [
                tx.pure.string(name),
                tx.pure.string(description),
                tx.pure.string(imageUrl),
                tx.pure.u64(rarity),
            ],
        });

        return signAndExecute(tx);
    }

    async getNFTDetails(nftId: string) {
        return this.provider.getObject({
            id: nftId,
            options: { showContent: true }
        });
    }

    // async getNFTsByOwner(owner: string) {
    //     const filter: SuiEventFilter = {
    //         MoveEventType: `${PACKAGE_ID}::nft::NFTMinted`,
    //         All: [
    //             { EqualTo: { path: '/owner', value: owner } }
    //         ]
    //     };

    //     return this.provider.queryEvents({ filter });
    // }

    async levelUp(
        nftId: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::nft::level_up`,
            arguments: [tx.object(nftId)],
        });

        return signAndExecute(tx);
    }
} 