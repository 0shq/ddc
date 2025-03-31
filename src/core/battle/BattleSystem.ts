import { NFTAttributes } from '@/src/types/nft';
import { BattleResult } from '@/src/types/battle';

export class BattleSystem {
  static executeBattle(nft1: NFTAttributes, nft2: NFTAttributes): BattleResult {
    // Calculate battle power for each NFT
    const nft1Power = this.calculateBattlePower(nft1);
    const nft2Power = this.calculateBattlePower(nft2);
    
    // Add some randomness
    const nft1Roll = Math.random() * nft1Power;
    const nft2Roll = Math.random() * nft2Power;
    
    // Determine winner and loser
    const nft1Wins = nft1Roll > nft2Roll;
    const winner = nft1Wins ? nft1 : nft2;
    const loser = nft1Wins ? nft2 : nft1;
    
    // Calculate damage and experience
    const damageDealt = Math.floor(Math.abs(nft1Roll - nft2Roll));
    const experienceGained = Math.floor(damageDealt * 0.5);
    
    return {
      winner,
      loser,
      timestamp: Date.now(),
      experienceGained,
      damageDealt
    };
  }
  
  private static calculateBattlePower(nft: NFTAttributes): number {
    return (
      nft.attributes.strength * 2 +
      nft.attributes.speed * 1.5 +
      nft.attributes.luck * 1.2 +
      nft.attributes.level * 10 +
      nft.attributes.experience * 0.1
    );
  }
}