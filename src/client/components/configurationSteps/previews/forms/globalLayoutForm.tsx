/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useGlobalLayout } from "@/client/store/globalLayout.store";
import { ColorPicker } from "@/client/components/ui/color-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/client/components/ui/accordion";
import { Label } from "@/client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { Button } from "@/client/components/ui/button";
import { Paintbrush, RotateCcwIcon } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";

function GlobalLayoutForm() {
  const {
    radius,
    // Light theme
    backgroundColor,
    foregroundColor,
    cardColor,
    cardForegroundColor,
    primaryColor,
    primaryForegroundColor,
    mutedColor,
    mutedForegroundColor,
    inputColor,
    borderColor,
    // Dark theme
    darkBackgroundColor,
    darkForegroundColor,
    darkCardColor,
    darkCardForegroundColor,
    darkPrimaryColor,
    darkPrimaryForegroundColor,
    darkMutedColor,
    darkMutedForegroundColor,
    darkInputColor,
    darkBorderColor,
    // Setters
    setRadius,
    setBgColor,
    setForegroundColor,
    setCardColor,
    setCardForegroundColor,
    setPrimaryColor,
    setPrimaryForegroundColor,
    setMutedColor,
    setMutedForegroundColor,
    setInputColor,
    setInputForegroundColor,
    resetToDefaults,
  } = useGlobalLayout();

  const [activeTab, setActiveTab] = useState("light");

  // Light theme default color values
  const lightDefaultValues = {
    backgroundColor: "#FFFFFF",
    foregroundColor: "#000000",
    primaryColor: "#000000",
    primaryForegroundColor: "#FFFFFF",
    mutedColor: "#efefef",
    mutedForegroundColor: "#8e8e8e",
    cardColor: "#FFFFFF",
    cardForegroundColor: "#000000",
    inputColor: "#F4F4F4",
    borderColor: "#E5E5E5",
  };

  // Dark theme default color values
  const darkDefaultValues = {
    backgroundColor: "#1E1E1E",
    foregroundColor: "#FFFFFF",
    primaryColor: "#3B82F6",
    primaryForegroundColor: "#FFFFFF",
    mutedColor: "#2D2D2D",
    mutedForegroundColor: "#A0A0A0",
    cardColor: "#252525",
    cardForegroundColor: "#FFFFFF",
    inputColor: "#2A2A2A",
    borderColor: "#333333",
  };

  // Helper function to create color picker components with reset button

  const createColorPicker = (
    color: any,
    setColor: any,
    label: any,
    defaultColor: any,
    isDark = false,
  ) => (
    <div className="flex items-center justify-between space-x-4 py-2">
      <Label className="flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setColor(defaultColor, isDark)}
          title="Reset to default"
        >
          <RotateCcwIcon className="h-4 w-4" />
        </Button>
        <ColorPicker
          side="left"
          value={color}
          onValueChange={(value) => setColor(value.hex, isDark)}
        >
          <Button
            variant="outline"
            className="w-10 border-2 p-0"
            style={{ backgroundColor: color }}
          >
            <Paintbrush className="h-4 w-4 text-foreground opacity-50" />
            <span className="sr-only">Pick a color</span>
          </Button>
        </ColorPicker>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col pb-2">
        <div className="flex w-full items-center justify-between">
          <CardTitle>Global Layout Configuration</CardTitle>
          <span className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="h-8 w-8"
            >
              <RotateCcwIcon />
            </Button>
            <ThemeToggle />
          </span>
        </div>
        <CardDescription>
          Customize the appearance of your application
        </CardDescription>

        <div className="mt-4 flex w-full flex-col items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="light">Light Theme</TabsTrigger>
              <TabsTrigger value="dark">Dark Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="light" className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="background">
                  <AccordionTrigger>Background</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      backgroundColor,
                      setBgColor,
                      "Background Color",
                      lightDefaultValues.backgroundColor,
                      false,
                    )}
                    {createColorPicker(
                      foregroundColor,
                      setForegroundColor,
                      "Foreground Color",
                      lightDefaultValues.foregroundColor,
                      false,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="card">
                  <AccordionTrigger>Card</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      cardColor,
                      setCardColor,
                      "Card Color",
                      lightDefaultValues.cardColor,
                      false,
                    )}
                    {createColorPicker(
                      cardForegroundColor,
                      setCardForegroundColor,
                      "Card Foreground",
                      lightDefaultValues.cardForegroundColor,
                      false,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="primary">
                  <AccordionTrigger>Primary</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      primaryColor,
                      setPrimaryColor,
                      "Primary Color",
                      lightDefaultValues.primaryColor,
                      false,
                    )}
                    {createColorPicker(
                      primaryForegroundColor,
                      setPrimaryForegroundColor,
                      "Primary Foreground",
                      lightDefaultValues.primaryForegroundColor,
                      false,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="input">
                  <AccordionTrigger>Input</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      inputColor,
                      setInputColor,
                      "Input Color",
                      lightDefaultValues.inputColor,
                      false,
                    )}
                    {createColorPicker(
                      borderColor,
                      setInputForegroundColor,
                      "Placeholder Color",
                      lightDefaultValues.borderColor,
                      false,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="muted">
                  <AccordionTrigger>Muted</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      mutedColor,
                      setMutedColor,
                      "Muted Color",
                      lightDefaultValues.mutedColor,
                      false,
                    )}
                    {createColorPicker(
                      mutedForegroundColor,
                      setMutedForegroundColor,
                      "Muted Foreground",
                      lightDefaultValues.mutedForegroundColor,
                      false,
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="dark" className="mt-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="background">
                  <AccordionTrigger>Background</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      darkBackgroundColor,
                      setBgColor,
                      "Background Color",
                      darkDefaultValues.backgroundColor,
                      true,
                    )}
                    {createColorPicker(
                      darkForegroundColor,
                      setForegroundColor,
                      "Foreground Color",
                      darkDefaultValues.foregroundColor,
                      true,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="card">
                  <AccordionTrigger>Card</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      darkCardColor,
                      setCardColor,
                      "Card Color",
                      darkDefaultValues.cardColor,
                      true,
                    )}
                    {createColorPicker(
                      darkCardForegroundColor,
                      setCardForegroundColor,
                      "Card Foreground",
                      darkDefaultValues.cardForegroundColor,
                      true,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="primary">
                  <AccordionTrigger>Primary</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      darkPrimaryColor,
                      setPrimaryColor,
                      "Primary Color",
                      darkDefaultValues.primaryColor,
                      true,
                    )}
                    {createColorPicker(
                      darkPrimaryForegroundColor,
                      setPrimaryForegroundColor,
                      "Primary Foreground",
                      darkDefaultValues.primaryForegroundColor,
                      true,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="input">
                  <AccordionTrigger>Input</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      darkInputColor,
                      setInputColor,
                      "Input Color",
                      darkDefaultValues.inputColor,
                      true,
                    )}
                    {createColorPicker(
                      darkBorderColor,
                      setInputForegroundColor,
                      "Placeholder Color",
                      darkDefaultValues.borderColor,
                      true,
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="muted">
                  <AccordionTrigger>Muted</AccordionTrigger>
                  <AccordionContent>
                    {createColorPicker(
                      darkMutedColor,
                      setMutedColor,
                      "Muted Color",
                      darkDefaultValues.mutedColor,
                      true,
                    )}
                    {createColorPicker(
                      darkMutedForegroundColor,
                      setMutedForegroundColor,
                      "Muted Foreground",
                      darkDefaultValues.mutedForegroundColor,
                      true,
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="radius">Border Radius</Label>
          <Select
            value={radius.toString()}
            onValueChange={(value) =>
              setRadius(Number(value) as 0 | 5 | 10 | 15 | 100)
            }
          >
            <SelectTrigger id="radius">
              <SelectValue placeholder="Select border radius" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">None (0px)</SelectItem>
              <SelectItem value="5">Small (5px)</SelectItem>
              <SelectItem value="10">Medium (10px)</SelectItem>
              <SelectItem value="15">Large (15px)</SelectItem>
              <SelectItem value="100">Full (100%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default GlobalLayoutForm;
