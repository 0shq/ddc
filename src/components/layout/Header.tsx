'use client';

import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@mysten/dapp-kit';
import { useWalletContext } from '../../store/WalletProvider';

const Header: React.FC = () => {
  const { connected, address, error } = useWalletContext();

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
          Degen D. Clash
        </Link>
        
        <div className="flex items-center gap-4">
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
          
          {connected && (
            <span className="text-sm text-gray-300">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          )}
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header; 