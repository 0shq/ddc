'use client';

import React from 'react';
import Link from 'next/link';
import { useWalletContext } from '../../store/WalletProvider';

const Sidebar: React.FC = () => {
  const { connected } = useWalletContext();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
      <nav className="flex flex-col gap-4">
        {connected ? (
          <>
            <Link href="/profile" className="text-white hover:text-primary transition-colors">
              Profile
            </Link>
            <Link href="/inventory" className="text-white hover:text-primary transition-colors">
              Inventory
            </Link>
            <Link href="/battle" className="text-white hover:text-primary transition-colors">
              Battle
            </Link>
            <Link href="/mint" className="text-white hover:text-primary transition-colors">
              Mint NFT
            </Link>
            <Link href="/leaderboard" className="text-white hover:text-primary transition-colors">
              Leaderboard
            </Link>
          </>
        ) : (
          <div className="text-gray-400 text-sm">
            Connect your wallet to access these features
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar; 