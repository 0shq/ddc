'use client';

import React from 'react';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@/src/store/WalletProvider';
import { NFTProvider } from '@/src/store/NFTProvider';
import { GameProvider } from '@/src/store/GameProvider';

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

  // Check if there's a saved wallet connection
  const [autoConnect, setAutoConnect] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const connectionInfo = localStorage.getItem('sui-dapp-kit:wallet-connection-info');
      return Boolean(connectionInfo);
    }
    return false;
  });

  return (
    <QueryClientProvider client={client}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <DappKitWalletProvider autoConnect={autoConnect}>
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