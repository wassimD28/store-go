/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef, useCallback } from "react";
import { ImageKitProvider, IKUpload, IKImage } from "imagekitio-next";
import { ImagePlusIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@/client/components/ui/button";

// Authentication function for ImageKit
const authenticator = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL!}/api/auth/imagekit`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `IK Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

interface IKimageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImage?: string;
  className?: string;
}

export default function ImageKitUploader({
  onUploadSuccess,
  initialImage,
  className = "",
}: IKimageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);
  const [filePath, setFilePath] = useState<string | null>(
    initialImage ? initialImage.split("/").pop() || initialImage : null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const ikUploadRef = useRef<any | null>(null);

  // Handle successful upload
  const handleUploadSuccess = (response: any) => {
    setIsUploading(false);
    setUploadError(null);
    setImageUrl(response.url);
    setFilePath(response.filePath);
    onUploadSuccess(response.url);
  };

  // Handle upload error
  const handleUploadError = (err: any) => {
    setIsUploading(false);
    setUploadError(`Upload failed: ${err.message || "Unknown error"}`);
    console.error("Upload error:", err);
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImageUrl(null);
    setFilePath(null);
    onUploadSuccess(""); // Pass empty string to clear the form value
  };

  // Handle manual upload click
  const handleUploadClick = () => {
    if (ikUploadRef.current) {
      ikUploadRef.current.click();
    }
  };

  // Handle file selection cancel event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging],
  );

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!validateFile(file)) {
        return;
      }

      setIsUploading(true);

      try {
        const authResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/imagekit`,
        );
        if (!authResponse.ok) {
          throw new Error("Failed to fetch authentication parameters");
        }
        const { signature, expire, token } = await authResponse.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", `image-${Date.now()}.jpg`);
        formData.append(
          "publicKey",
          process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        );
        formData.append("signature", signature);
        formData.append("expire", expire.toString());
        formData.append("token", token);

        const uploadResponse = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body: formData,
          },
        );
        const result = await uploadResponse.json();
        handleUploadSuccess(result);
      } catch (error) {
        handleUploadError(error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // File validation function
  const validateFile = (file: File): boolean => {
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
      setUploadError("Please upload JPEG, PNG or WebP images only");
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size should be less than 2MB");
      return false;
    }

    return true;
  };

  return (
    <ImageKitProvider
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
      authenticator={authenticator}
    >
      <div className={`space-y-4 ${className}`}>
        {imageUrl ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-md border border-border">
            <IKImage
              path={filePath || ""}
              transformation={[{ width: 160, height: 160, quality: 80 }]}
              loading="lazy"
              className="h-full w-full object-cover"
              alt="Uploaded image"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <XIcon size={14} />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-dashed border-border bg-primary-foreground"
            } transition-colors`}
            onClick={handleUploadClick}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-primary" />
                <span className="mt-2 text-sm">Uploading...</span>
              </div>
            ) : (
              <>
                <ImagePlusIcon size={32} className="text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground text-center">
                  {isDragging ? "Drop image here" : "Click or drag to upload"}
                </span>
              </>
            )}
          </div>
        )}

        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}

        {!imageUrl && !isUploading && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            className="flex items-center gap-1"
          >
            <UploadIcon size={16} />
            <span>Upload Image</span>
          </Button>
        )}

        <div className="hidden">
          <IKUpload
            ref={ikUploadRef as any}
            fileName={`image-${Date.now()}.jpg`}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            onUploadStart={() => setIsUploading(true)}
            onChange={handleFileInputChange}
            validateFile={validateFile}
          />
        </div>
      </div>
    </ImageKitProvider>
  );
}
