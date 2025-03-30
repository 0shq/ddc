'use client';

import React from 'react';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { WalletProvider } from '../store/WalletProvider';
import { NFTProvider } from '../store/NFTProvider';
import { GameProvider } from '../store/GameProvider';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import '@mysten/dapp-kit/dist/index.css';
import './globals.css';

const networks = {
  testnet: { url: getFullnodeUrl('testnet') }
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen flex flex-col">
        <SuiClientProvider networks={networks} defaultNetwork="testnet">
          <DappKitWalletProvider>
            <WalletProvider>
              <NFTProvider>
                <GameProvider>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <div className="flex flex-1">
                      <Sidebar />
                      <main className="flex-1 p-4">{children}</main>
                    </div>
                    <Footer />
                  </div>
                </GameProvider>
              </NFTProvider>
            </WalletProvider>
          </DappKitWalletProvider>
        </SuiClientProvider>
      </body>
    </html>
  );
} 