import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Degen D. Clash
        </h1>
        <p className="text-xl text-white/80">
          Battle your NFTs and climb the ranks in this exciting blockchain game
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/mint" className="card group hover:border-primary/50 transition-all">
          <h2 className="text-2xl font-bold mb-4 text-primary">Mint Your NFT</h2>
          <p className="text-white/70 group-hover:text-white/90 transition-colors">
            Get started by minting your first NFT character. Choose from various classes and customize your character's appearance.
          </p>
        </Link>

        <Link href="/battle" className="card group hover:border-primary/50 transition-all">
          <h2 className="text-2xl font-bold mb-4 text-primary">Enter Battle</h2>
          <p className="text-white/70 group-hover:text-white/90 transition-colors">
            Challenge other players in exciting battles. Use strategy and skill to climb the leaderboard.
          </p>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <Link href="/leaderboard" className="btn-primary">
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
