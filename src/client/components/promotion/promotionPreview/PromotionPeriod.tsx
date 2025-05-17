import { Badge } from "@/client/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { CalendarIcon, Clock } from "lucide-react";

interface PromotionPeriodProps {
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  durationDisplay: string;
  detailedDuration: string;
}

export default function PromotionPeriod({
  startDate,
  endDate,
  isActive,
  durationDisplay,
  detailedDuration,
}: PromotionPeriodProps) {
  // Format dates and times for display
  const formatDate = (date: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (date: Date) => {
    if (!date) return "";
    return `${formatDate(date)} at ${formatTime(date)}`;
  };

  return (
    <div className="space-y-2 rounded-md bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Promotion Period</div>
        <div className="flex items-center gap-2">
          {startDate && endDate && durationDisplay && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm truncate cursor-pointer font-medium text-primary">
                    <Clock className="mr-1 h-3 w-3" />
                    Duration: {durationDisplay}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div className="font-medium">Detailed breakdown:</div>
                    <div>{detailedDuration}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="font-medium">Start: </span>
            <span>{formatDateTime(startDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="font-medium">End: </span>
            <span>{formatDateTime(endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
