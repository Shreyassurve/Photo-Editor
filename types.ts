export interface Point {
  x: number;
  y: number;
}

export interface Line {
  points: Point[];
  color: string;
  size: number;
}

export interface Drawing {
  lines: Line[];
}

export interface Filters {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transforms {
  rotate: number;
  scaleX: number;
  scaleY: number;
  crop: Crop | null;
}

export type Tool = 'filters' | 'crop' | 'draw' | 'remove-object' | 'ai-effects';

export interface EditorState {
  imageUrl: string | null;
  originalImageUrl: string | null;
  filters: Filters;
  transforms: Transforms;
  drawing: Drawing;
  history: {
    filters: Filters;
    transforms: Transforms;
    drawing: Drawing;
  }[];
  historyIndex: number;
  currentTool: Tool;
  isLoading: boolean;
  isDrawing: boolean;
  brushColor: string;
  brushSize: number;
}