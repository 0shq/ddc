import { useState, useEffect } from 'react';

interface BattleArenaProps {
  userNFT: any;
  opponentNFT: any;
  opponentName: string;
  onStartBattle: () => Promise<void>;
  onCancel: () => void;
}

export default function BattleArena({ 
  userNFT, 
  opponentNFT, 
  opponentName, 
  onStartBattle, 
  onCancel 
}: BattleArenaProps) {
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);

  const handleStartBattle = async () => {
    setBattleStarted(true);
    setBattleLog(['Battle starting...']);
    
    // Add some battle animation through logs
    setTimeout(() => {
      setBattleLog(prev => [...prev, `${userNFT.name} prepares to face ${opponentNFT.name}!`]);
      setAnimationFrame(1);
    }, 1000);
    
    setTimeout(() => {
      setBattleLog(prev => [...prev, `${userNFT.name} attacks with ${getRandomAttack(userNFT)}!`]);
      setAnimationFrame(2);
    }, 2000);
    
    setTimeout(() => {
      setBattleLog(prev => [...prev, `${opponentNFT.name} counters with ${getRandomAttack(opponentNFT)}!`]);
      setAnimationFrame(3);
    }, 3000);
    
    setTimeout(() => {
      setBattleLog(prev => [...prev, 'The battle intensifies!']);
      setAnimationFrame(4);
    }, 4000);
    
    // Finalize the battle
    setTimeout(() => {
      onStartBattle();
    }, 5000);
  };

  const getRandomAttack = (nft: any) => {
    const attacks = [
      'Swift Strike',
      'Fierce Bite',
      'Power Surge',
      'Meme Magic',
      'Degen Energy Blast'
    ];
    return attacks[Math.floor(Math.random() * attacks.length)];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Your Champion</h2>
        <div className={`bg-gray-700 rounded-lg p-4 ${animationFrame % 2 === 1 ? 'ring-2 ring-yellow-500' : ''}`}>
          <img src={userNFT.image} alt={userNFT.name} className={`w-full h-48 object-cover rounded-md mb-2 ${animationFrame === 2 ? 'transform translate-x-2 scale-105' : ''}`} />
          <h3 className="font-bold text-xl">{userNFT.name}</h3>
          <div className="text-sm text-gray-300 mt-2">
            <p>Strength: {userNFT.attributes.strength}</p>
            <p>Speed: {userNFT.attributes.speed}</p>
            <p>Luck: {userNFT.attributes.luck}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Battle Arena</h2>
        {!battleStarted ? (
          <div className="text-center py-8">
            <p className="mb-6">Ready to battle {opponentName}?</p>
            <div className="flex flex-col space-y-4">
              <button 
                onClick={handleStartBattle}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Start Battle
              </button>
              <button 
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-auto flex flex-col justify-end">
            {battleLog.map((log, index) => (
              <div key={index} className="mb-2 animate-fade-in">
                <p>{log}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Opponent</h2>
        <div className={`bg-gray-700 rounded-lg p-4 ${animationFrame % 2 === 0 && animationFrame > 0 ? 'ring-2 ring-red-500' : ''}`}>
          <img src={opponentNFT.image} alt={opponentNFT.name} className={`w-full h-48 object-cover rounded-md mb-2 ${animationFrame === 3 ? 'transform -translate-x-2 scale-105' : ''}`} />
          <h3 className="font-bold text-xl">{opponentNFT.name}</h3>
          <p className="text-sm text-gray-400">Owned by {opponentName}</p>
          <div className="text-sm text-gray-300 mt-2">
            <p>Strength: {opponentNFT.attributes.strength}</p>
            <p>Speed: {opponentNFT.attributes.speed}</p>
            <p>Luck: {opponentNFT.attributes.luck}</p>
          </div>
        </div>
      </div>
    </div>
  );
}