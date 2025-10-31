
import React from 'react';

interface ToolButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center justify-center p-3 rounded-lg w-full transition-colors duration-200 group
        ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs font-medium tracking-tighter">{label}</span>
    </button>
  );
};
