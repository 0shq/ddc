import { useState } from 'react';
import { useNFTs } from '../../store/NFTProvider';
import { NFTAttributes } from '../../types/nft';

interface BattleResult {
  winner: NFTAttributes;
  description: string;
}

interface BattleArenaProps {
  opponentNFT: NFTAttributes;
  opponentName: string;
  onStartBattle: () => Promise<void>;
  onCancel: () => void;
}

export default function BattleArena({ opponentNFT, opponentName, onStartBattle, onCancel }: BattleArenaProps) {
  const { selectedNFT } = useNFTs();
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startBattle = async () => {
    if (!selectedNFT || !opponentNFT) return;
    
    setIsLoading(true);
    try {
      await onStartBattle();
    } catch (error) {
      console.error('Battle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Battle Arena</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User's NFT */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Your NFT</h3>
          {selectedNFT ? (
            <>
              <img 
                src={selectedNFT.imageUrl} 
                alt={selectedNFT.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold text-xl">{selectedNFT.name}</h3>
              <div className="text-sm text-gray-300 mt-2">
                <p>Strength: {selectedNFT.attributes.strength}</p>
                <p>Speed: {selectedNFT.attributes.speed}</p>
                <p>Luck: {selectedNFT.attributes.luck}</p>
                <p>Level: {selectedNFT.attributes.level}</p>
                <p>Experience: {selectedNFT.attributes.experience}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Select your NFT to battle</p>
          )}
        </div>

        {/* Opponent's NFT */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Opponent</h3>
          {opponentNFT ? (
            <>
              <img 
                src={opponentNFT.imageUrl} 
                alt={opponentNFT.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold text-xl">{opponentName} with {opponentNFT.name}</h3>
              <div className="text-sm text-gray-300 mt-2">
                <p>Strength: {opponentNFT.attributes.strength}</p>
                <p>Speed: {opponentNFT.attributes.speed}</p>
                <p>Luck: {opponentNFT.attributes.luck}</p>
                <p>Level: {opponentNFT.attributes.level}</p>
                <p>Experience: {opponentNFT.attributes.experience}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Select an opponent to battle</p>
          )}
        </div>
      </div>

      {/* Battle Result */}
      {battleResult && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-center mb-4">Battle Result</h3>
          <div className="text-center">
            <p className="text-xl">{battleResult.winner.name} wins!</p>
            <p className="text-gray-300 mt-2">{battleResult.description}</p>
          </div>
        </div>
      )}

      {/* Battle Button */}
      {selectedNFT && opponentNFT && !battleResult && (
        <div className="mt-8 text-center">
          <button
            onClick={startBattle}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Battle in Progress...' : 'Start Battle'}
          </button>
          <button
            onClick={onCancel}
            className="ml-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}