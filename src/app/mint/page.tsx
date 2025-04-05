'use client';

import React, { useState } from 'react';
import { useWalletContext } from '@/src/store/WalletProvider';
import { useNFTs } from '@/src/store/NFTProvider';
import NFTCard from '@/src/components/nft/NFTCard';
import Image from 'next/image';

const MYSTERY_BOX_PRICE = 0.2; // 0.2 SUI

const RARITY_CHANCES = {
  legendary: '5%',
  epic: '15%',
  rare: '30%',
  common: '50%'
};

export default function MintPage() {
  const { connected } = useWalletContext();
  const { mintNFT, isLoading, error } = useNFTs();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [imageValidating, setImageValidating] = useState(false);
  const [imageError, setImageError] = useState('');

  const validateImage = async (url: string) => {
    setImageValidating(true);
    setImageError('');
    try {
      // TODO: Implement actual API call to content moderation service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!url.startsWith('https://')) {
        throw new Error('Image URL must use HTTPS');
      }
    } catch (error: any) {
      setImageError(error.message);
    } finally {
      setImageValidating(false);
    }
  };

  const handleImageUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    if (url) {
      await validateImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageValidating || imageError) return;
    
    try {
      await mintNFT(
        formData.name,
        formData.description,
        formData.imageUrl
      );
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Please connect your wallet to mint NFTs</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Mint Mystery Box NFT</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black/20 p-6 rounded-xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-white">Mystery Box Contents</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Legendary</h3>
                <p className="text-white">{RARITY_CHANCES.legendary} chance</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Epic</h3>
                <p className="text-white">{RARITY_CHANCES.epic} chance</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Rare</h3>
                <p className="text-white">{RARITY_CHANCES.rare} chance</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Common</h3>
                <p className="text-white">{RARITY_CHANCES.common} chance</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6 text-white">Input Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Image URL</label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-black/50 border ${
                    imageError ? 'border-red-500' : 'border-white/10'
                  } text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                  placeholder="https://"
                />
                {imageValidating && (
                  <p className="text-yellow-400 text-sm">Validating image...</p>
                )}
                {imageError && (
                  <p className="text-red-400 text-sm">{imageError}</p>
                )}
              </div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">Mystery Box Price</span>
                <span className="text-white font-bold">{MYSTERY_BOX_PRICE} SUI</span>
              </div>
              <p className="text-sm text-gray-400">
                Each mystery box has a chance to contain an NFT of any rarity. Higher rarity NFTs have better attributes and staking rewards!
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || imageValidating || !!imageError}
              className="w-full px-6 py-3 text-white font-semibold bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Opening Mystery Box...' : `Open Mystery Box for ${MYSTERY_BOX_PRICE} SUI`}
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-6 text-white">Preview</h2>
          <div className="sticky top-4">
            {formData.name && (
              <NFTCard
                nft={{
                  id: 'preview',
                  name: formData.name,
                  owner: 'preview',
                  attributes: null, // Attributes will be randomly generated on-chain
                  imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1559715541-d4fc97b8d6dd?q=80&w=800&auto=format&fit=crop',
                  rarity: 'epic' // Preview always shows epic, actual rarity determined on-chain
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}