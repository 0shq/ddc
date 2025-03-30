// src/app/mint/page.tsx

'use client';

import React, { useState } from 'react';
import { useWalletContext } from '../../store/WalletProvider';
import { useNFTs } from '../../store/NFTProvider';
import NFTCard from '../../components/nft/NFTCard';

export default function MintPage() {
  const { connected } = useWalletContext();
  const { mintNFT, isLoading } = useNFTs();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    rarity: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mintNFT(
        formData.name,
        formData.description,
        formData.imageUrl,
        formData.rarity
      );
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        rarity: 1
      });
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Please connect your wallet to mint NFTs</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mint Your NFT</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rarity</label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData(prev => ({ ...prev, rarity: Number(e.target.value) }))}
                className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-white/10 text-white"
              >
                <option value={1}>Common</option>
                <option value={2}>Rare</option>
                <option value={3}>Epic</option>
                <option value={4}>Legendary</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Minting...' : 'Mint NFT'}
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          {formData.name && (
            <NFTCard
              nft={{
                id: 'preview',
                name: formData.name,
                owner: 'preview',
                attributes: {
                  strength: 50,
                  speed: 50,
                  luck: 50,
                  experience: 0,
                  level: 1
                },
                imageUrl: formData.imageUrl || 'https://placehold.co/400x400?text=Preview',
                rarity: ['common', 'rare', 'epic', 'legendary'][formData.rarity - 1] as any
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}