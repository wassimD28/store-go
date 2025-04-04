import Image from "next/image";
import { Badge } from "@/client/components/ui/badge";
import { formatDate } from "@/lib/utils";
import ColorVariantSelector from "../../selector/colorVariantSelector";
import ZoomableImage from "../../image/zoomableImage";

interface DetailsTabContentProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock_quantity: number;
    image_urls: string | null;
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
  // Parse image URLs from string with safe error handling
  let imageUrls: string[] = [];
  if (product.image_urls) {
    try {
      imageUrls = JSON.parse(product.image_urls);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      if (
        typeof product.image_urls === "string" &&
        (product.image_urls.startsWith("http") ||
          product.image_urls.startsWith("/"))
      ) {
        imageUrls = [product.image_urls];
      }
    }
  }

  // Ensure imageUrls is an array
  if (!Array.isArray(imageUrls)) {
    imageUrls = [];
  }

  const mainImage =
    imageUrls.length > 0 ? imageUrls[0] : "/api/placeholder/400/400";

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
  // log colors
  console.log("Colors:", colorVariants);

  return (
    <div className="flex flex-col gap-6 px-3 md:flex-row">
      <div className="relative w-full flex-none md:w-1/2">
        <div className="relative flex h-64 w-full justify-center overflow-hidden rounded-md border">
          <ZoomableImage
            className="object-cover"
            src={mainImage}
            alt={product.name}
            width={256}
            height={256}
          />
        </div>
        {imageUrls.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {imageUrls.slice(0, 4).map((url: string, index: number) => (
              <div
                key={index}
                className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200"
              >
                <Image
                  src={url}
                  alt={`${product.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
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
