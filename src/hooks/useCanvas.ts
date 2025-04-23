
import { useEffect, useState } from "react";
import { Canvas, Image, Circle } from "fabric";
import { Point } from "@/lib/types";
import { toast } from "sonner";

interface UseCanvasProps {
  originalImage: string;
  width: number;
  height: number;
  showOverlay: boolean;
  maskData: Uint8Array | number[];
  userPoints: Point[];
  isSelectingPoints: boolean;
  onAddPoint?: (point: Point) => void;
}

export const useCanvas = ({
  originalImage,
  width,
  height,
  showOverlay,
  maskData,
  userPoints,
  isSelectingPoints,
  onAddPoint,
}: UseCanvasProps) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const RUST_COLOR = "rgba(249, 115, 22, 0.5)"; // Orange with transparency
  const POINT_COLOR = "rgba(220, 38, 38, 1)"; // Red for points

  const initializeCanvas = (canvasElement: HTMLCanvasElement) => {
    const fabricCanvas = new Canvas(canvasElement, {
      width,
      height,
    });

    setCanvas(fabricCanvas);

    // Load original image
    Image.fromURL(originalImage).then(img => {
      img.scaleToWidth(width);
      img.scaleToHeight(height);
      fabricCanvas.add(img);
      fabricCanvas.renderAll();

      // Apply mask overlay
      applyMaskToCanvas(fabricCanvas, maskData, width, height, RUST_COLOR);
    });

    return fabricCanvas;
  };

  const applyMaskToCanvas = (
    canvas: Canvas,
    maskData: Uint8Array | number[],
    width: number,
    height: number,
    color: string
  ) => {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < maskData.length; i++) {
      const pixelValue = maskData[i];
      const dataIndex = i * 4;
      
      if (pixelValue > 0) {
        imgData.data[dataIndex] = 249;     // R
        imgData.data[dataIndex + 1] = 115; // G
        imgData.data[dataIndex + 2] = 22;  // B
        imgData.data[dataIndex + 3] = 128; // A
      } else {
        imgData.data[dataIndex + 3] = 0;
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    Image.fromURL(maskCanvas.toDataURL()).then(img => {
      img.scaleToWidth(width);
      img.scaleToHeight(height);
      canvas.add(img);
      canvas.renderAll();
    });
  };

  const handleCanvasClick = (e: MouseEvent) => {
    if (!canvas || !isSelectingPoints || !onAddPoint) return;
    
    const pointer = canvas.getPointer(e);
    onAddPoint({ x: pointer.x, y: pointer.y });
  };

  const updateZoom = (newZoom: number) => {
    if (!canvas) return;
    canvas.setZoom(newZoom);
    canvas.renderAll();
  };

  const downloadCanvas = () => {
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1
    });
    
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "rust_analysis.png";
    link.click();
    
    toast.success("Image downloaded successfully");
  };

  return {
    canvas,
    initializeCanvas,
    updateZoom,
    downloadCanvas,
    zoomLevel,
    setZoomLevel,
  };
};
