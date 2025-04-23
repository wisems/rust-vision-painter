
import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import RustVisualizer from "@/components/RustVisualizer";
import { Button } from "@/components/ui/button";
import { detectRust } from "@/services/sam2Service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RustAnalysisResult {
  maskData: Uint8Array | number[];
  width: number;
  height: number;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rustResult, setRustResult] = useState<RustAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    setRustResult(null); // Clear previous results
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

          {selectedImage && !rustResult && (
            <div className="text-center">
              <Button 
                onClick={handleAnalyzeRust} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Analyze Rust"
                )}
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                The analysis will highlight areas of rust on your image
              </p>
            </div>
          )}

          {rustResult && selectedImage && (
            <RustVisualizer 
              originalImage={selectedImage}
              maskData={rustResult.maskData}
              width={rustResult.width}
              height={rustResult.height}
            />
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
