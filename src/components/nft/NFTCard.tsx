'use client';

import React from 'react';
import Image from 'next/image';
import { NFTAttributes } from '@/src/types/nft';

interface NFTCardProps {
  nft: NFTAttributes;
}

const NFTCard = ({ nft }: NFTCardProps) => {
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
        <p>Level: {nft.attributes.level}</p>
        <p>Strength: {nft.attributes.strength}</p>
        <p>Speed: {nft.attributes.speed}</p>
        <p>Luck: {nft.attributes.luck}</p>
        <p>Experience: {nft.attributes.experience}</p>
        <p className="capitalize">Rarity: {nft.rarity}</p>
      </div>
    </div>
  );
};

export default NFTCard; 