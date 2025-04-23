
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Point } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCanvas } from "@/hooks/useCanvas";
import { RustVisualizerToolbar } from "./RustVisualizerToolbar";

interface RustVisualizerProps {
  originalImage: string;
  maskData: Uint8Array | number[];
  width: number;
  height: number;
  onAddPoint?: (point: Point) => void;
  onRescan?: () => void;
  onSave?: (imageData: string) => void;
  userPoints?: Point[];
  isSelectingPoints?: boolean;
}

export default function RustVisualizer({
  originalImage,
  maskData,
  width,
  height,
  onAddPoint,
  onRescan,
  onSave,
  userPoints = [],
  isSelectingPoints = false,
}: RustVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const {
    canvas,
    initializeCanvas,
    updateZoom,
    downloadCanvas,
    zoomLevel,
    setZoomLevel,
  } = useCanvas({
    originalImage,
    width,
    height,
    showOverlay,
    maskData,
    userPoints,
    isSelectingPoints,
    onAddPoint,
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = initializeCanvas(canvasRef.current);
    return () => {
      fabricCanvas.dispose();
    };
  }, [originalImage, maskData]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleSave = () => {
    if (!canvas || !onSave) return;
    
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1
    });
    
    onSave(dataURL);
  };

  const toggleOverlay = () => {
    setShowOverlay((prev) => !prev);
  };

  return (
    <Card className="p-4 overflow-hidden">
      <RustVisualizerToolbar
        showOverlay={showOverlay}
        zoomLevel={zoomLevel}
        onToggleOverlay={toggleOverlay}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onDownload={downloadCanvas}
        onSave={onSave ? handleSave : undefined}
      />
      
      {isSelectingPoints && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertDescription>
            Click on areas of the image where you think rust might be present but wasn't detected.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="canvas-container overflow-auto" style={{ maxHeight: "70vh" }}>
        <canvas ref={canvasRef} />
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {showOverlay ? "Rust areas highlighted in orange" : "Overlay hidden - showing original image"}
          {userPoints.length > 0 && ` • ${userPoints.length} point${userPoints.length === 1 ? '' : 's'} marked`}
        </p>
        
        {onRescan && userPoints.length > 0 && (
          <Button 
            onClick={onRescan}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Rescan with points
          </Button>
        )}
      </div>
    </Card>
  );
}
