import { Badge } from "@/client/components/ui/badge";
import { formatDate } from "@/lib/utils";
import ColorVariantSelector from "../../selector/colorVariantSelector";
import ImageGallery from "../../image/imageGallery";

interface DetailsTabContentProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock_quantity: number;
    image_urls: string[];
    created_at: Date;
    updated_at: Date;
    attributes?: Record<string, string>;
  };
  categoryName?: string;
  subcategoryName?: string | null;
}

function DetailsTabContent({
  product,
  categoryName,
  subcategoryName,
}: DetailsTabContentProps) {
  // Handle image URLs with improved parsing logic
  const imageUrls: string[] = product.image_urls || [];

  // Format price
  const formattedPrice = parseFloat(product.price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  // Get color variants from product attributes or use defaults
  const getColorVariants = () => {
    if (!product.attributes?.colors) return [];

    try {
      return JSON.parse(product.attributes.colors);
    } catch (error) {
      console.error("Error parsing color variants:", error);
      return [];
    }
  };

  const colorVariants = getColorVariants();

  // Optional: Handle image selection event
  const handleImageSelect = (imageUrl: string, index: number) => {
    console.log(`Selected image ${index + 1}: ${imageUrl}`);
    // You can add any additional logic here when an image is selected
  };

  return (
    <div className="flex flex-col gap-6 px-3 md:flex-row">
      <div className="relative w-full flex-none md:w-1/2">
        {/* Use our new ImageGallery component */}
        <ImageGallery
          images={imageUrls}
          alt={product.name}
          onImageSelect={handleImageSelect}
          maxThumbnails={4}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Badge className="mt-2 w-fit bg-green-500">
          {product.stock_quantity > 0 ? "Published" : "Draft"}
        </Badge>
        <h1 className="text-2xl">{product.name}</h1>
        <h2 className="text-xl font-semibold">{formattedPrice}</h2>

        {/* Color Variant Selector */}
        {colorVariants.length > 0 && (
          <ColorVariantSelector
            colors={colorVariants}
            defaultValue={colorVariants[0]?.value}
            onChange={(color) => console.log("Selected color:", color)}
          />
        )}

        <div className="mt-4">
          <h3 className="text-sm text-foreground/50">Description:</h3>
          <p className="mt-1 text-sm">
            {product.description || "No description available"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-500">Category:</h3>
            <p>{categoryName || "Unknown"}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Subcategory:</h3>
            <p>{subcategoryName || "None"}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Stock:</h3>
            <p>{product.stock_quantity}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">SKU:</h3>
            <p>#{product.id.slice(0, 6)}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Added:</h3>
            <p>{formatDate(product.created_at)}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Last Updated:</h3>
            <p>{formatDate(product.updated_at)}</p>
          </div>
        </div>

        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-500">Attributes:</h3>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {Object.entries(product.attributes)
                .filter(([key]) => key !== "colors") // Filter out colors as we handle them separately
                .map(([key, value]) => (
                  <div key={key}>
                    <span className="text-sm font-medium">{key}: </span>
                    <span>{value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailsTabContent;
