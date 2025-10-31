import React, { useState } from 'react';
import { Slider } from './Slider';
import { Filters, Tool } from '../types';
import { SlidersHorizontal, Crop, Pencil, Eraser, Wand2, Download, Trash2, Sparkles, RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { ToolButton } from './ToolButton';

interface EditPanelProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onFilterChangeEnd: () => void;
  onApplyFilterPreset: (filters: Filters) => void;
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onResetAll: () => void;
  onDownload: () => void;
  onRemoveBackground: () => void;
  onRemoveObject: () => void;
  onApplyAiEffect: (prompt: string) => void;
  onRotateImage: (degrees: number) => void;
  onFlipImage: (axis: 'horizontal' | 'vertical') => void;
  cropAspectRatio: number | null;
  onCropAspectRatioChange: (ratio: number | null) => void;
}

const filterPresets: { name: string, filters: Filters }[] = [
    { name: 'None', filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Vintage', filters: { brightness: 110, contrast: 90, saturate: 70, grayscale: 0, sepia: 50, hueRotate: 0 } },
    { name: 'B&W', filters: { brightness: 100, contrast: 110, saturate: 100, grayscale: 100, sepia: 0, hueRotate: 0 } },
    { name: 'Cool', filters: { brightness: 105, contrast: 100, saturate: 90, grayscale: 0, sepia: 10, hueRotate: 0 } },
    { name: 'Warm', filters: { brightness: 105, contrast: 100, saturate: 120, grayscale: 0, sepia: 20, hueRotate: -10 } },
    { name: 'Clarity', filters: { brightness: 100, contrast: 125, saturate: 110, grayscale: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Cinematic', filters: { brightness: 95, contrast: 115, saturate: 85, grayscale: 0, sepia: 15, hueRotate: 5 } },
];

const aiEffects: { name: string, prompt: string }[] = [
    { name: 'Cartoon', prompt: 'Turn the image into a vibrant cartoon style' },
    { name: 'Anime', prompt: 'Redraw the image in a detailed anime/manga style' },
    { name: 'Watercolor', prompt: 'Convert the image into a watercolor painting' },
    { name: 'Comic Book', prompt: 'Make the image look like a classic comic book panel with ink lines and halftone dots' },
    { name: 'Cyberpunk', prompt: 'Give the image a futuristic, neon-lit cyberpunk aesthetic' },
    { name: 'Pixel Art', prompt: 'Transform the image into 16-bit pixel art' },
];

export const EditPanel: React.FC<EditPanelProps> = (props) => {
    const {
      filters, onFilterChange, onFilterChangeEnd, onApplyFilterPreset, currentTool, onToolChange,
      brushColor, onBrushColorChange, brushSize, onBrushSizeChange, onResetAll, onDownload,
      onRemoveBackground, onRemoveObject, onApplyAiEffect, onRotateImage, onFlipImage,
      cropAspectRatio, onCropAspectRatioChange
    } = props;
    
    const [customAiPrompt, setCustomAiPrompt] = useState('');

    const handleApplyCustomEffect = () => {
        if (customAiPrompt.trim()) {
            onApplyAiEffect(customAiPrompt);
        }
    };

    const handleSliderMouseUp = () => {
        onFilterChangeEnd();
    };

  return (
    <div className="w-full md:w-96 bg-gray-900 p-4 flex flex-col gap-6 text-white overflow-y-auto flex-shrink-0">
      <div className="grid grid-cols-4 gap-2">
        <ToolButton icon={SlidersHorizontal} label="Filters" isActive={currentTool === 'filters'} onClick={() => onToolChange('filters')} />
        <ToolButton icon={Crop} label="Crop" isActive={currentTool === 'crop'} onClick={() => onToolChange('crop')} />
        <ToolButton icon={Pencil} label="Draw" isActive={currentTool === 'draw'} onClick={() => onToolChange('draw')} />
        {/* Fix: Make AI tool button active for both 'ai-effects' and 'remove-object' tools for better UX. */}
        <ToolButton icon={Sparkles} label="AI" isActive={currentTool === 'ai-effects' || currentTool === 'remove-object'} onClick={() => onToolChange('ai-effects')} />
      </div>

      <div className="border-b border-gray-700"></div>

      {currentTool === 'filters' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-300">Presets</h3>
          <div className="grid grid-cols-3 gap-2">
            {filterPresets.map(preset => (
                <button key={preset.name} onClick={() => onApplyFilterPreset(preset.filters)} className="text-xs p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
                    {preset.name}
                </button>
            ))}
          </div>
          <div className="border-b border-gray-700 my-2"></div>
          <h3 className="text-lg font-semibold text-gray-300">Adjustments</h3>
          <div onMouseUp={handleSliderMouseUp} onTouchEnd={handleSliderMouseUp} className="flex flex-col gap-4">
            <Slider label="Brightness" value={filters.brightness} onChange={v => onFilterChange({ brightness: v })} max={200} defaultValue={100} />
            <Slider label="Contrast" value={filters.contrast} onChange={v => onFilterChange({ contrast: v })} max={200} defaultValue={100} />
            <Slider label="Saturate" value={filters.saturate} onChange={v => onFilterChange({ saturate: v })} max={200} defaultValue={100} />
            <Slider label="Grayscale" value={filters.grayscale} onChange={v => onFilterChange({ grayscale: v })} max={100} defaultValue={0} />
            <Slider label="Sepia" value={filters.sepia} onChange={v => onFilterChange({ sepia: v })} max={100} defaultValue={0} />
            <Slider label="Hue Rotate" value={filters.hueRotate} onChange={v => onFilterChange({ hueRotate: v })} max={360} defaultValue={0} />
          </div>
        </div>
      )}
      
      {currentTool === 'crop' && (
          <div className="flex flex-col gap-6">
              <h3 className="text-lg font-semibold text-gray-300">Crop & Transform</h3>
              <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => onCropAspectRatioChange(null)} className={`text-xs p-2 rounded-md ${!cropAspectRatio ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>Free</button>
                      <button onClick={() => onCropAspectRatioChange(1/1)} className={`text-xs p-2 rounded-md ${cropAspectRatio === 1/1 ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>1:1</button>
                      <button onClick={() => onCropAspectRatioChange(4/3)} className={`text-xs p-2 rounded-md ${cropAspectRatio === 4/3 ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>4:3</button>
                      <button onClick={() => onCropAspectRatioChange(16/9)} className={`text-xs p-2 rounded-md ${cropAspectRatio === 16/9 ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}>16:9</button>
                  </div>
              </div>
               <div>
                  <label className="text-sm font-medium text-gray-400 mb-2 block">Rotate & Flip</label>
                  <div className="grid grid-cols-4 gap-2">
                     <button onClick={() => onRotateImage(-90)} className="flex justify-center p-2 rounded-md bg-gray-800 hover:bg-gray-700"><RotateCcw size={18}/></button>
                     <button onClick={() => onRotateImage(90)} className="flex justify-center p-2 rounded-md bg-gray-800 hover:bg-gray-700"><RotateCw size={18}/></button>
                     <button onClick={() => onFlipImage('horizontal')} className="flex justify-center p-2 rounded-md bg-gray-800 hover:bg-gray-700"><FlipHorizontal size={18}/></button>
                     <button onClick={() => onFlipImage('vertical')} className="flex justify-center p-2 rounded-md bg-gray-800 hover:bg-gray-700"><FlipVertical size={18}/></button>
                  </div>
              </div>
          </div>
      )}

      {currentTool === 'draw' && (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-300">Drawing</h3>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-400">Brush Color</label>
                <input type="color" value={brushColor} onChange={e => onBrushColorChange(e.target.value)} className="w-full h-10 p-1 bg-gray-700 border-gray-600 rounded-md cursor-pointer"/>
            </div>
            <Slider label="Brush Size" value={brushSize} onChange={onBrushSizeChange} min={1} max={50} />
        </div>
      )}
      
      {/* Fix: Show AI panel if tool is 'ai-effects' or 'remove-object' to prevent panel from disappearing. */}
      {(currentTool === 'ai-effects' || currentTool === 'remove-object') && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-300">AI Tools</h3>
          <button onClick={onRemoveBackground} className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
              <Wand2 size={16} /> Remove Background
          </button>
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-800">
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-400">Remove Object</label>
                  <ToolButton icon={Eraser} label="" isActive={currentTool === 'remove-object'} onClick={() => onToolChange('remove-object')} />
              </div>
              {currentTool === 'remove-object' && (
                  <>
                      <p className="text-xs text-gray-500">Brush over an object to mark it for removal.</p>
                      <Slider label="Brush Size" value={brushSize} onChange={onBrushSizeChange} min={1} max={50} />
                      <button onClick={onRemoveObject} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg mt-2">
                          Remove
                      </button>
                  </>
              )}
          </div>
          <div className="border-b border-gray-700 my-2"></div>
           <h3 className="text-lg font-semibold text-gray-300">Creative AI Effects</h3>
           <div className="grid grid-cols-2 gap-2">
                {aiEffects.map(effect => (
                    <button key={effect.name} onClick={() => onApplyAiEffect(effect.prompt)} className="text-sm p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
                        {effect.name}
                    </button>
                ))}
           </div>
           <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-800">
            <label className="text-sm font-medium text-gray-400">Custom Prompt</label>
            <textarea
                value={customAiPrompt}
                onChange={(e) => setCustomAiPrompt(e.target.value)}
                placeholder="e.g., 'make it a watercolor painting'"
                className="w-full bg-gray-700 text-white rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
            />
            <button onClick={handleApplyCustomEffect} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">
                Apply
            </button>
        </div>
        </div>
      )}


      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-gray-700">
        <button onClick={onResetAll} className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
          <Trash2 size={16} /> Reset All
        </button>
        <button onClick={onDownload} className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
};
