"use client";

import { Card } from "@/client/components/ui/card";
import { BarChart } from "lucide-react";

interface UsageTabContentProps {
  usageCount: number;
}

export default function UsageTabContent({ usageCount }: UsageTabContentProps) {
  return (
    <div className="space-y-6 px-6 py-2">
      <Card className="space-y-4 p-4">
        <div className="flex items-center space-x-2">
          <BarChart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Promotion Usage</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Uses</span>
            <span className="font-bold">{usageCount}</span>
          </div>
          {/* Additional usage data could be added here in the future */}{" "}
          <div className="py-4 text-center text-sm text-muted-foreground">
            {usageCount === 0 ? (
              <p>This promotion hasn&apos;t been used yet.</p>
            ) : (
              <p>This promotion has been used {usageCount} times.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
