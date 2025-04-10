"use client";

import { AppCategory } from "@/lib/types/interfaces/schema.interface";
import { DataTable } from "@/client/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/client/components/ui/checkbox";
import { Button } from "@/client/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SortableHeader } from "@/client/components/data-table/sortableHeader";
import { DeleteCategoryDialog } from "@/client/components/dialogs/deleteCategoryDialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Update interface to include image_url
interface CategoryTableClientProps {
  categories: AppCategory[];
}

export function CategoryTableClient({ categories }: CategoryTableClientProps) {
  const router = useRouter();

  const refreshData = () => {
    router.refresh();
  };

  // Define columns inside the component
  const columns: ColumnDef<AppCategory>[] = [
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
      maxSize: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const category = row.original;
        // Use image_url if available, otherwise use a placeholder
        const imageUrl = category.imageUrl || "/images/placeholder-category.png";

        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={imageUrl}
                alt={category.name}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-medium capitalize">
                {category.name}
              </div>
            </div>
          </div>
        );
      },
      minSize: 100,
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
        const category = row.original;

        return (
          <div className="flex space-x-2">
            {/* View Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Implement view logic
                console.log("View category:", category.id);
              }}
              title="View Category"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Implement edit logic
                console.log("Edit category:", category.id);
              }}
              title="Edit Category"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete Action */}
            <DeleteCategoryDialog
              categoryId={category.id}
              categoryName={category.name}
              onDeleteSuccess={refreshData}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={categories}
      columns={columns}
      filterColumn="name"
      filterPlaceholder="Search categories..."
    />
  );
}
