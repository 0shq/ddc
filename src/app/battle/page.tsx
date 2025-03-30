'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from '../../components/battle/BattleArena';
import BattleHistory from '../../components/battle/BattleHistory';
import { useWallet } from '../../store/WalletProvider';
import { useNFTs } from '../../store/NFTProvider';
import { useGame } from '../../store/GameProvider';
import { NFTAttributes } from '../../types/nft';

interface Opponent {
  id: string;
  name: string;
  nft: NFTAttributes;
}

export default function BattlePage() {
  const { connected } = useWallet();
  const { userNFTs: ownedNFTs, isLoading: nftsLoading } = useNFTs();
  const { battleHistory, initiateBattle, battleInProgress } = useGame();
  const [selectedNFT, setSelectedNFT] = useState<NFTAttributes | null>(null);
  const [battleMode, setBattleMode] = useState<'find' | 'prepare' | 'battle' | 'results'>('find');
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!connected) {
      // Remove the redirect and let the component handle the not-connected state
    }
  }, [connected, router]);

  useEffect(() => {
    if (battleMode === 'find' && !nftsLoading) {
      const mockOpponents: Opponent[] = [
        {
          id: '1',
          name: 'Doge Master',
          nft: {
            id: '1',
            name: 'Super Doge',
            owner: '0x123',
            strength: 85,
            speed: 70,
            luck: 65,
            experience: 100,
            level: 3,
            imageUrl: '/images/nfts/doge1.png',
            rarity: 'rare',
            image: '/images/nfts/doge1.png',
            attributes: { strength: 85, speed: 70, luck: 65 }
          }
        },
        {
          id: '2',
          name: 'CatLord',
          nft: {
            id: '2',
            name: 'Grumpy Cat',
            owner: '0x456',
            strength: 75,
            speed: 90,
            luck: 60,
            experience: 150,
            level: 4,
            imageUrl: '/images/nfts/cat1.png',
            rarity: 'epic',
            image: '/images/nfts/cat1.png',
            attributes: { strength: 75, speed: 90, luck: 60 }
          }
        },
        {
          id: '3',
          name: 'AquaKing',
          nft: {
            id: '3',
            name: 'Nyan Shark',
            owner: '0x789',
            strength: 90,
            speed: 60,
            luck: 75,
            experience: 200,
            level: 5,
            imageUrl: '/images/nfts/shark1.png',
            rarity: 'legendary',
            image: '/images/nfts/shark1.png',
            attributes: { strength: 90, speed: 60, luck: 75 }
          }
        }
      ];
      setOpponents(mockOpponents);
    }
  }, [battleMode, nftsLoading]);

  const handleNFTSelect = (nft: NFTAttributes) => {
    setSelectedNFT(nft);
    setBattleMode('prepare');
  };

  const handleOpponentSelect = (opponent: Opponent) => {
    setSelectedOpponent(opponent);
    setBattleMode('battle');
  };

  const handleStartBattle = async () => {
    try {
      if (!selectedNFT || !selectedOpponent) return;
      
      await initiateBattle(selectedOpponent.nft);
      
      setTimeout(() => {
        setBattleMode('results');
      }, 3000);
    } catch (error) {
      console.error('Battle error:', error);
    }
  };

  const handleBackToFind = () => {
    setSelectedNFT(null);
    setSelectedOpponent(null);
    setBattleMode('find');
  };

  if (!connected) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Battle Arena</h1>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="mb-4">Please connect your wallet to access the battle arena.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (nftsLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Battle Arena</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Battle Arena</h1>
      
      {battleMode === 'find' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Select Your NFT</h2>
            {ownedNFTs.length === 0 ? (
              <div className="text-center py-8">
                <p className="mb-4">You don't have any battle-ready NFTs</p>
                <button 
                  onClick={() => router.push('/mint')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Mint an NFT
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownedNFTs.map((nft) => (
                  <div 
                    key={nft.id} 
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition"
                    onClick={() => handleNFTSelect(nft)}
                  >
                    <img src={nft.imageUrl} alt={nft.name} className="w-full h-40 object-cover rounded-md mb-2" />
                    <h3 className="font-bold">{nft.name}</h3>
                    <div className="text-sm text-gray-300 mt-2">
                      <p>Strength: {nft.strength}</p>
                      <p>Speed: {nft.speed}</p>
                      <p>Luck: {nft.luck}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Battles</h2>
            <BattleHistory battles={battleHistory.slice(0, 5)} />
          </div>
        </div>
      )}
      
      {battleMode === 'prepare' && selectedNFT && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Champion</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              <img src={selectedNFT.imageUrl} alt={selectedNFT.name} className="w-full h-48 object-cover rounded-md mb-2" />
              <h3 className="font-bold text-xl">{selectedNFT.name}</h3>
              <div className="text-sm text-gray-300 mt-2">
                <p>Strength: {selectedNFT.strength}</p>
                <p>Speed: {selectedNFT.speed}</p>
                <p>Luck: {selectedNFT.luck}</p>
              </div>
              <button 
                onClick={handleBackToFind}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Select Different NFT
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Choose an Opponent</h2>
            <div className="grid grid-cols-1 gap-4">
              {opponents.map((opponent) => (
                <div 
                  key={opponent.id} 
                  className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition flex"
                  onClick={() => handleOpponentSelect(opponent)}
                >
                  <img src={opponent.nft.imageUrl} alt={opponent.nft.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                  <div>
                    <h3 className="font-bold">{opponent.name} with {opponent.nft.name}</h3>
                    <div className="text-sm text-gray-300 mt-2">
                      <p>Strength: {opponent.nft.strength}</p>
                      <p>Speed: {opponent.nft.speed}</p>
                      <p>Luck: {opponent.nft.luck}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {battleMode === 'battle' && selectedNFT && selectedOpponent && (
        <BattleArena 
          userNFT={selectedNFT} 
          opponentNFT={selectedOpponent.nft} 
          opponentName={selectedOpponent.name}
          onStartBattle={handleStartBattle}
          onCancel={handleBackToFind}
        />
      )}
      
      {battleMode === 'results' && selectedNFT && selectedOpponent && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Battle Results</h2>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-green-500 mb-2">Victory!</h3>
            <p>Your {selectedNFT.name} defeated {selectedOpponent.name}'s {selectedOpponent.nft.name}!</p>
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-bold mb-2">Rewards</h4>
              <p>+ 25 XP</p>
              <p>+ 10 $DEGEN Tokens</p>
              <p>+ 5 Ranking Points</p>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleBackToFind}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Battle Again
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}