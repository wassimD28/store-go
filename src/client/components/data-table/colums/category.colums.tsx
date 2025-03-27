"use client"
import { AppCategory } from "@/lib/types/interfaces/schema.interface";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SortableHeader } from "../sortableHeader";

export const appCategoryColumns: ColumnDef<AppCategory>[] = [
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
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
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
    header: ({ column }) => <SortableHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <SortableHeader column={column} title="Updated At" />,
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // Implement delete logic
              console.log("Delete category:", category.id);
            }}
            title="Delete Category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
