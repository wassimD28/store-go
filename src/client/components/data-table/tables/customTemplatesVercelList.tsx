"use client";

import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomStoreTemplates } from "@/app/actions/customStoreTemplate.actions";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/client/components/ui/card";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { Input } from "@/client/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";

import {
  PlusCircle,
  Search,
  MoreVertical,
  Clock,
  Paintbrush,
  ExternalLink,
  EllipsisVertical,
  Trash,
  Archive,
  PlayCircle,
  Pencil,
  Settings2,
} from "lucide-react";
import { formatDate, formatDistanceToNow } from "@/lib/utils";
import { AButton } from "../../ui/animated-button";
import toast from "react-hot-toast";
import { triggerAppGeneration } from "@/app/actions/generationJob.actions";

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
  };
}

interface CustomStoreTemplatesProps {
  storeId: string;
}

export function CustomTemplatesVercelList({
  storeId,
}: CustomStoreTemplatesProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<CustomStoreTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group templates by baseTemplate.name to simulate "projects"
  const groupedTemplates = filteredTemplates.reduce<
    Record<string, CustomStoreTemplate[]>
  >((acc, template) => {
    const baseTemplateName = template.baseTemplate?.name || "Unknown";
    if (!acc[baseTemplateName]) {
      acc[baseTemplateName] = [];
    }
    acc[baseTemplateName].push(template);
    return acc;
  }, {});

  // Function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-green-500 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300"
          >
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-300"
          >
            Draft
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-blue-500 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
          >
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  // Function to generate time ago string
  const timeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

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
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Enhanced empty state with better guidance and visuals
  if (templates.length === 0) {
    return (
      <div className="h-full w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Store Customizations</h1>
        </div>

        <Card className="flex h-[90%] w-full flex-col items-center justify-normal border-2 border-dashed bg-muted/5">
          <CardContent className="flex h-full w-full flex-col items-center justify-center pb-0 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-6">
              <Paintbrush className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl">No Customizations Found</CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-md text-center">
              Customize your store&apos;s appearance by creating your first
              template customization. Templates help you personalize your
              store&apos;s look and feel.
            </CardDescription>
            <Link className="mt-4" href={`/stores/${storeId}/templates/select`}>
              <AButton
                variant="outline"
                size="lg"
                effect={"expandIcon"}
                icon={Settings2}
                iconPlacement="right"
                className="w-full"
              >
                Customize Template
              </AButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with search */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Store Customizations</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {Object.entries(groupedTemplates).map(([baseTemplateName, templates]) => (
        <TemplateGroup
          key={baseTemplateName}
          baseTemplateName={baseTemplateName}
          templates={templates}
          storeId={storeId}
          router={router}
          getStatusBadge={getStatusBadge}
          timeAgo={timeAgo}
        />
      ))}
    </div>
  );
}

interface TemplateGroupProps {
  baseTemplateName: string;
  templates: CustomStoreTemplate[];
  storeId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  getStatusBadge: (status: string) => JSX.Element;
  timeAgo: (date: Date) => string;
}

function TemplateGroup({
  baseTemplateName,
  templates,
  storeId,
  router,
  timeAgo,
}: TemplateGroupProps) {
  // Take the first template to get information about the base template
  const firstTemplate = templates[0];
  const baseTemplateType = firstTemplate.baseTemplate?.storeType || "Unknown";
  // function that handle build button click
  const handleBuildButtonClick = async (
    templateId: string,
    e: React.MouseEvent,
  ) => {
    // Stop event propagation to prevent row click
    e.stopPropagation();

    try {
      // Show loading toast
      toast.loading("Building template...", {
        id: "build-template-" + templateId,
      });

      // Trigger app generation
      const result = await triggerAppGeneration(templateId);

      // Handle success/error
      if (!result.success) {
        toast.error(result.error || "Failed to build template", {
          id: "build-template-" + templateId,
        });
        return;
      }

      // Show success toast
      toast.success("Template build started successfully", {
        id: "build-template-" + templateId,
      });
    } catch (error) {
      toast.error("Error building template", {
        id: "build-template-" + templateId,
      });
      console.error("Error building template:", error);
    }
  };
  return (
    <Card className="w-full overflow-hidden border">
      {/* Project header */}
      <CardHeader className="flex flex-row items-center justify-between border-b bg-card p-4">
        <div className="flex items-center">
          <div className="mr-3 rounded bg-muted p-2">
            <Paintbrush className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg font-medium">
              {baseTemplateName}
            </CardTitle>
            <CardDescription>
              <Badge
                variant="outline"
                className="border-primary/50 bg-primary/10 text-primary"
              >
                {baseTemplateType.charAt(0).toUpperCase() +
                  baseTemplateType.slice(1)}
              </Badge>
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/stores/${storeId}/templates/select`}>
            <Button variant="ghost" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Clone Template</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Customizations table */}
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="pl-6">Customization Name</TableHead>
            <TableHead className="hidden md:table-cell">Preview</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="hidden md:table-cell">Last Updated</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow
              key={template.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() =>
                router.push(
                  `/stores/${storeId}/templates/customize/${template.id}`,
                )
              }
            >
              <TableCell className="pl-6 font-medium">
                {template.name}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-primary"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View Preview
                </Button>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {timeAgo(new Date(template.createdAt))}
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {formatDate(new Date(template.updatedAt))}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="more actions">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuildButtonClick(template.id, e);
                      }}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Build
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="mr-2 h-4 w-4" />
                      Move to Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Card footer with pagination/stats */}
      <CardFooter className="justify-between border-t bg-muted/10 px-4 py-2">
        <div className="text-sm text-muted-foreground">
          Showing {templates.length} customization
          {templates.length !== 1 && "s"}
        </div>
        <Button variant="ghost" size="sm" className="text-sm text-primary">
          View All Customizations
        </Button>
      </CardFooter>
    </Card>
  );
}
