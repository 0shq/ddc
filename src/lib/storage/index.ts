import { NFTAttributes } from '../../types/nft';
import { BattleResult } from '../../types/battle';

// Local storage keys
const STORAGE_KEYS = {
  WALLET_ADDRESS: 'ddc_wallet_address',
  SELECTED_NFT: 'ddc_selected_nft',
  BATTLE_HISTORY: 'ddc_battle_history',
  USER_STATS: 'ddc_user_stats'
};

// Local storage utilities
export const Storage = {
  // Wallet
  saveWalletAddress: (address: string) => {
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
  },
  getWalletAddress: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
  },

  // Selected NFT
  saveSelectedNFT: (nft: NFTAttributes) => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_NFT, JSON.stringify(nft));
  },
  getSelectedNFT: (): NFTAttributes | null => {
    const nft = localStorage.getItem(STORAGE_KEYS.SELECTED_NFT);
    return nft ? JSON.parse(nft) : null;
  },
  clearSelectedNFT: () => {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_NFT);
  },

  // Battle History
  saveBattleHistory: (battles: BattleResult[]) => {
    localStorage.setItem(STORAGE_KEYS.BATTLE_HISTORY, JSON.stringify(battles));
  },
  getBattleHistory: (): BattleResult[] => {
    const battles = localStorage.getItem(STORAGE_KEYS.BATTLE_HISTORY);
    return battles ? JSON.parse(battles) : [];
  },

  // User Stats
  saveUserStats: (stats: { wins: number; losses: number; totalBattles: number }) => {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  },
  getUserStats: () => {
    const stats = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    return stats ? JSON.parse(stats) : { wins: 0, losses: 0, totalBattles: 0 };
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
}; 