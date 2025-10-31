import React, { useRef, useEffect, useState } from 'react';
import { Filters, Transforms, Drawing, Point, Crop, Tool } from '../types';
import { imageUtils } from '../utils/imageUtils';
import { CornerDownLeft, CornerUpRight, Scissors, Check, X } from 'lucide-react';

interface CanvasProps {
  imageUrl: string;
  filters: Filters;
  transforms: Transforms;
  drawing: Drawing;
  currentTool: Tool;
  removeObjectMask: Drawing;
  isErasingObject: boolean;
  onDrawStart: (point: Point) => void;
  onDraw: (point: Point) => void;
  onDrawEnd: () => void;
  onCrop: (crop: Crop) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  cropAspectRatio: number | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  imageUrl,
  filters,
  transforms,
  drawing,
  currentTool,
  removeObjectMask,
  isErasingObject,
  onDrawStart,
  onDraw,
  onDrawEnd,
  onCrop,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  cropAspectRatio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState({ startX: 0, startY: 0, x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (currentTool !== 'crop') {
      setIsCropping(false);
    }
  }, [currentTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      if (canvas && ctx && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const imageAspectRatio = image.width / image.height;
        
        let canvasWidth = containerWidth;
        let canvasHeight = containerWidth / imageAspectRatio;

        if (canvasHeight > containerHeight) {
          canvasHeight = containerHeight;
          canvasWidth = containerHeight * imageAspectRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        imageRef.current = image;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        
        const { rotate, scaleX, scaleY } = transforms;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotate * (Math.PI / 180));
        ctx.scale(scaleX, scaleY);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.filter = imageUtils.getFilterString(filters);

        let sourceX = 0, sourceY = 0, sourceWidth = image.width, sourceHeight = image.height;
        if (transforms.crop) {
            sourceX = transforms.crop.x * image.width;
            sourceY = transforms.crop.y * image.height;
            sourceWidth = transforms.crop.width * image.width;
            sourceHeight = transforms.crop.height * image.height;
        }
        ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        
        ctx.restore();
        
        ctx.save();
        drawing.lines.forEach(line => {
          ctx.strokeStyle = line.color;
          ctx.lineWidth = line.size;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          line.points.forEach((point, index) => {
            const x = point.x * canvas.width;
            const y = point.y * canvas.height;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
        });
        ctx.restore();

        if (currentTool === 'remove-object' && !isErasingObject) {
            ctx.save();
            removeObjectMask.lines.forEach(line => {
              ctx.strokeStyle = line.color;
              ctx.lineWidth = line.size;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.beginPath();
              line.points.forEach((point, index) => {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                if (index === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              });
              ctx.stroke();
            });
            ctx.restore();
        }
      }
    };
  }, [imageUrl, filters, transforms, drawing, removeObjectMask, currentTool, isErasingObject]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Convert to relative coordinates
    const x = (clientX - rect.left) / canvas.width;
    const y = (clientY - rect.top) / canvas.height;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentTool === 'draw' || currentTool === 'remove-object') {
      onDrawStart(getPoint(e));
    } else if (currentTool === 'crop') {
      setIsCropping(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      setCropRect({ startX, startY, x: startX, y: startY, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentTool === 'draw' || currentTool === 'remove-object') {
      onDraw(getPoint(e));
    } else if (currentTool === 'crop' && isCropping) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      let width = Math.abs(currentX - cropRect.startX);
      let height = Math.abs(currentY - cropRect.startY);

      if (cropAspectRatio) {
        if (width / height > cropAspectRatio) {
            height = width / cropAspectRatio;
        } else {
            width = height * cropAspectRatio;
        }
      }

      setCropRect(prev => ({
        ...prev,
        x: Math.min(prev.startX, prev.startX + (currentX > prev.startX ? width : -width)),
        y: Math.min(prev.startY, prev.startY + (currentY > prev.startY ? height : -height)),
        width: width,
        height: height,
      }));
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentTool === 'draw' || currentTool === 'remove-object') {
      onDrawEnd();
    } else if (currentTool === 'crop' && isCropping) {
        // The crop is not confirmed until the checkmark is clicked
    }
  };

  const confirmCrop = () => {
    if (!isCropping) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentCrop = transforms.crop || { x: 0, y: 0, width: 1, height: 1 };
    
    const newCrop: Crop = {
        x: currentCrop.x + (cropRect.x / canvas.width) * currentCrop.width,
        y: currentCrop.y + (cropRect.y / canvas.height) * currentCrop.height,
        width: (cropRect.width / canvas.width) * currentCrop.width,
        height: (cropRect.height / canvas.height) * currentCrop.height,
    };

    onCrop(newCrop);
    setIsCropping(false);
  };
  
  const cancelCrop = () => {
    setIsCropping(false);
    setCropRect({ startX: 0, startY: 0, x: 0, y: 0, width: 0, height: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-gray-900/50 rounded-lg overflow-hidden">
        <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => { 
                if (currentTool === 'draw' || currentTool === 'remove-object') onDrawStart(getPoint(e))
            }}
            onTouchMove={(e) => {
                if (currentTool === 'draw' || currentTool === 'remove-object') onDraw(getPoint(e))
            }}
            onTouchEnd={onDrawEnd}
            className={`cursor-crosshair max-w-full max-h-full object-contain`}
        />
        {isCropping && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div
                    className="absolute border-2 border-dashed border-white bg-black bg-opacity-50"
                    style={{
                        left: cropRect.x,
                        top: cropRect.y,
                        width: cropRect.width,
                        height: cropRect.height,
                    }}
                ></div>
            </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2 text-white">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700">
                <CornerDownLeft size={18} />
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700">
                <CornerUpRight size={18} />
            </button>
        </div>
        {currentTool === 'crop' && (
            <div className="absolute bottom-4 flex gap-4 text-white">
                 {!isCropping && <div className="text-sm bg-black/50 p-2 rounded-md flex items-center gap-2"><Scissors size={16} /> Drag on the image to select an area to crop.</div>}
                 {isCropping && cropRect.width > 0 && (
                    <>
                        <button onClick={confirmCrop} className="p-2 bg-green-600 rounded-full hover:bg-green-500">
                            <Check size={20} />
                        </button>
                        <button onClick={cancelCrop} className="p-2 bg-red-600 rounded-full hover:bg-red-500">
                            <X size={20} />
                        </button>
                    </>
                 )}
            </div>
        )}
    </div>
  );
};