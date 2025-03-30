import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-dark/50 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          DDC
        </Link>
        <nav className="flex gap-6">
          <Link href="/mint" className="text-white hover:text-primary transition-colors">
            Mint
          </Link>
          <Link href="/battle" className="text-white hover:text-primary transition-colors">
            Battle
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 