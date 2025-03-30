import { NFTAttributes } from './nft';

export interface BattleResult {
  winner: NFTAttributes;
  loser: NFTAttributes;
  timestamp: number;
  experienceGained: number;
  damageDealt: number;
} 