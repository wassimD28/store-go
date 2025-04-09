import React, { useState, useEffect } from "react";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import { Input } from "@/client/components/ui/input";
import { Plus } from "lucide-react";

interface SizeSelectorProps {
  sizes: string[];
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSizes,
  onChange,
}) => {
  const [customSize, setCustomSize] = useState("");
  const [customSizes, setCustomSizes] = useState<string[]>(
    // Initialize with any selected sizes that aren't in the standard sizes
    selectedSizes.filter((size) => !sizes.includes(size)),
  );

  // Combine standard sizes and custom sizes for display
  const allAvailableSizes = [...sizes, ...customSizes];

  // Update custom sizes when selected sizes change externally
  useEffect(() => {
    const newCustomSizes = selectedSizes.filter(
      (size) => !sizes.includes(size),
    );
    if (JSON.stringify(newCustomSizes) !== JSON.stringify(customSizes)) {
      setCustomSizes(newCustomSizes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSizes, sizes]);

  // Toggle size selection
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter((s) => s !== size));
    } else {
      onChange([...selectedSizes, size]);
    }
  };

  // Clear all selected sizes
  const clearSizes = () => {
    onChange([]);
  };

  // Add custom size
  const handleAddCustomSize = () => {
    if (
      customSize.trim() !== "" &&
      !allAvailableSizes.includes(customSize.trim())
    ) {
      const newSize = customSize.trim();

      // Add to custom sizes
      setCustomSizes([...customSizes, newSize]);

      // Select the new size
      onChange([...selectedSizes, newSize]);

      // Clear input
      setCustomSize("");
    }
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedSizes.length > 0
            ? `${selectedSizes.length} size${selectedSizes.length > 1 ? "s" : ""} selected`
            : "No sizes selected"}
        </p>
        {selectedSizes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSizes}
            className="h-7 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="h-auto max-h-40">
        <div className="flex flex-wrap gap-2">
          {/* Standard sizes */}
          {sizes.map((size) => {
            const isSelected = selectedSizes.includes(size);

            return (
              <Badge
                key={`standard-${size}`}
                className={`cursor-pointer px-3 py-1 ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => toggleSize(size)}
              >
                {size}
              </Badge>
            );
          })}

          {/* Custom sizes without delete button */}
          {customSizes.map((size) => {
            const isSelected = selectedSizes.includes(size);

            return (
              <Badge
                key={`custom-${size}`}
                className={`cursor-pointer border border-dashed px-3 py-1 ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => toggleSize(size)}
              >
                {size}
              </Badge>
            );
          })}
        </div>
      </ScrollArea>

      {/* Custom size input */}
      <div className="mt-3 flex gap-2">
        <Input
          type="text"
          placeholder="Add custom size"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustomSize();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 flex-shrink-0"
          onClick={handleAddCustomSize}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default SizeSelector;
