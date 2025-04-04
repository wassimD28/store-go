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

// Interface for products to be displayed in the table
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
}

interface ProductTableClientProps {
  products: Product[];
  categoryNames: Record<string, string>; // Maps category IDs to names
  subcategoryNames: Record<string, string>; // Maps subcategory IDs to names
}

export function ProductTableClient({
  products,
  categoryNames,
  subcategoryNames,
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
              <div className="font-medium">{product.name}</div>
              <div className="text-xs text-muted-foreground">
                Stock: {product.stock_quantity}
              </div>
            </div>
          </div>
        );
      },
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
    // Stock quantity column (hidden by default)
    {
      accessorKey: "stock_quantity",
      header: ({ column }) => <SortableHeader column={column} title="Stock" />,
      cell: ({ row }) => {
        const quantity = row.getValue("stock_quantity") as number;
        return <div>{quantity}</div>;
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
          stock_quantity: false,
          updated_at: false,
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
        />
      )}
    </>
  );
}
