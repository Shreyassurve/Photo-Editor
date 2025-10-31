import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <ImageIcon className="text-indigo-400" size={28} />
        <h1 className="text-xl font-bold text-white">AI Photo Editor</h1>
      </div>
    </div>
  );
};