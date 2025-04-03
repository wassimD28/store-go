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

// Interface for products to be displayed in the table
interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: string;
  stock_quantity: number;
  categoryId: string;
  subcategoryId: string | null;
  image_urls: string | null;
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

  const refreshData = () => {
    router.refresh();
  };

  // Define columns for the product table
  const columns: ColumnDef<Product>[] = [
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
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <SortableHeader column={column} title="Price" />,
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return <div>${price.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "stock_quantity",
      header: ({ column }) => <SortableHeader column={column} title="Stock" />,
      cell: ({ row }) => {
        const quantity = row.getValue("stock_quantity") as number;
        return <div>{quantity}</div>;
      },
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as string;
        return <div>{categoryNames[categoryId] || "Unknown"}</div>;
      },
    },
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
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <SortableHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex space-x-2">
            {/* View Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(
                  `/stores/${product.storeId}/products/${product.id}`,
                );
              }}
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
    <DataTable
      data={products}
      columns={columns}
      filterColumn="name"
      filterPlaceholder="Search products..."
    />
  );
}
