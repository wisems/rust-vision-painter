
import { useEffect, useRef, useState } from "react";
import { Canvas, Image } from "fabric";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface RustVisualizerProps {
  originalImage: string;
  maskData: Uint8Array | number[];
  width: number;
  height: number;
}

export default function RustVisualizer({
  originalImage,
  maskData,
  width,
  height,
}: RustVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const RUST_COLOR = "rgba(249, 115, 22, 0.5)"; // Orange with transparency

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
        </div>
      </div>
      <div className="canvas-container overflow-auto" style={{ maxHeight: "70vh" }}>
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          {showOverlay ? "Rust areas highlighted in orange" : "Overlay hidden - showing original image"}
        </p>
      </div>
    </Card>
  );
}
