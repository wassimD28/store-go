import React, { useState } from "react";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import { X, Plus } from "lucide-react";

export interface ColorOption {
  value: string;
  label: string;
  colorClass: string;
  customColor?: string;
}

const DEFAULT_COLORS: ColorOption[] = [
  { value: "black", label: "Black", colorClass: "bg-black" },
  { value: "gray", label: "Gray", colorClass: "bg-gray-400" },
  {
    value: "white",
    label: "White",
    colorClass: "bg-white border border-gray-200",
  },
  { value: "red", label: "Red", colorClass: "bg-red-600" },
  { value: "blue", label: "Blue", colorClass: "bg-blue-600" },
  { value: "green", label: "Green", colorClass: "bg-green-600" },
  { value: "yellow", label: "Yellow", colorClass: "bg-yellow-400" },
  { value: "purple", label: "Purple", colorClass: "bg-purple-600" },
  { value: "pink", label: "Pink", colorClass: "bg-pink-500" },
  { value: "orange", label: "Orange", colorClass: "bg-orange-500" },
];

export interface MultiColorSelectorProps {
  value: ColorOption[];
  onChange: (colors: ColorOption[]) => void;
}

const MultiColorSelector: React.FC<MultiColorSelectorProps> = ({
  value = [],
  onChange,
}) => {
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>(value);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorValue, setCustomColorValue] = useState("#000000");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleColorToggle = (color: ColorOption) => {
    const exists = selectedColors.some((c) => c.value === color.value);

    let updatedColors: ColorOption[];
    if (exists) {
      updatedColors = selectedColors.filter((c) => c.value !== color.value);
    } else {
      updatedColors = [...selectedColors, color];
    }

    setSelectedColors(updatedColors);
    onChange(updatedColors);
  };

  const handleRemoveColor = (colorValue: string) => {
    const updatedColors = selectedColors.filter((c) => c.value !== colorValue);
    setSelectedColors(updatedColors);
    onChange(updatedColors);
  };

  const addCustomColor = () => {
    if (!customColorName.trim()) return;

    // Create a new color option
    const newColor: ColorOption = {
      value: customColorName.toLowerCase().replace(/\s+/g, "-"),
      label: customColorName.trim(),
      colorClass: "", // We'll use customColor for styling instead
      customColor: customColorValue,
    };

    // Check if color with this value already exists
    if (!selectedColors.some((c) => c.value === newColor.value)) {
      const updatedColors = [...selectedColors, newColor];
      setSelectedColors(updatedColors);
      onChange(updatedColors);

      // Reset inputs
      setCustomColorName("");
      setCustomColorValue("#000000");
    }
  };

  return (
    <div className="space-y-4">
      <Label>Product Colors</Label>

      <div className="flex flex-wrap gap-2">
        {selectedColors.map((color) => (
          <div
            key={color.value}
            className="flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1"
          >
            <div
              className={`mr-2 h-4 w-4 rounded-full ${color.colorClass}`}
              style={
                color.customColor ? { backgroundColor: color.customColor } : {}
              }
            ></div>
            <span className="text-sm">{color.label}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-5 w-5 p-0"
              onClick={() => handleRemoveColor(color.value)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex h-8 items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Select Colors</h4>

              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      selectedColors.some((c) => c.value === color.value)
                        ? "ring-2 ring-primary ring-offset-2"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleColorToggle(color)}
                  >
                    <span
                      className={`h-6 w-6 rounded-full ${color.colorClass}`}
                    ></span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Add Custom Color</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Color Name"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                    />
                  </div>
                  <Input
                    type="color"
                    className="h-8 w-12 p-1"
                    value={customColorValue}
                    onChange={(e) => setCustomColorValue(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    addCustomColor();
                    setIsPopoverOpen(false);
                  }}
                >
                  Add Custom Color
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default MultiColorSelector;
