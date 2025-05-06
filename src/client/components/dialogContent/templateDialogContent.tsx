"use client";
import { cn } from "@/lib/utils";
import { ThreeDMarquee } from "../ui/3d-marquee";
import { Badge } from "../ui/badge";
import { Dot, Laptop, Settings2, Shirt } from "lucide-react";
import ShoeIcon from "../icons/shoeIcon";
import { AButton } from "../ui/animated-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/client/providers/store.provider";

interface TemplateDialogContentProps {
  template: {
    id: string;
    name: string;
    storeType: "electronic" | "fashion" | "shoes";
    images: string[];
    status: "active" | "inactive" | "draft" | "archived";
    description: string | null;
  };
}

function getStoreTypeIcon(storeType: "electronic" | "fashion" | "shoes") {
  switch (storeType) {
    case "electronic":
      return <Laptop className="mr-2 h-4 w-4" />;
    case "fashion":
      return <Shirt className="mr-2 h-4 w-4" />;
    case "shoes":
      return <ShoeIcon className="mr-2 h-4 w-4" />;
  }
}

function TemplateDialogContent({ template }: TemplateDialogContentProps) {
  const isTemplateInactive = template.status === "inactive";
  const router = useRouter();
  const { store , isLoading} = useStoreContext();

  // Handle loading or missing store data
  if (isLoading || !store) {
    return <div className="p-4">Loading store data...</div>;
  }

  return (
    <div className="flex w-full flex-col">
      <div className="relative w-full">
        <ThreeDMarquee images={template.images} />
        <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full w-full items-end bg-gradient-to-t from-background from-0% to-transparent to-50% p-4">
          <span className="flex flex-col gap-2">
            <Badge
              className="w-fit border-white uppercase opacity-75"
              variant="outline"
            >
              {getStoreTypeIcon(template.storeType)}
              {template.storeType}
            </Badge>
            <h1 className="font-geist text-4xl font-semibold uppercase">
              {template.name}
            </h1>
          </span>
          <Badge
            className={cn(
              "absolute bottom-0 right-4 w-fit uppercase",
              template.status === "inactive" &&
                "border-red-500 bg-red-500/10 text-red-500",
              template.status === "active" &&
                "border-green-500 bg-green-500/10 text-green-500",
            )}
            variant="outline"
          >
            <Dot
              className={cn(
                "mr-2 h-4 w-4 scale-[3]",
                template.status === "inactive" && "text-red-500",
                template.status === "active" && "text-green-500",
              )}
            />
            {template.status}
          </Badge>
        </div>
      </div>
      <p className="mb-4 mr-2 mt-4 text-xl font-semibold text-foreground/90">
        Description
      </p>
      <p className="pl-4 text-sm text-foreground/50 text-neutral-500">
        {template.description}
      </p>
      <TooltipProvider>
        {isTemplateInactive ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <AButton className="mt-5 w-fit border-primary bg-primary/10 text-primary/80 hover:bg-primary/10">
                Customize
              </AButton>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="border border-orange-500 bg-orange-500/10 font-medium text-orange-500 backdrop-blur-sm"
            >
              Template must be active to customize
            </TooltipContent>
          </Tooltip>
        ) : (
          <AButton
            className="mt-5 w-fit border-primary bg-primary/10 text-primary hover:bg-primary/20 disabled:bg-primary/10 disabled:text-primary/80"
            effect="expandIcon"
            iconPlacement="right"
            disabled={false}
            icon={Settings2}
            onClick={() => {
              router.push(
                `/stores/${store.id}/templates/customize?templateId=${template.id}`,
              );
            }}
          >
            Customize
          </AButton>
        )}
      </TooltipProvider>
    </div>
  );
}

export default TemplateDialogContent;
