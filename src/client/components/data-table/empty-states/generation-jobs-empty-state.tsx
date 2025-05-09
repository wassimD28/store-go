import { PlusCircle, Settings } from "lucide-react";
import { Button } from "@/client/components/ui/button";

export function GenerationJobsEmptyState() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Settings className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No generation jobs</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        You haven&apos;t created any app generation jobs yet. Start by
        generating a new app from one of your templates.
      </p>
      <Button className="mt-6">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Generation
      </Button>
    </div>
  );
}
