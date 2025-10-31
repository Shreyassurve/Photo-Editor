import { Filters, Transforms, Drawing } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const getFilterString = (filters: Filters): string => {
  return `
    brightness(${filters.brightness}%)
    contrast(${filters.contrast}%)
    saturate(${filters.saturate}%)
    grayscale(${filters.grayscale}%)
    sepia(${filters.sepia}%)
    hue-rotate(${filters.hueRotate}deg)
  `.trim();
};

const applyEditsToImage = (
  imageUrl: string,
  filters: Filters,
  transforms: Transforms,
  drawing: Drawing
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject('Could not get canvas context');
      }

      const { rotate, scaleX, scaleY, crop } = transforms;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (crop) {
        sourceX = crop.x * img.width;
        sourceY = crop.y * img.height;
        sourceWidth = crop.width * img.width;
        sourceHeight = crop.height * img.height;
      }
      
      const angleInRadians = rotate * (Math.PI / 180);
      const sin = Math.abs(Math.sin(angleInRadians));
      const cos = Math.abs(Math.cos(angleInRadians));
      
      const newWidth = sourceWidth * cos + sourceHeight * sin;
      const newHeight = sourceWidth * sin + sourceHeight * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(angleInRadians);
      ctx.scale(scaleX, scaleY);

      ctx.filter = getFilterString(filters);
      
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);

      // Reset transforms for drawing
      ctx.filter = 'none';
      ctx.scale(1/scaleX, 1/scaleY);
      ctx.rotate(-angleInRadians);
      ctx.translate(-newWidth / 2, -newHeight / 2);


      // Draw lines relative to the cropped and transformed canvas
      drawing.lines.forEach(line => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        line.points.forEach((point, index) => {
            const pX = point.x * img.width;
            const pY = point.y * img.height;
            
            // Check if point is inside the crop area before drawing
            if (!crop || (pX >= sourceX && pX <= sourceX + sourceWidth && pY >= sourceY && pY <= sourceY + sourceHeight)) {
              // Remap point from original image coords to cropped canvas coords
              const canvasX = (pX - sourceX) * (newWidth/sourceWidth);
              const canvasY = (pY - sourceY) * (newHeight/sourceHeight);

              if (index === 0) {
                  ctx.moveTo(canvasX, canvasY);
              } else {
                  ctx.lineTo(canvasX, canvasY);
              }
            }
        });
        ctx.stroke();
      });


      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const imageUtils = {
  fileToBase64,
  getFilterString,
  applyEditsToImage,
};