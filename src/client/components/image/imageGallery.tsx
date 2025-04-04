// src/client/components/image/imageGallery.tsx

import { useState } from "react";
import Image from "next/image";
import ZoomableImage from "./zoomableImage";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  onImageSelect?: (imageUrl: string, index: number) => void;
  defaultIndex?: number;
  maxThumbnails?: number;
  className?: string;
  thumbnailClassName?: string;
  selectedThumbnailClassName?: string;
  mainImageWidth?: number;
  mainImageHeight?: number;
  thumbnailSize?: number;
  zoomable?: boolean;
}

/**
 * A reusable component for displaying and selecting product images
 *
 * Features:
 * - Displays a main image with optional zooming functionality
 * - Shows thumbnails that can be clicked to change the main image
 * - Visually highlights the currently selected thumbnail
 * - Exposes the selected image through a callback
 */
function ImageGallery({
  images,
  alt,
  onImageSelect,
  defaultIndex = 0,
  maxThumbnails = 4,
  className = "",
  thumbnailClassName = "",
  selectedThumbnailClassName = "border-2 border-primary",
  mainImageWidth = 256,
  mainImageHeight = 256,
  thumbnailSize = 16,
  zoomable = true,
}: ImageGalleryProps) {
  // Use provided images or fallback to placeholder
  const imageUrls = images.length > 0 ? images : ["/api/placeholder/400/400"];

  // State to track the selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(
    defaultIndex < imageUrls.length ? defaultIndex : 0,
  );

  // Get the selected image URL
  const selectedImage = imageUrls[selectedImageIndex];

  // Handle image selection when thumbnail is clicked
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);

    // Call the callback if provided
    if (onImageSelect) {
      onImageSelect(imageUrls[index], index);
    }
  };

  // Function to get thumbnail size classes based on thumbnailSize prop
  const getThumbnailSizeClasses = () => {
    // Use fixed Tailwind classes instead of dynamic ones
    switch (thumbnailSize) {
      case 8:
        return "h-8 w-8";
      case 10:
        return "h-10 w-10";
      case 12:
        return "h-12 w-12";
      case 14:
        return "h-14 w-14";
      case 16:
        return "h-16 w-16";
      case 20:
        return "h-20 w-20";
      case 24:
        return "h-24 w-24";
      default:
        return "h-16 w-16"; // Default to h-16 w-16
    }
  };

  return (
    <div className={className}>
      {/* Main image display */}
      <div className="relative flex h-64 w-full justify-center overflow-hidden rounded-md border">
        {zoomable ? (
          <ZoomableImage
            className="object-cover"
            src={selectedImage}
            alt={alt}
            width={mainImageWidth}
            height={mainImageHeight}
          />
        ) : (
          <Image
            className="object-cover"
            src={selectedImage}
            alt={alt}
            width={mainImageWidth}
            height={mainImageHeight}
          />
        )}
      </div>

      {/* Thumbnails display - only show if we have more than one image */}
      {imageUrls.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {imageUrls
            .slice(0, maxThumbnails)
            .map((url: string, index: number) => (
              <div
                key={index}
                className={`relative cursor-pointer overflow-hidden rounded-md ${getThumbnailSizeClasses()} ${thumbnailClassName} ${selectedImageIndex === index ? selectedThumbnailClassName : "border border-gray-200"}`}
                onClick={() => handleImageSelect(index)}
                aria-label={`Select image ${index + 1}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleImageSelect(index);
                  }
                }}
              >
                <Image
                  src={url}
                  alt={`${alt} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
