
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2 bg-gray-800 p-3 rounded-lg">
      <div className="w-3 h-3 rounded-full animate-pulse bg-indigo-400"></div>
      <div className="w-3 h-3 rounded-full animate-pulse bg-indigo-400" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 rounded-full animate-pulse bg-indigo-400" style={{ animationDelay: '0.4s' }}></div>
      <span className="text-sm text-gray-300">AI is thinking...</span>
    </div>
  );
};
