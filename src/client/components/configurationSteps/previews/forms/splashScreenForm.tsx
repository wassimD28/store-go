"use client";

import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Label } from "@/client/components/ui/label";
import { Button } from "@/client/components/ui/button";
import { Paintbrush, RotateCcwIcon } from "lucide-react";
import { ColorPicker } from "@/client/components/ui/color-picker";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/client/components/ui/tabs";
import { ThemeToggle } from "../comp/theme-toggle";
import ImageKitUploader from "../../../uploader/imageKitUploader";
import { useSplashScreenStore } from "@/client/store/splashScreen.store";

function SplashScreenForm() {
  const {
    lightBackgroundColor,
    darkBackgroundColor,
    lightIconUrl,
    darkIconUrl,
    setLightBackgroundColor,
    setDarkBackgroundColor,
    setLightIconUrl,
    setDarkIconUrl,
    resetToDefaults,
  } = useSplashScreenStore();

  const [activeTab, setActiveTab] = useState("light");

  // Default color values
  const lightDefaultColor = "#FFFFFF";
  const darkDefaultColor = "#1E1E1E";

  // Helper function to create color picker components with reset button
  const createColorPicker = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    color: any,
    setColor: (color: string) => void,
    label: string,
    defaultColor: string,
  ) => (
    <div className="flex items-center justify-between space-x-4 py-2">
      <Label className="flex-1">{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setColor(defaultColor)}
          title="Reset to default"
        >
          <RotateCcwIcon className="h-4 w-4" />
        </Button>
        <ColorPicker
          side="left"
          value={color}
          onValueChange={(value) => setColor(value.hex)}
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
          <CardTitle>Splash Screen Configuration</CardTitle>
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
          Customize the appearance of your app&apos;s splash screen
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
            <TabsContent value="light" className="mt-4 space-y-6">
              {createColorPicker(
                lightBackgroundColor,
                setLightBackgroundColor,
                "Background Color",
                lightDefaultColor,
              )}

              <div className="space-y-2">
                <Label>Splash Screen Icon</Label>
                <ImageKitUploader
                  onUploadSuccess={setLightIconUrl}
                  initialImage={lightIconUrl}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="dark" className="mt-4 space-y-6">
              {createColorPicker(
                darkBackgroundColor,
                setDarkBackgroundColor,
                "Background Color",
                darkDefaultColor,
              )}

              <div className="space-y-2">
                <Label>Splash Screen Icon</Label>
                <ImageKitUploader
                  onUploadSuccess={setDarkIconUrl}
                  initialImage={darkIconUrl}
                  className="mt-2"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardHeader>
    </Card>
  );
}

export default SplashScreenForm;
