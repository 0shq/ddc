'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWalletContext } from '@/src/store/WalletProvider';
import { PACKAGE_ID, GAME_MODULE, ADMIN_CAP_ID } from '@/src/lib/sui/constants';
import { Storage } from '@/src/lib/storage';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { NFTAttributes, NFTData } from '@/src/types/nft';

interface NFTContextType {
  userNFTs: NFTAttributes[];
  allNFTs: NFTAttributes[];
  isLoading: boolean;
  mintNFT: (name: string, description: string, imageUrl: string) => Promise<void>;
  stakeNFT: (nftId: string) => Promise<void>;
  unstakeNFT: (nftId: string) => Promise<void>;
  error: string | null;
  selectedNFT: NFTAttributes | null;
  setSelectedNFT: (nft: NFTAttributes | null) => void;
  refreshNFTs: () => Promise<void>;
  initiateBattle: (nft1Id: string, nft2Id: string) => Promise<string>;
  getStakingRewards: (nft: NFTAttributes) => number;
}

const NFTContext = createContext<NFTContextType>({
  userNFTs: [],
  allNFTs: [],
  isLoading: false,
  mintNFT: async () => {},
  stakeNFT: async () => {},
  unstakeNFT: async () => {},
  error: null,
  selectedNFT: null,
  setSelectedNFT: () => {},
  refreshNFTs: async () => {},
  initiateBattle: async () => { return ''; },
  getStakingRewards: () => 0
});

export const useNFTs = () => useContext(NFTContext);

interface NFTProviderProps {
  children: ReactNode;
}

export const NFTProvider = ({ children }: NFTProviderProps) => {
  const { connected, address, executeTransaction } = useWalletContext();
  const [userNFTs, setUserNFTs] = useState<NFTAttributes[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTAttributes | null>(() => Storage.getSelectedNFT());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const provider = new SuiClient({ url: getFullnodeUrl('testnet') });

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
    if (!connected || !address) return;
    
    setIsLoading(true);
    try {
      // Fetch NFTs owned by the user
      const objects = await provider.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${PACKAGE_ID}::${GAME_MODULE}::NFT`
        },
        options: {
          showContent: true,
          showBcs: true,
          showOwner: true,
          showPreviousTransaction: true,
          showStorageRebate: true,
          showDisplay: true,
        }
      });

      const nfts: NFTAttributes[] = await Promise.all(
        objects.data.map(async (obj) => {
          if (!obj.data?.objectId) {
            throw new Error('Invalid object data');
          }

          const details = await provider.getObject({
            id: obj.data.objectId,
            options: { showContent: true }
          });
          
          if (!details.data?.content || details.data.content.dataType !== 'moveObject') {
            throw new Error('Invalid NFT data');
          }

          const nftData = details.data.content as unknown as NFTData;
          return {
            id: nftData.id,
            name: nftData.name,
            owner: nftData.owner,
            attributes: nftData.attributes,
            imageUrl: nftData.image_url,
            rarity: nftData.rarity.toString(),
            staked_at: nftData.staked_at,
            experience: nftData.experience,
            level: nftData.level
          };
        })
      );
      
      setUserNFTs(nfts);
      
      // Handle selected NFT
      const savedNFT = Storage.getSelectedNFT();
      if (savedNFT) {
        const foundNFT = nfts.find(nft => nft.id === savedNFT.id);
        if (foundNFT) {
          setSelectedNFT(foundNFT);
        } else {
          setSelectedNFT(null);
          Storage.clearSelectedNFT();
        }
      } else if (nfts.length > 0 && !selectedNFT) {
        setSelectedNFT(nfts[0]);
        Storage.saveSelectedNFT(nfts[0]);
      }
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStakingRewards = (nft: NFTAttributes): number => {
    if (!nft.staked_at) return 0;
    
    const now = Date.now();
    const stakedDuration = (now - nft.staked_at) / (24 * 60 * 60 * 1000); // Convert to days
    
    let dailyReward = 0;
    switch (nft.rarity) {
      case 'common':
        dailyReward = 0.001;
        break;
      case 'rare':
        dailyReward = 0.002;
        break;
      case 'epic':
        dailyReward = 0.005;
        break;
      case 'legendary':
        dailyReward = 0.01;
        break;
    }
    
    return dailyReward * stakedDuration;
  };

  const mintNFT = async (name: string, description: string, imageUrl: string) => {
    if (!connected) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      
      // Create coin for payment (0.2 SUI for mystery box)
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(200000000)]); // 0.2 SUI
      
      // Call mint_nft function
      tx.moveCall({
        target: `${PACKAGE_ID}::game::mint_nft`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object('0x6'), // Clock object
          coin,
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(imageUrl),
        ],
      });

      const result = await executeTransaction(tx);
      console.log('Mint result:', result);
      await loadUserNFTs();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to mint NFT:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stakeNFT = async (nftId: string) => {
    if (!connected) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::game::stake_nft`,
        arguments: [
          tx.object(nftId),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await executeTransaction(tx);
      console.log('Stake result:', result);
      await loadUserNFTs();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to stake NFT:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const unstakeNFT = async (nftId: string) => {
    if (!connected) throw new Error('Wallet not connected');
    
    setIsLoading(true);
    setError(null);

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::game::unstake_nft`,
        arguments: [
          tx.object(nftId),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await executeTransaction(tx);
      console.log('Unstake result:', result);
      await loadUserNFTs();
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to unstake NFT:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateBattle = async (nft1Id: string, nft2Id: string): Promise<string> => {
    if (!connected) throw new Error('Wallet not connected');
    
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::game::initiate_battle`,
        arguments: [
          tx.object(nft1Id),
          tx.object(nft2Id),
        ],
      });

      const result = await executeTransaction(tx);
      console.log('Battle result:', result);
      await loadUserNFTs();
      return result;
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to initiate battle:', err);
      throw err;
    }
  };

  const value = {
    userNFTs,
    allNFTs: userNFTs,
    isLoading,
    mintNFT,
    stakeNFT,
    unstakeNFT,
    error,
    selectedNFT,
    setSelectedNFT,
    refreshNFTs: loadUserNFTs,
    initiateBattle,
    getStakingRewards,
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};