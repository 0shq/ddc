import React from 'react';
import Link from 'next/link';
import { BattleResult } from '@/src/types/battle';
import { NFTAttributes } from '@/src/types/nft';

interface BattleHistoryProps {
  battles: BattleResult[];
}

export default function BattleHistory({ battles }: BattleHistoryProps) {
  if (battles.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No battles yet</p>
        <p className="text-sm text-gray-400 mt-2">Win battles to earn rewards and ranking points!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {battles.map((battle, index) => (
        <div key={index} className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-400">
              {new Date(battle.timestamp * 1000).toLocaleDateString()}
            </span>
            <span className="ml-auto px-2 py-1 text-xs rounded bg-gray-600">
              {battle.winner ? 'Victory' : 'Defeat'}
            </span>
          </div>
          
          <div className="flex items-center">
            <div className="flex-1">
              <img 
                src={battle.winner.imageUrl} 
                alt={battle.winner.name} 
                className="w-16 h-16 object-cover rounded-md mx-auto"
              />
              <p className="text-center text-sm mt-1">{battle.winner.name}</p>
              <p className="text-center text-xs text-gray-400">You</p>
            </div>
            
            <div className="mx-4 text-2xl font-bold">VS</div>
            
            <div className="flex-1">
              <img 
                src={battle.loser.imageUrl} 
                alt={battle.loser.name} 
                className="w-16 h-16 object-cover rounded-md mx-auto"
              />
              <p className="text-center text-sm mt-1">{battle.loser.name}</p>
              <p className="text-center text-xs text-gray-400">Opponent</p>
            </div>
          </div>
          
          {battle.winner && (
            <div className="mt-2 p-2 bg-gray-600 rounded-md">
              <p className="text-sm font-bold">Rewards:</p>
              <div className="flex justify-between text-xs">
                <span>+{battle.experienceGained} XP</span>
                <span>+{battle.damageDealt} Damage</span>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <Link href="/profile" className="text-blue-400 hover:text-blue-300 text-sm flex justify-center items-center">
        View all battles →
      </Link>
    </div>
  );
}