
import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import RustVisualizer from "@/components/RustVisualizer";
import { Button } from "@/components/ui/button";
import { detectRust, saveImageToStorage } from "@/services/sam2Service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Point, RustAnalysisResult } from "@/lib/types";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rustResult, setRustResult] = useState<RustAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [userPoints, setUserPoints] = useState<Point[]>([]);

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    setRustResult(null); // Clear previous results
    setUserPoints([]); // Clear any previous points
    setIsSelectingPoints(false);
  };

  const handleAnalyzeRust = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    try {
      // Process the image with SAM2 API
      const result = await detectRust(selectedImage);
      
      if (result) {
        setRustResult(result);
        toast.success("Rust analysis completed");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to analyze the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPoint = (point: Point) => {
    setUserPoints(prev => [...prev, point]);
  };

  const handleTogglePointSelection = () => {
    setIsSelectingPoints(prev => !prev);
  };

  const handleRescanWithPoints = async () => {
    if (!selectedImage || userPoints.length === 0) return;

    setIsProcessing(true);
    try {
      // Process the image with user-defined points
      const result = await detectRust(selectedImage, userPoints);
      
      if (result) {
        setRustResult(result);
        setIsSelectingPoints(false); // Exit point selection mode
        toast.success("Enhanced rust analysis completed");
      }
    } catch (error) {
      console.error("Error processing image with points:", error);
      toast.error("Failed to analyze with your points. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveImage = async (imageData: string) => {
    setIsSaving(true);
    try {
      // Save the image (in a real app, this would save to Firebase Storage)
      const imageUrl = await saveImageToStorage(imageData);
      
      toast.success("Image saved successfully");
      
      // In a real app, you might store metadata in Firestore here
      console.log("Image saved, URL:", imageUrl);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPoints = () => {
    setUserPoints([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rust Vision Painter</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload an image of a metal object to detect and visualize rust areas
          </p>
        </div>

        <div className="space-y-8">
          <ImageUploader onImageSelect={handleImageSelect} />

          {selectedImage && !rustResult && !isProcessing && (
            <div className="text-center">
              <Button 
                onClick={handleAnalyzeRust} 
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                Analyze Rust
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                The analysis will highlight areas of rust on your image
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-2" />
              <p className="text-lg font-medium text-gray-700">
                {userPoints.length > 0 ? "Enhancing detection with your points..." : "Analyzing image for rust..."}
              </p>
            </div>
          )}

          {rustResult && selectedImage && (
            <div className="space-y-4">
              {!isSelectingPoints ? (
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={handleTogglePointSelection}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Mark Missing Rust Points
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={handleTogglePointSelection}
                    variant="outline"
                  >
                    Done Marking
                  </Button>
                  {userPoints.length > 0 && (
                    <Button 
                      onClick={handleClearPoints}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Clear Points ({userPoints.length})
                    </Button>
                  )}
                </div>
              )}

              <RustVisualizer 
                originalImage={selectedImage}
                maskData={rustResult.maskData}
                width={rustResult.width}
                height={rustResult.height}
                userPoints={userPoints}
                isSelectingPoints={isSelectingPoints}
                onAddPoint={isSelectingPoints ? handleAddPoint : undefined}
                onRescan={userPoints.length > 0 ? handleRescanWithPoints : undefined}
                onSave={handleSaveImage}
              />
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Rust Vision Painter • Built with SAM2 Technology</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
