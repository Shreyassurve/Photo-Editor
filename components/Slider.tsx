
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 100, step = 1, defaultValue }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-400">{label}</label>
        <span className="text-sm text-gray-300 w-10 text-right">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
        />
        {defaultValue !== undefined && (
          <button onClick={() => onChange(defaultValue)} className="text-xs text-gray-500 hover:text-white">Reset</button>
        )}
      </div>
    </div>
  );
};
