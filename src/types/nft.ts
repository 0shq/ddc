export interface NFTAttributes {
  id: string;
  name: string;
  owner: string;
  strength: number;
  speed: number;
  luck: number;
  experience: number;
  level: number;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image?: string; // For backward compatibility
  attributes?: {
    strength: number;
    speed: number;
    luck: number;
  };
} 