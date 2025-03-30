// src/app/layout.tsx

import React from 'react';
import { Metadata } from 'next';
import { WalletProvider } from '../store/WalletProvider';
import { NFTProvider } from '../store/NFTProvider';
import { GameProvider } from '../store/GameProvider';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Degen D. Clash',
  description: 'An NFT battle game on the Sui blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen flex flex-col">
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
      </body>
    </html>
  );
}