"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomStoreTemplates } from "@/app/actions/customStoreTemplate.actions";
import { Button } from "@/client/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { DataTable } from "@/client/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { SortableHeader } from "@/client/components/data-table/sortableHeader";

// Interface for the custom store template data
interface CustomStoreTemplate {
  id: string;
  userId: string;
  storeId: string;
  name: string;
  storeTemplateId: string;
  customTemplateConfig: unknown;
  updatedAt: Date;
  createdAt: Date;
  baseTemplate: {
    id: string;
    name: string;
    storeType: string;
    description: string | null;
    status: string;
  };
}

interface CustomStoreTemplatesClientProps {
  storeId: string;
}

export function CustomStoreTemplatesClient({
  storeId,
}: CustomStoreTemplatesClientProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<CustomStoreTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const result = await getCustomStoreTemplates(storeId);
        if (result.success && result.templates) {
          setTemplates(result.templates);
        } else {
          setError(result.error || "Failed to load templates");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [storeId]);

  // Define table columns
  const columns: ColumnDef<CustomStoreTemplate>[] = [
    // Template name column
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
    },
    // Base template type
    {
      accessorKey: "baseTemplate.storeType",
      header: "Template Type",
      cell: ({ row }) => {
        const templateType = row.original.baseTemplate?.storeType;
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            {templateType?.charAt(0).toUpperCase() + templateType?.slice(1) ||
              "Unknown"}
          </Badge>
        );
      },
    },
    // Base template name
    {
      accessorKey: "baseTemplate.name",
      header: "Base Template",
      cell: ({ row }) => {
        return <div>{row.original.baseTemplate?.name || "Unknown"}</div>;
      },
    },
    // Created date column
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    // Updated date column
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <SortableHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    // Actions column
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const template = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(
                  `/stores/${storeId}/templates/customize/${template.id}`,
                );
              }}
              title="Edit Template"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <div className="text-lg text-muted-foreground">
          Loading templates...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <button
            className="mt-4 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Customizations Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You haven&apos;t created any template customizations yet. Customize
            your store appearance by selecting a template.
          </p>
          <Link href={`/stores/${storeId}/templates/select`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Customization
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <DataTable
        data={templates}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Search templates..."
        initialVisibility={{
          "baseTemplate.name": true,
          updatedAt: true,
        }}
      />
    </div>
  );
}
