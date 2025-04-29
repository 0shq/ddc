import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export async function setupTestAccount() {
    const keypair = Ed25519Keypair.generate();
    return keypair;
}

export async function setupTestProvider() {
    const provider = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
    return provider;
}

export async function executeTransaction(
    provider: SuiClient,
    keypair: Ed25519Keypair,
    tx: Transaction
) {
    return provider.signAndExecuteTransaction({
        transaction: tx,
        signer: keypair,
        options: {
            showEffects: true,
            showEvents: true,
        },
    });
}

export async function waitForTransaction(provider: SuiClient, digest: string) {
    return provider.waitForTransaction({
        digest,
        options: {
            showEffects: true,
            showEvents: true,
        },
    });
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}