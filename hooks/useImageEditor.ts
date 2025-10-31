import { useState, useCallback, useEffect } from 'react';
import { Filters, Transforms, Drawing, Tool, Crop, Point } from '../types';
import { imageUtils } from '../utils/imageUtils';
import { geminiService } from '../services/geminiService';

const initialFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

const initialTransforms: Transforms = {
  rotate: 0,
  scaleX: 1,
  scaleY: 1,
  crop: null,
};

const initialDrawing: Drawing = {
  lines: [],
};

export const useImageEditor = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [transforms, setTransforms] = useState<Transforms>(initialTransforms);
  const [drawing, setDrawing] = useState<Drawing>(initialDrawing);
  
  const [history, setHistory] = useState<{ filters: Filters, transforms: Transforms, drawing: Drawing }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [currentTool, setCurrentTool] = useState<Tool>('filters');
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(10);
  
  const [removeObjectMask, setRemoveObjectMask] = useState<Drawing>(initialDrawing);
  const [isErasingObject, setIsErasingObject] = useState(false);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | null>(null);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const saveStateToHistory = useCallback(() => {
    const currentState = { filters, transforms, drawing };
    // To avoid adding duplicate states
    if (JSON.stringify(currentState) === JSON.stringify(history[historyIndex])) {
        return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, filters, transforms, drawing]);

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setFilters(prevState.filters);
      setTransforms(prevState.transforms);
      setDrawing(prevState.drawing);
      setHistoryIndex(newIndex);
    }
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setFilters(nextState.filters);
      setTransforms(nextState.transforms);
      setDrawing(nextState.drawing);
      setHistoryIndex(newIndex);
    }
  }, [canRedo, history, historyIndex]);

  const resetState = useCallback(() => {
    setFilters(initialFilters);
    setTransforms(initialTransforms);
    setDrawing(initialDrawing);
    const initialState = { filters: initialFilters, transforms: initialTransforms, drawing: initialDrawing };
    setHistory([initialState]);
    setHistoryIndex(0);
    setRemoveObjectMask(initialDrawing);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    const base64 = await imageUtils.fileToBase64(file);
    setImageUrl(base64);
    setOriginalImageUrl(base64);
    resetState();
    setIsLoading(false);
  }, [resetState]);
  
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const applyFilterPreset = useCallback((presetFilters: Filters) => {
    setFilters(presetFilters);
    saveStateToHistory();
  }, [saveStateToHistory]);

  const handleFilterChangeEnd = useCallback(() => {
    saveStateToHistory();
  }, [saveStateToHistory]);
  
  const updateTransforms = useCallback((newTransforms: Partial<Transforms>) => {
    setTransforms(prev => ({ ...prev, ...newTransforms }));
  }, []);

  const rotateImage = useCallback((degrees: number) => {
    setTransforms(prev => ({ ...prev, rotate: (prev.rotate + degrees) % 360 }));
    saveStateToHistory();
  }, [saveStateToHistory]);

  const flipImage = useCallback((axis: 'horizontal' | 'vertical') => {
    if (axis === 'horizontal') {
      setTransforms(prev => ({ ...prev, scaleX: prev.scaleX * -1 }));
    } else {
      setTransforms(prev => ({ ...prev, scaleY: prev.scaleY * -1 }));
    }
    saveStateToHistory();
  }, [saveStateToHistory]);

  const startDrawing = useCallback((point: Point) => {
    if (currentTool !== 'draw' && currentTool !== 'remove-object') return;
    setIsDrawing(true);
    
    if (currentTool === 'draw') {
        const newLine = { points: [point], color: brushColor, size: brushSize };
        setDrawing(prev => ({ lines: [...prev.lines, newLine] }));
    } else if (currentTool === 'remove-object') {
        const newLine = { points: [point], color: 'rgba(255,0,0,0.5)', size: brushSize };
        setRemoveObjectMask(prev => ({ lines: [...prev.lines, newLine] }));
    }
  }, [brushColor, brushSize, currentTool]);

  const draw = useCallback((point: Point) => {
    if (!isDrawing) return;

    if (currentTool === 'draw') {
        setDrawing(prev => {
            const newLines = [...prev.lines];
            newLines[newLines.length - 1].points.push(point);
            return { lines: newLines };
        });
    } else if (currentTool === 'remove-object') {
        setRemoveObjectMask(prev => {
            const newLines = [...prev.lines];
            newLines[newLines.length - 1].points.push(point);
            return { lines: newLines };
        });
    }
  }, [isDrawing, currentTool]);

  const endDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      if(currentTool === 'draw') {
        saveStateToHistory();
      }
    }
  }, [isDrawing, saveStateToHistory, currentTool]);

  const applyCrop = useCallback((crop: Crop) => {
    setTransforms(prev => ({ ...prev, crop }));
    saveStateToHistory();
    setCurrentTool('filters');
  }, [saveStateToHistory]);
  
  const resetAll = useCallback(() => {
    if(originalImageUrl) {
      setImageUrl(originalImageUrl);
      resetState();
    }
  }, [originalImageUrl, resetState]);
  
  const saveDraft = useCallback(() => {
    if (imageUrl && originalImageUrl) {
        const draft = {
            imageUrl,
            originalImageUrl,
            filters,
            transforms,
            drawing,
            history,
            historyIndex
        };
        localStorage.setItem('ai-photo-editor-draft', JSON.stringify(draft));
    }
  }, [imageUrl, originalImageUrl, filters, transforms, drawing, history, historyIndex]);

  const loadDraft = useCallback(() => {
    const draftString = localStorage.getItem('ai-photo-editor-draft');
    if (draftString) {
        const draft = JSON.parse(draftString);
        setImageUrl(draft.imageUrl);
        setOriginalImageUrl(draft.originalImageUrl);
        setFilters(draft.filters);
        setTransforms(draft.transforms);
        setDrawing(draft.drawing);
        setHistory(draft.history);
        setHistoryIndex(draft.historyIndex);
    }
  }, []);

  // AI features
  const applyEditsAndProcess = useCallback(async (processor: (base64Image: string) => Promise<string>) => {
    if (!imageUrl) return;
    setIsLoading(true);
    try {
      const editedImage = await imageUtils.applyEditsToImage(imageUrl, filters, transforms, drawing);
      const result = await processor(editedImage);
      setImageUrl(result);
      setOriginalImageUrl(result);
      resetState();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, filters, transforms, drawing, resetState]);

  const removeBackground = useCallback(() => {
    applyEditsAndProcess(base64 => geminiService.removeBackground(base64));
  }, [applyEditsAndProcess]);
  
  const removeObject = useCallback(async () => {
    if (!imageUrl || removeObjectMask.lines.length === 0) return;
    setIsLoading(true);
    setIsErasingObject(true);
    try {
      const baseImage = await imageUtils.applyEditsToImage(imageUrl, filters, transforms, drawing);
      const maskedImage = await imageUtils.applyEditsToImage(baseImage, initialFilters, initialTransforms, removeObjectMask);
      const result = await geminiService.removeObject(maskedImage);
      
      setImageUrl(result);
      setOriginalImageUrl(result);
      resetState();

    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setIsLoading(false);
      setRemoveObjectMask(initialDrawing);
      setIsErasingObject(false);
    }
  }, [imageUrl, filters, transforms, drawing, removeObjectMask, resetState]);
  
  const applyAiEffect = useCallback(async (prompt: string) => {
    if (!imageUrl || !prompt) return;
    setIsLoading(true);
    try {
      const editedImage = await imageUtils.applyEditsToImage(imageUrl, filters, transforms, drawing);
      const result = await geminiService.applyEffect(editedImage, prompt);
      setImageUrl(result);
      setOriginalImageUrl(result);
      resetState();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, filters, transforms, drawing, resetState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
        saveDraft();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraft]);

  return {
    imageUrl,
    filters,
    transforms,
    drawing,
    currentTool,
    isLoading,
    isDrawing,
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
    updateTransforms,
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
  };
};