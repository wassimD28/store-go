"use client";
import IKimageUploader from "@/client/components/IKimageUploader";
import MobileLivePreview from "@/client/components/live-preview/mobile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/client/components/ui/breadcrumb";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Separator } from "@/client/components/ui/separator";
import { SidebarTrigger } from "@/client/components/ui/sidebar";
import axios from "axios";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Clock from "react-live-clock";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const [storeName, setStoreName] = useState("storeGo");
  const [logoUrl, setLogoUrl] = useState("/icons/storeGo logo.svg");
  const [isGenerating, setIsGenerating] = useState(false);
  const { data } = authClient.useSession()
  const handleGenerateBtn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast.error("Please enter a name for your store");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await axios.post("/api/generate-app", {
        storeName,
        logoUrl,
        userId: data?.user.id,
      });

      console.log("Generation started:", response.data);

      toast.loading("App generation started");

      // In a real app, you might poll for status or use WebSockets
      // to update the user on the generation progress
    } catch (error) {
      console.error("Generation failed:", error);

      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-svh w-svw overflow-hidden">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Project</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>New Project</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="grid grid-cols-[auto_auto_1fr] gap-4 p-6 h-full">
        {/* step indicator  */}
        <div className="relative flex items-center flex-col w-8 h-full mt-1">
          <span className="font-bold z-50 text-xl text-background bg-primary rounded-full flex items-center justify-center w-full aspect-square">
            1
          </span>
          <div className="w-1 h-[calc(100%+16px)] bg-primary absolute top-4" />
        </div>
        {/* step content  */}
        <div className="ml-2 w-96 relative">
          <h1 className="text-3xl font-bold">Store Identity</h1>
          {/* step inputs */}
          <div className="w-full pl-10 pt-10 flex flex-col gap-6">
            <span className="flex flex-col gap-2">
              <Label className="text-xl">Store Name</Label>
              <Input
                onChange={(e) => setStoreName(e.target.value)}
                value={storeName}
                className="bg-primary-foreground"
                placeholder="Enter your store name"
              />
              <p className="text-sm font-light text-muted-foreground">
                Use a short, memorable name (up to 20 characters) to ensure it
                displays properly.
              </p>
            </span>
            <span className="flex flex-col gap-2">
              <Label className="text-xl">Logo</Label>
              <IKimageUploader onUploadSuccess={setLogoUrl} />
              <p className="text-sm font-light text-muted-foreground">
                Upload a square image (512 × 512px) in PNG or SVG format for
                best results.
              </p>
            </span>
          </div>
          <Button
            onClick={handleGenerateBtn}
            className="absolute bottom-0 right-0"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate"} <Sparkles />
          </Button>
        </div>
        {/* live preview */}
        <div className="relative flex items-center justify-center">
          <div className="h-[90%] aspect-square rounded-full bg-primary absolute ease-in-out duration-500 transition-all" />
          <MobileLivePreview className="z-50 absolute h-[130%] ease-in-out duration-500 transition-all translate-y-32">
            {/* status bar  */}
            <div className="flex items-center justify-between w-full px-4 absolute py-2">
              <Clock format={"HH:mm"} ticking={true} />
              <span className="flex gap-2 items-center">
                <Image
                  src={"/icons/fa-solid_wifi.svg"}
                  width={23}
                  height={23}
                  alt="wifi icon"
                />
                <Image
                  src={"/icons/bi_battery-half.svg"}
                  width={30}
                  height={30}
                  alt="battery icon"
                />
              </span>
            </div>
            {/* app preview  */}
            <div className="absolute top-32 flex flex-col justify-center items-center gap-2">
              <div className="bg-white rounded-2xl w-20 aspect-square flex items-center justify-center">
                {/* app logo preview */}
                <Image
                  src={logoUrl}
                  width={55}
                  height={55}
                  alt="app logo"
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl">{storeName}</h1>
            </div>
            {/* background  */}
            <Image
              src={"/gradient bg.jpg"}
              width={736}
              height={1472}
              alt="bg"
            />
          </MobileLivePreview>
        </div>
      </div>
    </div>
  );
}
