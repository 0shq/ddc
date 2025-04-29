import { beforeAll, afterAll } from '@jest/globals';
import { setupTestAccount, setupTestProvider } from './helpers/setup';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

declare global {
    var testProvider: SuiClient;
    var testKeypair: Ed25519Keypair;
}

beforeAll(async () => {
    global.testProvider = await setupTestProvider();
    global.testKeypair = await setupTestAccount();
});

afterAll(async () => {
    // Clean up resources if needed
}); 