"use client";
import { useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

export function PublishedFilter() {
  // Create a ref to access the SelectTrigger
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-36">
      <Select defaultValue="published">
        {/* Add ref to the original trigger */}
        <SelectTrigger ref={triggerRef} className="w-full h-10 opacity-0 pointer-events-none">
          <SelectValue />
        </SelectTrigger>
      
        {/* Custom button as the visual trigger */}
        <Button
          size="lg"
          className="w-full border-primary bg-sidebar text-primary absolute top-0 hover:text-primary hover:bg-primary/10  transition-all duration-200 ease-in-out justify-start "
          variant="outline"
          // Use aria-label to improve accessibility
          aria-label="Select publication status"
          // Programmatically trigger the select when the button is clicked
          onClick={() => {
            // Find and click the hidden trigger to open the dropdown
            triggerRef.current?.click();
          }}
        >
          {/* Manually display the selected value */}
          <SelectValue />
          <ChevronDown className="absolute right-4"/>
        </Button>
      
        {/* Add positioning props to ensure dropdown aligns with button */}
        <SelectContent position="popper" align="start" className="w-full">
          <SelectGroup>
            <SelectItem className="py-3" value="published">
              Published
            </SelectItem>
            <SelectItem className="py-3" value="private">
              Private
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
