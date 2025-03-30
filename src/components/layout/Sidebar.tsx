import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-dark/30 backdrop-blur-sm border-r border-white/10 p-4">
      <nav className="flex flex-col gap-4">
        <Link href="/profile" className="text-white hover:text-primary transition-colors">
          Profile
        </Link>
        <Link href="/inventory" className="text-white hover:text-primary transition-colors">
          Inventory
        </Link>
        <Link href="/leaderboard" className="text-white hover:text-primary transition-colors">
          Leaderboard
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar; 