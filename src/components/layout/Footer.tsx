'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2024 Degen D. Clash. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 