
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, Eye, EyeOff, Save } from "lucide-react";

interface RustVisualizerToolbarProps {
  showOverlay: boolean;
  zoomLevel: number;
  onToggleOverlay: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
  onSave?: () => void;
}

export const RustVisualizerToolbar = ({
  showOverlay,
  zoomLevel,
  onToggleOverlay,
  onZoomIn,
  onZoomOut,
  onDownload,
  onSave,
}: RustVisualizerToolbarProps) => {
  return (
    <div className="flex justify-between mb-4">
      <h3 className="text-lg font-semibold">Rust Analysis Results</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleOverlay}
          title={showOverlay ? "Hide Overlay" : "Show Overlay"}
        >
          {showOverlay ? <EyeOff size={18} /> : <Eye size={18} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.5}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          disabled={zoomLevel >= 2.5}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </Button>
        <Button
          onClick={onDownload}
          className="bg-purple-600 hover:bg-purple-700"
          title="Download Result"
        >
          <Download size={18} className="mr-2" />
          Download
        </Button>
        {onSave && (
          <Button
            onClick={onSave}
            variant="outline"
            title="Save to Storage"
          >
            <Save size={18} className="mr-2" />
            Save
          </Button>
        )}
      </div>
    </div>
  );
};
