"use client";

import { formatDate } from "@/lib/utils";
import { DataTable } from "@/client/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/client/components/ui/checkbox";
import { Button } from "@/client/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { SortableHeader } from "@/client/components/data-table/sortableHeader";
import { useRouter } from "next/navigation";
import { DeleteProductDialog } from "@/client/components/dialogs/deleteProductDialog";
import { useState } from "react";
import { ProductViewSheet } from "../../sheet/product-view-sheet";
import Image from "next/image";
import { Badge } from "@/client/components/ui/badge";
import { ColorOption } from "../../selector/multiColorSelector";
import { useEffect } from "react";

// Interface for products to be displayed in the table - updated to match new schema
interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: string;
  status: string;
  stock_quantity: number;
  categoryId: string;
  subcategoryId: string | null;
  image_urls: string[];
  created_at: Date;
  updated_at: Date;
  attributes: Record<string, string>;
  colors: ColorOption[];
  size: string[];
  targetGender: "male" | "female" | "unisex";
  unitsSold: number;
}

interface ProductTableClientProps {
  products: Product[];
  categoryNames: Record<string, string>; // Maps category IDs to names
  subcategoryNames: Record<string, string>; // Maps subcategory IDs to names
  initialProductId?: string; // New prop for initial product to select
  initialTab?: string; // New prop for initial tab to open
}

export function ProductTableClient({
  products,
  categoryNames,
  subcategoryNames,
  initialProductId,
  initialTab,
}: ProductTableClientProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const refreshData = () => {
    router.refresh();
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  useEffect(() => {
    if (initialProductId) {
      const productToOpen = products.find((p) => p.id === initialProductId);
      if (productToOpen) {
        setSelectedProduct(productToOpen);
        setIsViewOpen(true);
      }
    }
  }, [initialProductId, products]);

  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Draft
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Out of Stock
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Archived
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get gender badge styling
  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case "male":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Men
          </Badge>
        );
      case "female":
        return (
          <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">
            Women
          </Badge>
        );
      case "unisex":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Unisex
          </Badge>
        );
      default:
        return <Badge>{gender}</Badge>;
    }
  };

  // Generate a simple SKU from product ID
  const generateSKU = (id: string) => {
    // Extract first 6 characters of the ID and convert to uppercase
    return id.substring(0, 6).toUpperCase();
  };

  // Define columns for the product table
  const columns: ColumnDef<Product>[] = [
    // Checkbox column
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // Product column with image and name
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Product" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const imageUrl =
          product.image_urls && product.image_urls.length > 0
            ? product.image_urls[0]
            : "/placeholder-product.png";

        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <div className="text-sm font-medium">{product.name}</div>
              <div className="text-xs text-muted-foreground">
                Stock: {product.stock_quantity}
              </div>
            </div>
          </div>
        );
      },
      minSize: 400,
    },
    // SKU column
    {
      accessorKey: "id",
      header: "SKU",
      cell: ({ row }) => {
        return <div>{generateSKU(row.original.id)}</div>;
      },
    },
    // Category column
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as string;
        return <div>{categoryNames[categoryId] || "Unknown"}</div>;
      },
    },
    // Price column
    {
      accessorKey: "price",
      header: ({ column }) => <SortableHeader column={column} title="Price" />,
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return <div>${price.toFixed(2)}</div>;
      },
    },
    // Status column
    {
      accessorKey: "status",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return getStatusBadge(status);
      },
      minSize: 180,
    },
    // Target Gender column (new)
    {
      accessorKey: "targetGender",
      header: ({ column }) => <SortableHeader column={column} title="Gender" />,
      cell: ({ row }) => {
        const gender = row.getValue("targetGender") as string;
        return getGenderBadge(gender);
      },
    },
    // Units Sold column (new)
    {
      accessorKey: "unitsSold",
      header: ({ column }) => <SortableHeader column={column} title="Sold" />,
      cell: ({ row }) => {
        const soldCount = row.getValue("unitsSold") as number;
        return <div>{soldCount}</div>;
      },
    },
    // Added date column
    {
      accessorKey: "created_at",
      header: ({ column }) => <SortableHeader column={column} title="Added" />,
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    // Stock quantity column
    {
      accessorKey: "stock_quantity",
      header: ({ column }) => <SortableHeader column={column} title="Stock" />,
      cell: ({ row }) => {
        const quantity = row.getValue("stock_quantity") as number;
        return <div>{quantity}</div>;
      },
    },
    // Colors column (new - hidden by default)
    {
      accessorKey: "colors",
      header: "Colors",
      cell: ({ row }) => {
        const colors = row.original.colors;
        if (!colors || colors.length === 0) return <div>-</div>;

        return (
          <div className="flex flex-wrap gap-1">
            {colors.slice(0, 3).map((color, i) => {
              return color.customColor ? (
                <div
                  key={i}
                  className="h-4 w-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.customColor }}
                />
              ) : (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full border border-gray-300 ${color.colorClass}`}
                />
              );
            })}
            {colors.length > 3 && <span>+{colors.length - 3}</span>}
          </div>
        );
      },
    },
    // Sizes column (new - hidden by default)
    {
      accessorKey: "size",
      header: "Sizes",
      cell: ({ row }) => {
        const sizes = row.original.size;
        if (!sizes || sizes.length === 0) return <div>-</div>;

        return (
          <div className="flex flex-wrap gap-1">
            {sizes.slice(0, 3).map((size, i) => (
              <span key={i} className="rounded bg-gray-100 px-1 text-xs">
                {size}
              </span>
            ))}
            {sizes.length > 3 && (
              <span className="text-xs">+{sizes.length - 3}</span>
            )}
          </div>
        );
      },
    },
    // Subcategory column (hidden by default)
    {
      accessorKey: "subcategoryId",
      header: "Subcategory",
      cell: ({ row }) => {
        const subcategoryId = row.getValue("subcategoryId") as string | null;
        return (
          <div>
            {subcategoryId ? subcategoryNames[subcategoryId] || "Unknown" : "-"}
          </div>
        );
      },
    },
    // Description column (hidden by default)
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[200px] truncate">
            {description || "No description"}
          </div>
        );
      },
    },
    // Updated date column (hidden by default)
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <SortableHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    // Actions column
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex space-x-2">
            {/* View Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewProduct(product)}
              title="View Product"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(
                  `/stores/${product.storeId}/products/edit/${product.id}`,
                );
              }}
              title="Edit Product"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete Action */}
            <DeleteProductDialog
              productId={product.id}
              productName={product.name}
              onDeleteSuccess={refreshData}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Search products..."
        initialVisibility={{
          description: false,
          subcategoryId: false,
          colors: false,
          size: false,
          attributes: false,
          updated_at: false,
          targetGender: false,
          stock_quantity: false,
          id: false,
        }}
      />

      {selectedProduct && (
        <ProductViewSheet
          product={selectedProduct}
          categoryName={categoryNames[selectedProduct.categoryId]}
          subcategoryName={
            selectedProduct.subcategoryId
              ? subcategoryNames[selectedProduct.subcategoryId]
              : null
          }
          isOpen={isViewOpen}
          onOpenChange={setIsViewOpen}
          initialTab={initialTab}
        />
      )}
    </>
  );
}
