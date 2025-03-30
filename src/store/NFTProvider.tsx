'use client';

// src/store/NFTProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletProvider';
import { NFTAttributes } from '../types/nft';
import { GAME_PACKAGE_ID, GAME_MODULE } from '../lib/sui/constants';
import { SUI_PACKAGE_ID } from '../lib/sui/constants';
import { TransactionBlock } from '@mysten/sui.js/transactions';

interface NFTContextType {
  userNFTs: NFTAttributes[];
  allNFTs: NFTAttributes[];
  isLoading: boolean;
  mintNFT: (name: string, description: string, imageUrl: string, rarity: number) => Promise<string>;
  refreshNFTs: () => Promise<void>;
  selectedNFT: NFTAttributes | null;
  selectNFT: (nft: NFTAttributes | null) => void;
}

const NFTContext = createContext<NFTContextType>({
  userNFTs: [],
  allNFTs: [],
  isLoading: false,
  mintNFT: async () => { return ''; },
  refreshNFTs: async () => {},
  selectedNFT: null,
  selectNFT: () => {}
});

export const useNFTs = () => useContext(NFTContext);

interface NFTProviderProps {
  children: ReactNode;
}

export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  const { connected, address, executeTransaction } = useWallet();
  const [userNFTs, setUserNFTs] = useState<NFTAttributes[]>([]);
  const [allNFTs, setAllNFTs] = useState<NFTAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTAttributes | null>(null);
  
  // Mock data for demo purposes
  const MOCK_NFTS: NFTAttributes[] = [
    {
      id: '0x1234',
      name: 'Doge Warrior',
      owner: address || '0x5678',
      strength: 75,
      speed: 60,
      luck: 45,
      experience: 120,
      level: 3,
      imageUrl: 'https://placehold.co/400x400?text=Doge+Warrior',
      rarity: 'rare'
    },
    {
      id: '0x2345',
      name: 'Grumpy Cat',
      owner: address || '0x5678',
      strength: 65,
      speed: 55,
      luck: 80,
      experience: 200,
      level: 4,
      imageUrl: 'https://placehold.co/400x400?text=Grumpy+Cat',
      rarity: 'epic'
    },
    {
      id: '0x3456',
      name: 'Nyan Unicorn',
      owner: '0x9abc',
      strength: 90,
      speed: 95,
      luck: 75,
      experience: 350,
      level: 6,
      imageUrl: 'https://placehold.co/400x400?text=Nyan+Unicorn',
      rarity: 'legendary'
    },
    {
      id: '0x4567',
      name: 'Pepe Frog',
      owner: '0xdef0',
      strength: 60,
      speed: 65,
      luck: 70,
      experience: 150,
      level: 3,
      imageUrl: 'https://placehold.co/400x400?text=Pepe+Frog',
      rarity: 'rare'
    }
  ];

  // Load NFTs when wallet connects
  useEffect(() => {
    if (connected) {
      refreshNFTs();
    } else {
      setUserNFTs([]);
      setSelectedNFT(null);
    }
  }, [connected, address]);

  // Refresh NFT data
  const refreshNFTs = async () => {
    if (!connected || !address) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, fetch actual NFTs from the blockchain
      // For demo, use mock data
      
      // Filter mock NFTs for user's NFTs
      const mockUserNFTs = MOCK_NFTS.filter(nft => nft.owner === address);
      setUserNFTs(mockUserNFTs);
      setAllNFTs(MOCK_NFTS);
      
      // If no NFT is selected but user has NFTs, select the first one
      if (!selectedNFT && mockUserNFTs.length > 0) {
        setSelectedNFT(mockUserNFTs[0]);
      }
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mint a new NFT
  const mintNFT = async (name: string, description: string, imageUrl: string, rarity: number): Promise<string> => {
    if (!connected) throw new Error('Wallet not connected');
    
    try {
      const txb = new TransactionBlock();
      
      // Call the mint_nft function in the smart contract
      txb.moveCall({
        target: `${GAME_PACKAGE_ID}::${GAME_MODULE}::mint_nft`,
        arguments: [
          txb.pure(Array.from(new TextEncoder().encode(name))),
          txb.pure(Array.from(new TextEncoder().encode(description))),
          txb.pure(Array.from(new TextEncoder().encode(imageUrl))),
          txb.pure(rarity),
        ],
      });
      
      // Execute the transaction
      const txDigest = await executeTransaction(txb);
      
      // Refresh NFTs after minting
      await refreshNFTs();
      
      return txDigest;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  };

  // Select an NFT
  const selectNFT = (nft: NFTAttributes | null) => {
    setSelectedNFT(nft);
  };

  const value = {
    userNFTs,
    allNFTs,
    isLoading,
    mintNFT,
    refreshNFTs,
    selectedNFT,
    selectNFT
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};