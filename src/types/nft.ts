export interface NFTAttributes {
  id: string;
  name: string;
  owner: string;
  attributes: {
    strength: number;
    speed: number;
    luck: number;
  };
  imageUrl: string;
  rarity: string;
  staked_at?: number;
  experience: number;
  level: number;
} 

export interface NFTData {
  id: string;
  name: string;
  owner: string;
  attributes: {
    strength: number;
    speed: number;
    luck: number;
  };
  image_url: string;
  rarity: string;
  staked_at?: number;
  experience: number;
  level: number;
}