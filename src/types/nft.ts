export interface NFTAttributes {
  id: string;
  name: string;
  owner: string;
  attributes: {
    strength: number;
    speed: number;
    luck: number;
    experience: number;
    level: number;
  };
  imageUrl: string;
  rarity: string;
} 