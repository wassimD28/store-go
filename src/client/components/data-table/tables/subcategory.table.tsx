"use client";

import { AppSubCategory } from "@/lib/types/interfaces/schema.interface";
import { DataTable } from "@/client/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/client/components/ui/checkbox";
import { Button } from "@/client/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SortableHeader } from "@/client/components/data-table/sortableHeader";
import { useRouter } from "next/navigation";
import { DeleteSubCategoryDialog } from "../../dialogs/deleteSubcategoryDialog";
import Image from "next/image";

interface SubCategoryTableClientProps {
  subcategories: AppSubCategory[];
  parentCategories: Record<string, string>; // Maps category IDs to names
}

export function SubCategoryTableClient({
  subcategories,
  parentCategories,
}: SubCategoryTableClientProps) {
  const router = useRouter();

  const refreshData = () => {
    router.refresh();
  };

  // Define columns inside the component
  const columns: ColumnDef<AppSubCategory>[] = [
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
      maxSize: 50,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Subcategory" />
      ),
      cell: ({ row }) => {
        const subcategory = row.original;
        // Use image_url if available, otherwise use a placeholder
        const imageUrl = subcategory.imageUrl || "/images/placeholder-category.png";

        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={imageUrl}
                alt={subcategory.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-medium capitalize">
                {subcategory.name}
              </div>
            </div>
          </div>
        );
      },
      minSize: 250,
    },
    {
      accessorKey: "parentCategoryId",
      header: "Parent Category",
      cell: ({ row }) => {
        const parentId = row.getValue("parentCategoryId") as string;
        return <div>{parentCategories[parentId] || "Unknown"}</div>;
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
      accessorKey: "updated_at",
      header: ({ column }) => (
        <SortableHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subcategory = row.original;

        return (
          <div className="flex space-x-2">
            {/* View Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log("View subcategory:", subcategory.id);
              }}
              title="View Subcategory"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log("Edit subcategory:", subcategory.id);
              }}
              title="Edit Subcategory"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete Action */}
            <DeleteSubCategoryDialog
              subcategoryId={subcategory.id}
              subcategoryName={subcategory.name}
              onDeleteSuccess={refreshData}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={subcategories}
      columns={columns}
      filterColumn="name"
      filterPlaceholder="Search subcategories..."
    />
  );
}
