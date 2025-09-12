import { useEffect, useRef, useState } from 'react';
import { AnalysisResult } from '@/services/azureVisionService';

interface ImagePreviewProps {
  file: File | null;
  imageUrl: string;
  analysisResult: AnalysisResult | null;
  showObjects: boolean;
}

const ImagePreview = ({ file, imageUrl, analysisResult, showObjects }: ImagePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (analysisResult?.type === 'objects' && showObjects && imageRef.current && canvasRef.current) {
      drawObjectDetection();
    } else if (canvasRef.current) {
      // Clear canvas when not showing objects
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [analysisResult, showObjects, imageDimensions]);

  const drawObjectDetection = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const rawObjects = (analysisResult?.data?.objects) || (analysisResult?.data?.objectsResult?.values);
    if (!canvas || !image || !rawObjects) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors
    const scaleX = image.offsetWidth / image.naturalWidth;
    const scaleY = image.offsetHeight / image.naturalHeight;

    ctx.strokeStyle = '#8B5CF6';
    ctx.fillStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.font = '12px Inter, sans-serif';

    rawObjects.forEach((obj: any) => {
      const rect = obj.rectangle || obj.boundingBox;
      const x = rect.x * scaleX;
      const y = rect.y * scaleY;
      const width = rect.w * scaleX;
      const height = rect.h * scaleY;

      // Draw bounding box
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      const confidence = obj.confidence ?? obj.tags?.[0]?.confidence ?? 0;
      const name = obj.object ?? obj.tags?.[0]?.name ?? 'object';
      const label = `${name} (${Math.round(confidence * 100)}%)`;
      const textWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 20, textWidth + 8, 18);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 4, y - 6);
      ctx.fillStyle = '#8B5CF6';
    });
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight,
      });

      // Update canvas size to match image
      if (canvasRef.current) {
        canvasRef.current.width = imageRef.current.offsetWidth;
        canvasRef.current.height = imageRef.current.offsetHeight;
      }
    }
  };

  const displaySrc = file ? URL.createObjectURL(file) : imageUrl;

  if (!displaySrc) {
    return (
      <div className="glass-card h-64 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p>No image selected</p>
          <p className="text-sm">Upload an image to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Image Preview</h3>
      
      <div className="glass-card p-4">
        <div className="relative inline-block">
          <img
            ref={imageRef}
            src={displaySrc}
            alt="Preview"
            className="max-w-full max-h-96 rounded-lg"
            onLoad={handleImageLoad}
          />
          <canvas
            ref={canvasRef}
            className="canvas-overlay rounded-lg"
            style={{
              width: imageDimensions.width,
              height: imageDimensions.height,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;