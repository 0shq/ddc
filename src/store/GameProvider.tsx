'use client';

// src/store/GameProvider.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NFTAttributes } from '../types/nft';
import { useWallet } from './WalletProvider';
import { useNFTs } from './NFTProvider';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { GAME_PACKAGE_ID, GAME_MODULE } from '../lib/sui/constants';
import { BattleSystem } from '../core/battle/BattleSystem';
import { BattleResult } from '../types/battle';

interface GameContextType {
  battleInProgress: boolean;
  currentBattle: {
    userNFT: NFTAttributes | null;
    opponentNFT: NFTAttributes | null;
    result: BattleResult | null;
  };
  battleHistory: BattleResult[];
  initiateBattle: (opponentNFT: NFTAttributes) => Promise<BattleResult>;
  leaderboard: { address: string; name: string; wins: number; level: number }[];
  refreshLeaderboard: () => Promise<void>;
}

const GameContext = createContext<GameContextType>({
  battleInProgress: false,
  currentBattle: {
    userNFT: null,
    opponentNFT: null,
    result: null
  },
  battleHistory: [],
  initiateBattle: async (opponentNFT: NFTAttributes) => ({
    winner: {
      id: 'default',
      name: 'Default Winner',
      owner: '0x000',
      strength: 0,
      speed: 0,
      luck: 0,
      experience: 0,
      level: 1,
      imageUrl: '/images/nfts/default.png',
      rarity: 'common'
    },
    loser: opponentNFT,
    timestamp: Math.floor(Date.now() / 1000),
    experienceGained: 0,
    damageDealt: 0
  }),
  leaderboard: [],
  refreshLeaderboard: async () => {}
});

export const useGame = () => useContext(GameContext);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { connected, address, executeTransaction } = useWallet();
  const { selectedNFT, allNFTs } = useNFTs();
  
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<{
    userNFT: NFTAttributes | null;
    opponentNFT: NFTAttributes | null;
    result: BattleResult | null;
  }>({
    userNFT: null,
    opponentNFT: null,
    result: null
  });
  const [battleHistory, setBattleHistory] = useState<BattleResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ address: string; name: string; wins: number; level: number }[]>([]);
  
  // Initiate a battle
  const initiateBattle = async (opponentNFT: NFTAttributes) => {
    if (!connected || !selectedNFT) {
      throw new Error('Wallet not connected or no NFT selected');
    }
    
    try {
      setBattleInProgress(true);
      setCurrentBattle({
        userNFT: selectedNFT,
        opponentNFT,
        result: null
      });
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Execute battle logic using the BattleSystem
      const result = BattleSystem.executeBattle(selectedNFT, opponentNFT);
      
      // In a real app, this would call the smart contract
      // Here's what the transaction would look like:
      /*
      const txb = new TransactionBlock();
      
      txb.moveCall({
        target: `${GAME_PACKAGE_ID}::${GAME_MODULE}::initiate_battle`,
        arguments: [
          txb.object('<admin-object-id>'),
          txb.object(selectedNFT.id),
          txb.pure(opponentNFT.id),
          txb.object('<payment-coin-id>'),
        ],
      });
      
      await executeTransaction(txb);
      */
      
      // Update the current battle with the result
      setCurrentBattle(prev => ({
        ...prev,
        result
      }));
      
      // Add to battle history
      setBattleHistory(prev => [result, ...prev].slice(0, 10));
      
      // Update leaderboard
      await refreshLeaderboard();
      
      return result;
    } catch (error) {
      console.error('Battle failed:', error);
      throw error;
    } finally {
      setBattleInProgress(false);
    }
  };
  
  // Refresh leaderboard
  const refreshLeaderboard = async () => {
    try {
      // In a real app, fetch from blockchain or API
      // For demo, generate mock leaderboard
      const mockLeaderboard = [
        { address: '0x9abc', name: 'CryptoKing', wins: 42, level: 8 },
        { address: '0xdef0', name: 'BlockchainWarrior', wins: 38, level: 7 },
        { address: address || '0x5678', name: 'You', wins: 26, level: 5 },
        { address: '0xabcd', name: 'NFTMaster', wins: 22, level: 6 },
        { address: '0xefgh', name: 'TokenChampion', wins: 18, level: 4 },
      ];
      
      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
    }
  };
  
  const value = {
    battleInProgress,
    currentBattle,
    battleHistory,
    initiateBattle,
    leaderboard,
    refreshLeaderboard
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};