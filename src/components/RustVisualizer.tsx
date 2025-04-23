
import { useEffect, useRef, useState } from "react";
import { Canvas, Image, Circle, IEvent } from "fabric";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { Point } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const RUST_COLOR = "rgba(249, 115, 22, 0.5)"; // Orange with transparency
  const POINT_COLOR = "rgba(220, 38, 38, 1)"; // Red for points

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize fabric canvas
    const fabricCanvas = new Canvas(canvasRef.current, {
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

    return () => {
      fabricCanvas.dispose();
    };
  }, [originalImage, maskData, width, height]);

  // Apply zoom
  useEffect(() => {
    if (!canvas) return;
    
    canvas.setZoom(zoomLevel);
    canvas.renderAll();
  }, [zoomLevel, canvas]);

  // Toggle overlay visibility
  useEffect(() => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length >= 2) {
      // The second object should be our rust overlay
      objects[1].set({ visible: showOverlay });
      canvas.renderAll();
    }
  }, [showOverlay, canvas]);

  // Render user points
  useEffect(() => {
    if (!canvas) return;
    
    // Clear existing points
    const objects = canvas.getObjects();
    const pointsToRemove = objects.filter(obj => obj.data?.type === 'userPoint');
    canvas.remove(...pointsToRemove);
    
    // Add new points
    userPoints.forEach(point => {
      const circle = new Circle({
        left: point.x - 5,
        top: point.y - 5,
        radius: 5,
        fill: POINT_COLOR,
        stroke: 'white',
        strokeWidth: 2,
        selectable: false,
        data: { type: 'userPoint' }
      });
      
      canvas.add(circle);
    });
    
    canvas.renderAll();
  }, [userPoints, canvas]);

  // Set up canvas click handler for point selection
  useEffect(() => {
    if (!canvas) return;
    
    const handleCanvasClick = (e: IEvent<MouseEvent>) => {
      if (!isSelectingPoints || !onAddPoint) return;
      
      const pointer = canvas.getPointer(e.e);
      onAddPoint({ x: pointer.x, y: pointer.y });
    };
    
    if (isSelectingPoints) {
      canvas.on('mouse:down', handleCanvasClick);
    } else {
      canvas.off('mouse:down', handleCanvasClick);
    }
    
    return () => {
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [canvas, isSelectingPoints, onAddPoint]);

  const applyMaskToCanvas = (
    canvas: Canvas,
    maskData: Uint8Array | number[],
    width: number,
    height: number,
    color: string
  ) => {
    // Create a new canvas for the mask
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    // Create image data from mask
    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < maskData.length; i++) {
      const pixelValue = maskData[i];
      const dataIndex = i * 4;
      
      if (pixelValue > 0) {
        // Parse the RGBA color
        const r = 249; // Rust color R
        const g = 115; // Rust color G
        const b = 22;  // Rust color B
        const a = 128; // Semi-transparent (0.5 * 255)
        
        imgData.data[dataIndex] = r;
        imgData.data[dataIndex + 1] = g;
        imgData.data[dataIndex + 2] = b;
        imgData.data[dataIndex + 3] = a;
      } else {
        // Transparent for non-rust areas
        imgData.data[dataIndex + 3] = 0;
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    
    // Add overlay to the canvas
    Image.fromURL(maskCanvas.toDataURL()).then(img => {
      img.scaleToWidth(width);
      img.scaleToHeight(height);
      canvas.add(img);
      canvas.renderAll();
    });
  };

  const handleDownload = () => {
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

  const handleSave = () => {
    if (!canvas || !onSave) return;
    
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1
    });
    
    onSave(dataURL);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const toggleOverlay = () => {
    setShowOverlay((prev) => !prev);
  };

  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Rust Analysis Results</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleOverlay}
            title={showOverlay ? "Hide Overlay" : "Show Overlay"}
          >
            {showOverlay ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700"
            title="Download Result"
          >
            <Download size={18} className="mr-2" />
            Download
          </Button>
          {onSave && (
            <Button
              onClick={handleSave}
              variant="outline"
              title="Save to Storage"
            >
              <Save size={18} className="mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>
      
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
