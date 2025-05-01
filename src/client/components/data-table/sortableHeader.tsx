/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Column } from "@tanstack/react-table";

// Custom Sortable Header Component
export function SortableHeader({
  column,
  title,
}: {
  column: Column<any, unknown>;
  title: string;
}) {
  // Determine the current sorting state
  const sortDirection = column.getIsSorted();

  // Select the appropriate icon based on sort state
  const SortIcon = () => {
    if (sortDirection === false) {
      // Not sorted
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }

    if (sortDirection === "asc") {
      // Sorted ascending
      return (
        <ArrowUp className="ml-2 h-4 w-4 text-primary/80 hover:text-primary" />
      );
    }

    if (sortDirection === "desc") {
      // Sorted descending
      return <ArrowDown className="ml-2 h-4 w-4 text-primary/80 hover:text-primary" />;
    }

    // Fallback
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  return (
    <Button
      variant="ghost"
      className={`bg-transparent px-0 hover:bg-transparent hover:text-primary ${sortDirection ? "text-primary/80" : "text-muted-foreground"} `}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <SortIcon />
    </Button>
  );
}
