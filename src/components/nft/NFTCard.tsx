'use client';

import React, { useState } from 'react';
import Image from 'next/image';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface NFTCardProps {
  nft: {
    id: string;
    name: string;
    owner: string;
    attributes: {
      strength: number;
      speed: number;
      luck: number;
      experience: number;
      level: number;
    } | null;
    imageUrl: string;
    rarity: Rarity;
  };
}

const NFTCard = ({ nft }: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getFallbackImage = () => {
    return 'https://images.unsplash.com/photo-1559715541-d4fc97b8d6dd?q=80&w=800&auto=format&fit=crop';
  };

  const getRarityStyles = (rarity: Rarity) => {
    const styles = {
      legendary: {
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        text: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-900',
        border: 'border-yellow-400'
      },
      epic: {
        bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-900',
        border: 'border-purple-400'
      },
      rare: {
        bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-900',
        border: 'border-blue-400'
      },
      common: {
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        text: 'text-gray-900',
        badge: 'bg-gray-100 text-gray-900',
        border: 'border-gray-400'
      }
    };
    return styles[rarity];
  };

  const rarityStyle = getRarityStyles(nft.rarity);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black/20 border ${rarityStyle.border} border-opacity-20`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {!imageError ? (
          <Image
            src={nft.imageUrl}
            alt={nft.name}
            fill
            priority
            className={`object-cover transition-opacity duration-200 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={getFallbackImage()}
              alt={`${nft.name} (Fallback)`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={`absolute inset-0 flex items-center justify-center ${rarityStyle.bg} bg-opacity-70`}>
              <span className="text-white font-bold text-xl px-4 py-2 bg-black bg-opacity-50 rounded">
                {nft.name}
              </span>
            </div>
          </div>
        )}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${rarityStyle.badge}`}>
            {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{nft.name}</h3>
            <p className="text-sm text-gray-400">Owner: {nft.owner}</p>
          </div>
        </div>

        {nft.attributes && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 p-2 rounded">
              <p className="text-sm text-gray-400">Strength</p>
              <p className="font-semibold text-white">{nft.attributes.strength}</p>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <p className="text-sm text-gray-400">Speed</p>
              <p className="font-semibold text-white">{nft.attributes.speed}</p>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <p className="text-sm text-gray-400">Luck</p>
              <p className="font-semibold text-white">{nft.attributes.luck}</p>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <p className="text-sm text-gray-400">Level</p>
              <p className="font-semibold text-white">{nft.attributes.level}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard; 