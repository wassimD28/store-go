import { Badge } from "@/client/components/ui/badge";
import { formatDate } from "@/lib/utils";
import ColorVariantSelector from "../../selector/colorVariantSelector";
import ImageGallery from "../../image/imageGallery";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { ColorOption } from "../../selector/multiColorSelector";

interface DetailsTabContentProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    price: string;
    stock_quantity: number;
    image_urls: string[];
    created_at: Date;
    updated_at: Date;
    attributes?: Record<string, string>;
    colors?: ColorOption[]; // Added colors field from new schema
    size?: string[]; // Added size field from new schema
    targetGender?: string; // Added targetGender field
    unitsSold?: number; // Added unitsSold field
  };
  categoryName?: string;
  subcategoryName?: string | null;
}

function DetailsTabContent({
  product,
  categoryName,
  subcategoryName,
}: DetailsTabContentProps) {
  // Handle image URLs
  const imageUrls: string[] = product.image_urls || [];

  // Format price
  const formattedPrice = parseFloat(product.price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  // Get color variants directly from the product.colors field
  const colorVariants = Array.isArray(product.colors) ? product.colors : [];

  // Get sizes directly from the product.size field
  const sizes = Array.isArray(product.size) ? product.size : [];

  // Get status badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "out_of_stock":
        return "bg-red-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  // Handle image selection event
  const handleImageSelect = (imageUrl: string, index: number) => {
    console.log(`Selected image ${index + 1}: ${imageUrl}`);
    // You can add any additional logic here when an image is selected
  };

  return (
    <div className="flex h-full flex-col gap-6 px-3 md:flex-row">
      {/* Sticky Image Gallery Container */}
      <div className="w-full md:sticky md:top-0 md:h-fit md:w-1/2 md:self-start">
        <ImageGallery
          images={imageUrls}
          alt={product.name}
          onImageSelect={handleImageSelect}
          maxThumbnails={4}
        />
      </div>

      {/* Scrollable Product Details Container */}
      <ScrollArea className="h-full w-full md:w-1/2">
        <div className="flex flex-col gap-2 pr-2">
          {/* Status Badge */}
          <Badge
            className={`mt-2 w-fit ${getStatusBadgeColor(product.status)}`}
          >
            {product.status ?? "Unknown"}
          </Badge>

          {/* Product Name and Price */}
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

          {/* Size Display */}
          {sizes.length > 0 && (
            <div className="mt-2 space-y-2">
              <h3 className="text-sm text-foreground/50">Available Sizes:</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <Badge
                    key={`size-${index}`}
                    variant="outline"
                    className="px-3 py-1"
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-4">
            <h3 className="text-sm text-foreground/50">Description:</h3>
            <p className="mt-1 text-sm">
              {product.description || "No description available"}
            </p>
          </div>

          {/* Target Gender */}
          {product.targetGender && (
            <div className="mt-2">
              <h3 className="text-sm text-foreground/50">Target Gender:</h3>
              <p className="mt-1 text-sm capitalize">{product.targetGender}</p>
            </div>
          )}

          {/* Product Details Grid */}
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
              <h3 className="text-sm text-gray-500">Units Sold:</h3>
              <p>{product.unitsSold || 0}</p>
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

          {/* Remaining Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-6 mt-4">
              <h3 className="text-sm text-gray-500">Additional Attributes:</h3>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-sm font-medium capitalize">
                      {key}:{" "}
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default DetailsTabContent;
