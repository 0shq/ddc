'use client';

import React from 'react';
import Image from 'next/image';
import { NFTAttributes } from '../../types/nft';

interface NFTCardProps {
  nft: NFTAttributes;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <div className="card">
      <div className="relative w-full aspect-square mb-4">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
      <div className="space-y-1 text-sm text-white/80">
        <p>Level: {nft.level}</p>
        <p>Strength: {nft.strength}</p>
        <p>Speed: {nft.speed}</p>
        <p>Luck: {nft.luck}</p>
        <p>Experience: {nft.experience}</p>
        <p className="capitalize">Rarity: {nft.rarity}</p>
      </div>
    </div>
  );
};

export default NFTCard; 