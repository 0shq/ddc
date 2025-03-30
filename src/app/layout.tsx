// src/app/layout.tsx

import { Metadata } from 'next';
import { Providers } from './providers';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import '@mysten/dapp-kit/dist/index.css';
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
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-4">{children}</main>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}