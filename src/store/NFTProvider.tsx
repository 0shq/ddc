'use client';

// src/store/NFTProvider.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWalletContext } from './WalletProvider';
import { NFTAttributes } from '../types/nft';
import { GAME_PACKAGE_ID, GAME_MODULE } from '../lib/sui/constants';
import { SUI_PACKAGE_ID } from '../lib/sui/constants';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Storage } from '../lib/storage';

interface NFTContextType {
  userNFTs: NFTAttributes[];
  allNFTs: NFTAttributes[];
  isLoading: boolean;
  mintNFT: (name: string, description: string, imageUrl: string, rarity: number) => Promise<string>;
  selectedNFT: NFTAttributes | null;
  setSelectedNFT: (nft: NFTAttributes | null) => void;
  refreshNFTs: () => Promise<void>;
}

const NFTContext = createContext<NFTContextType>({
  userNFTs: [],
  allNFTs: [],
  isLoading: false,
  mintNFT: async () => { return ''; },
  selectedNFT: null,
  setSelectedNFT: () => {},
  refreshNFTs: async () => {}
});

export const useNFTs = () => useContext(NFTContext);

interface NFTProviderProps {
  children: ReactNode;
}

export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  const { connected, address, executeTransaction } = useWalletContext();
  const [userNFTs, setUserNFTs] = useState<NFTAttributes[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTAttributes | null>(() => Storage.getSelectedNFT());
  const [isLoading, setIsLoading] = useState(false);

  // Load user's NFTs when wallet is connected
  useEffect(() => {
    if (connected && address) {
      loadUserNFTs();
    } else {
      setUserNFTs([]);
      setSelectedNFT(null);
      Storage.clearAll();
    }
  }, [connected, address]);

  // Save selected NFT when it changes
  useEffect(() => {
    if (selectedNFT) {
      Storage.saveSelectedNFT(selectedNFT);
    } else {
      Storage.clearAll();
    }
  }, [selectedNFT]);

  const loadUserNFTs = async () => {
    setIsLoading(true);
    try {
      // In a real app, fetch NFTs from the blockchain
      // For now, use mock data
      const mockNFTs: NFTAttributes[] = [
        {
          id: '1',
          name: 'Doge Warrior',
          owner: address || '0x123',
          attributes: {
            strength: 75,
            speed: 60,
            luck: 45,
            experience: 120,
            level: 3
          },
          imageUrl: '/images/nfts/doge1.png',
          rarity: 'rare'
        },
        {
          id: '2',
          name: 'Grumpy Cat',
          owner: address || '0x123',
          attributes: {
            strength: 65,
            speed: 55,
            luck: 80,
            experience: 200,
            level: 4
          },
          imageUrl: '/images/nfts/cat1.png',
          rarity: 'epic'
        },
        {
          id: '3',
          name: 'Nyan Unicorn',
          owner: address || '0x123',
          attributes: {
            strength: 90,
            speed: 95,
            luck: 75,
            experience: 350,
            level: 6
          },
          imageUrl: '/images/nfts/unicorn1.png',
          rarity: 'legendary'
        }
      ];
      
      setUserNFTs(mockNFTs);
      
      // If there's a saved selected NFT, try to find it in the loaded NFTs
      const savedNFT = Storage.getSelectedNFT();
      if (savedNFT) {
        const foundNFT = mockNFTs.find(nft => nft.id === savedNFT.id);
        if (foundNFT) {
          setSelectedNFT(foundNFT);
        } else {
          // If saved NFT not found in current NFTs, clear the selection
          setSelectedNFT(null);
          Storage.clearSelectedNFT();
        }
      } else if (mockNFTs.length > 0 && !selectedNFT) {
        // If no saved NFT and no current selection, select the first NFT
        setSelectedNFT(mockNFTs[0]);
        Storage.saveSelectedNFT(mockNFTs[0]);
      }
    } catch (error) {
      console.error('Failed to load NFTs:', error);
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
      await loadUserNFTs();
      
      return txDigest;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  };

  const value = {
    userNFTs,
    allNFTs: [],
    isLoading,
    mintNFT,
    selectedNFT,
    setSelectedNFT,
    refreshNFTs: loadUserNFTs
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};