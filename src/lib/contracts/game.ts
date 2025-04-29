import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '@/src/lib/sui/constants';
import { TextEncoder } from 'util';

export class GameContract {
    private provider: SuiClient;

    constructor() {
        this.provider = new SuiClient({ url: getFullnodeUrl('testnet') });
    }

    // Mint a new NFT
    async mintNFT(
        name: string,
        description: string,
        imageUrl: string,
        rarity: number,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        const nameBytes = new TextEncoder().encode(name);
        const descBytes = new TextEncoder().encode(description);
        const urlBytes = new TextEncoder().encode(imageUrl);
        
        tx.moveCall({
            target: `${PACKAGE_ID}::game::mint_nft`,
            arguments: [
                tx.pure(nameBytes as unknown as Uint8Array),
                tx.pure(descBytes as unknown as Uint8Array),
                tx.pure(urlBytes as unknown as Uint8Array),
                tx.pure(rarity as unknown as Uint8Array),
            ],
        });

        return signAndExecute(tx);
    }

    // Initiate a battle between two NFTs
    async initiateBattle(
        nft1Id: string,
        nft2Id: string,
        signAndExecute: (tx: Transaction) => Promise<any>
    ) {
        const tx = new Transaction();
        
        const nft1 = tx.object(nft1Id);
        const nft2 = tx.object(nft2Id);

        tx.moveCall({
            target: `${PACKAGE_ID}::game::initiate_battle`,
            arguments: [nft1, nft2],
        });

        return signAndExecute(tx);
    }

    // Get NFT details
    async getNFTDetails(nftId: string) {
        const nft = await this.provider.getObject({
            id: nftId,
            options: { showContent: true },
        });
        return nft;
    }

    // Get battle result
    async getBattleResult(battleId: string) {
        const battle = await this.provider.getObject({
            id: battleId,
            options: { showContent: true },
        });
        return battle;
    }
} 