import React from 'react';
import { useImageEditor } from './hooks/useImageEditor';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { EditPanel } from './components/EditPanel';
import { Canvas } from './components/Canvas';
import { Loader } from './components/Loader';
import { imageUtils } from './utils/imageUtils';

function App() {
  const {
    imageUrl,
    filters,
    transforms,
    drawing,
    currentTool,
    isLoading,
    brushColor,
    brushSize,
    canUndo,
    canRedo,
    removeObjectMask,
    isErasingObject,
    cropAspectRatio,
    handleImageUpload,
    setCurrentTool,
    updateFilters,
    startDrawing,
    draw,
    endDrawing,
    undo,
    redo,
    applyCrop,
    setBrushColor,
    setBrushSize,
    resetAll,
    loadDraft,
    removeBackground,
    removeObject,
    applyAiEffect,
    handleFilterChangeEnd,
    applyFilterPreset,
    rotateImage,
    flipImage,
    setCropAspectRatio,
  } = useImageEditor();
  
  const handleDownload = async () => {
    if (!imageUrl) return;
    const finalImage = await imageUtils.applyEditsToImage(imageUrl, filters, transforms, drawing);
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = finalImage;
    link.click();
  };


  return (
    <div className="bg-gray-800 text-white min-h-screen flex flex-col p-4 font-sans">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-stretch gap-4 overflow-hidden">
        {!imageUrl ? (
          <div className="w-full flex-grow flex items-center justify-center">
            <FileUploader onImageUpload={handleImageUpload} onLoadDraft={loadDraft} />
          </div>
        ) : (
          <>
            <div className="flex-grow relative flex items-center justify-center min-h-[50vh] md:min-h-0">
              {isLoading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 rounded-lg">
                      <Loader />
                  </div>
              )}
              <Canvas
                imageUrl={imageUrl}
                filters={filters}
                transforms={transforms}
                drawing={drawing}
                currentTool={currentTool}
                removeObjectMask={removeObjectMask}
                isErasingObject={isErasingObject}
                onDrawStart={startDrawing}
                onDraw={draw}
                onDrawEnd={endDrawing}
                onCrop={applyCrop}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                cropAspectRatio={cropAspectRatio}
              />
            </div>
            <EditPanel
              filters={filters}
              onFilterChange={updateFilters}
              onFilterChangeEnd={handleFilterChangeEnd}
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              brushColor={brushColor}
              onBrushColorChange={setBrushColor}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              onResetAll={resetAll}
              onDownload={handleDownload}
              onRemoveBackground={removeBackground}
              onRemoveObject={removeObject}
              onApplyAiEffect={applyAiEffect}
              onApplyFilterPreset={applyFilterPreset}
              onRotateImage={rotateImage}
              onFlipImage={flipImage}
              cropAspectRatio={cropAspectRatio}
              onCropAspectRatioChange={setCropAspectRatio}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;