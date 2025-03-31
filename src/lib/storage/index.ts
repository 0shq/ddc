import { NFTAttributes } from '@/src/types/nft';
import { BattleResult } from '@/src/types/battle';

// Local storage keys
const STORAGE_KEYS = {
  WALLET_ADDRESS: 'ddc_wallet_address',
  SELECTED_NFT: 'ddc_selected_nft',
  BATTLE_HISTORY: 'ddc_battle_history',
  USER_STATS: 'ddc_user_stats'
};

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Local storage utilities
export const Storage = {
  // Wallet
  saveWalletAddress: (address: string) => {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
    }
  },
  getWalletAddress: (): string | null => {
    if (isBrowser) {
      return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
    }
    return null;
  },

  // Selected NFT
  saveSelectedNFT: (nft: NFTAttributes) => {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_NFT, JSON.stringify(nft));
    }
  },
  getSelectedNFT: (): NFTAttributes | null => {
    if (isBrowser) {
      const nft = localStorage.getItem(STORAGE_KEYS.SELECTED_NFT);
      return nft ? JSON.parse(nft) : null;
    }
    return null;
  },
  clearSelectedNFT: () => {
    if (isBrowser) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_NFT);
    }
  },

  // Battle History
  saveBattleHistory: (battles: BattleResult[]) => {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.BATTLE_HISTORY, JSON.stringify(battles));
    }
  },
  getBattleHistory: (): BattleResult[] => {
    if (isBrowser) {
      const battles = localStorage.getItem(STORAGE_KEYS.BATTLE_HISTORY);
      return battles ? JSON.parse(battles) : [];
    }
    return [];
  },

  // User Stats
  saveUserStats: (stats: { wins: number; losses: number; totalBattles: number }) => {
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
    }
  },
  getUserStats: () => {
    if (isBrowser) {
      const stats = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      return stats ? JSON.parse(stats) : { wins: 0, losses: 0, totalBattles: 0 };
    }
    return { wins: 0, losses: 0, totalBattles: 0 };
  },

  // Clear all data
  clearAll: () => {
    if (isBrowser) {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
  }
}; 