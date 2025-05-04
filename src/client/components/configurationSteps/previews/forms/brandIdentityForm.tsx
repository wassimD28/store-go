"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Label } from "@/client/components/ui/label";
import { Button } from "@/client/components/ui/button";
import { RotateCcwIcon } from "lucide-react";
import { Input } from "@/client/components/ui/input";
import { ThemeToggle } from "../comp/theme-toggle";
import { useBrandIdentityStore } from "@/client/store/brandIdentity.store";
import { Textarea } from "@/client/components/ui/textarea";

function BrandIdentityForm() {
  const {
    appName,
    appSlogan,
    appDescription,
    setAppName,
    setAppSlogan,
    setAppDescription,
    resetToDefaults,
  } = useBrandIdentityStore();

  return (
    <Card className="max-h-full w-full overflow-auto">
      <CardHeader className="flex flex-col pb-2">
        <div className="flex w-full items-center justify-between">
          <CardTitle>Brand Identity</CardTitle>
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
          Configure your app&apos;s branding and identity
        </CardDescription>

        <CardContent className="space-y-4 px-0 pt-4">
          <div className="space-y-2">
            <Label htmlFor="appName">App Name</Label>
            <Input
              id="appName"
              placeholder="Enter your app name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appSlogan">App Slogan/Tagline</Label>
            <Textarea
              id="appSlogan"
              placeholder="Enter a short slogan or tagline for your app"
              value={appSlogan}
              onChange={(e) => setAppSlogan(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appDescription">App Description</Label>
            <Textarea
              id="appDescription"
              placeholder="Enter a detailed description of your app"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
}

export default BrandIdentityForm;
