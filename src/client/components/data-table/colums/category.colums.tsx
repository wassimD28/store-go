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
