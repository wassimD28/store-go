import { useState, useEffect } from "react";
import {
  format,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from "date-fns";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

import { Card, CardHeader, CardContent } from "@/client/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/client/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { Calendar } from "@/client/components/ui/calendar";
import { Button } from "@/client/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";

interface PromotionDurationPickerProps {
  disabled?: boolean;
}

export default function PromotionDurationPicker({
  disabled = false,
}: PromotionDurationPickerProps) {
  const form = useFormContext();
  const [durationInfo, setDurationInfo] = useState<string>("");

  // Get current values from form
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  // Calculate duration whenever dates change
  useEffect(() => {
    if (!startDate || !endDate) return;

    const days = differenceInDays(endDate, startDate);

    if (days < 0) {
      setDurationInfo("Error: End date is before start date");
      return;
    }

    if (days === 0) {
      setDurationInfo("Same-day promotion");
      return;
    }

    let durationText = "";

    // Format duration in the most readable way
    const months = differenceInMonths(endDate, startDate);
    const weeks = differenceInWeeks(endDate, startDate);

    if (months > 0) {
      durationText = `${months} month${months > 1 ? "s" : ""}`;
      const remainingDays = days - months * 30;
      if (remainingDays > 0) {
        durationText += ` and ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
      }
    } else if (weeks > 0) {
      durationText = `${weeks} week${weeks > 1 ? "s" : ""}`;
      const remainingDays = days - weeks * 7;
      if (remainingDays > 0) {
        durationText += ` and ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
      }
    } else {
      durationText = `${days} day${days > 1 ? "s" : ""}`;
    }

    setDurationInfo(`Duration: ${durationText}`);
  }, [startDate, endDate]);

  return (
    <Card className="shadow-custom-2xl">
      <CardHeader className="flex flex-row items-center justify-between text-xl font-semibold">
        Promotion Duration
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm font-normal text-muted-foreground">
                <InfoIcon className="mr-1 h-4 w-4" />
                {durationInfo}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is how long your promotion will be active</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={disabled}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);

                      // If end date is before new start date, update end date
                      const currentEndDate = form.getValues("endDate");
                      if (date && currentEndDate && date > currentEndDate) {
                        // Set end date to be at least same as start date
                        form.setValue("endDate", date);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={disabled}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < form.getValues("startDate")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
