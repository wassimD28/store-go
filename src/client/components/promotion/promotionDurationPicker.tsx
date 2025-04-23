import { useState, useEffect } from "react";
import {
  format,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from "date-fns";
import { CalendarIcon, Clock, InfoIcon } from "lucide-react";
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
import { Input } from "@/client/components/ui/input";
import { Switch } from "@/client/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { Calendar } from "@/client/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { Button } from "@/client/components/ui/button";

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

  // Function to format time string to Date object
  const setTimeForDate = (date: Date, timeString: string): Date => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours || 0);
    newDate.setMinutes(minutes || 0);
    newDate.setSeconds(seconds || 0);
    return newDate;
  };

  return (
    <Card className="shadow-custom-2xl">
      <CardHeader className="flex flex-row items-center justify-between text-xl font-semibold">
        Promotion Duration & Activation
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
      <CardContent className="space-y-6">
        {/* DateTime Picker Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Start Date and Time */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date and Time</FormLabel>
                <div className="space-y-2">
                  {/* Date Selection */}
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
                          if (!date) return;

                          // Preserve the current time when changing date
                          const currentDate = field.value || new Date();
                          const newDate = new Date(date);
                          newDate.setHours(currentDate.getHours());
                          newDate.setMinutes(currentDate.getMinutes());
                          newDate.setSeconds(currentDate.getSeconds());

                          field.onChange(newDate);

                          // If end date is before new start date, update end date
                          const currentEndDate = form.getValues("endDate");
                          if (
                            newDate &&
                            currentEndDate &&
                            newDate > currentEndDate
                          ) {
                            // Set end date to be at least same as start date
                            form.setValue("endDate", newDate);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Time Selection */}
                  <div className="relative w-full">
                    <Input
                      type="time"
                      step="1"
                      className="ps-9"
                      defaultValue="12:00:00"
                      disabled={disabled}
                      onChange={(e) => {
                        if (!field.value) return;
                        const newDateTime = setTimeForDate(
                          field.value,
                          e.target.value,
                        );
                        field.onChange(newDateTime);
                      }}
                      value={
                        field.value
                          ? `${String(field.value.getHours()).padStart(2, "0")}:${String(
                              field.value.getMinutes(),
                            ).padStart(2, "0")}:${String(
                              field.value.getSeconds(),
                            ).padStart(2, "0")}`
                          : "12:00:00"
                      }
                    />
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                      <Clock size={16} strokeWidth={2} aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date and Time */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date and Time</FormLabel>
                <div className="space-y-2">
                  {/* Date Selection */}
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
                          if (!date) return;

                          // Preserve the current time when changing date
                          const currentDate = field.value || new Date();
                          const newDate = new Date(date);
                          newDate.setHours(currentDate.getHours());
                          newDate.setMinutes(currentDate.getMinutes());
                          newDate.setSeconds(currentDate.getSeconds());

                          field.onChange(newDate);
                        }}
                        disabled={(date) =>
                          date < new Date() ||
                          date < form.getValues("startDate")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Time Selection */}
                  <div className="relative w-full">
                    <Input
                      type="time"
                      step="1"
                      className="ps-9"
                      defaultValue="12:00:00"
                      disabled={disabled}
                      onChange={(e) => {
                        if (!field.value) return;
                        const newDateTime = setTimeForDate(
                          field.value,
                          e.target.value,
                        );
                        field.onChange(newDateTime);
                      }}
                      value={
                        field.value
                          ? `${String(field.value.getHours()).padStart(2, "0")}:${String(
                              field.value.getMinutes(),
                            ).padStart(2, "0")}:${String(
                              field.value.getSeconds(),
                            ).padStart(2, "0")}`
                          : "12:00:00"
                      }
                    />
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                      <Clock size={16} strokeWidth={2} aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Activation Toggle Section */}
        <div className="border-t pt-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">
                  Activate promotion immediately
                </FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="ml-1 h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        If toggled off, promotion will be created but won&apos;t be
                        applied until you manually activate it later
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
