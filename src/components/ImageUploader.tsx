
import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, ImagePlus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageSelect: (imageData: string) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = (file: File) => {
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onImageSelect(result);
    };
    reader.onerror = () => {
      toast.error("Failed to read the image file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className={`p-6 ${isDragging ? "border-purple-500 border-2" : "border"}`}>
      <div
        className="flex flex-col items-center justify-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        {!previewUrl ? (
          <>
            <div className="h-40 w-full flex flex-col items-center justify-center text-center p-5 bg-slate-50 rounded-md">
              <Upload className="h-10 w-10 text-purple-500 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Drag & Drop Image Here</h3>
              <p className="text-sm text-gray-500">or</p>
              <Button 
                onClick={handleBrowseClick}
                className="mt-2 bg-purple-600 hover:bg-purple-700"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Browse Images
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: JPG, PNG, WEBP
            </p>
          </>
        ) : (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-80 rounded-md object-contain" 
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </Card>
  );
}
