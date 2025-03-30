'use client';

import React from 'react';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '../store/WalletProvider';
import { NFTProvider } from '../store/NFTProvider';
import { GameProvider } from '../store/GameProvider';

const networks = {
  testnet: { url: getFullnodeUrl('testnet') }
};

// Create a client
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [client] = React.useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <DappKitWalletProvider>
          <WalletProvider>
            <NFTProvider>
              <GameProvider>
                {children}
              </GameProvider>
            </NFTProvider>
          </WalletProvider>
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
} 