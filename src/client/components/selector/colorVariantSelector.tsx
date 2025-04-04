import React from "react";
import { RadioGroup, RadioGroupItem } from "@/client/components/ui/radio-group";
import { Label } from "@/client/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorVariantProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  colors: {
    value: string;
    label: string;
    colorClass: string;
    style?: React.CSSProperties; //  style property for custom colors
  }[];
}

const ColorVariantSelector = ({
  defaultValue,
  onChange,
  colors = [
    { value: "black", label: "Black", colorClass: "bg-black" },
    { value: "gray", label: "Gray", colorClass: "bg-gray-400" },
    { value: "red", label: "Red", colorClass: "bg-red-600" },
  ],
}: ColorVariantProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm text-foreground/50">Color Variant:</h3>
      <RadioGroup
        defaultValue={defaultValue || colors[0]?.value}
        onValueChange={onChange}
        className="flex gap-2"
      >
        {colors.map((color) => (
          <div key={color.value}>
            <RadioGroupItem
              value={color.value}
              id={`color-${color.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`color-${color.value}`}
              className="flex cursor-pointer select-none items-center justify-center rounded-lg border border-gray-200 px-4 py-2 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-gray-50"
            >
              <div
                className={cn(
                  "size-4 flex-shrink-0 rounded-full",
                  color.colorClass,
                )}
                style={color.style}
              ></div>
              <span className="ml-2 text-xs">{color.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ColorVariantSelector;
