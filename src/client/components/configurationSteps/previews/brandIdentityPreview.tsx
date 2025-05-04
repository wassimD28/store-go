"use client";

import { useBrandIdentityStore } from "@/client/store/brandIdentity.store";
import { useSplashScreenStore } from "@/client/store/splashScreen.store";
import { useGlobalLayout } from "@/client/store/globalLayout.store";
import Image from "next/image";
import { Tilt } from "../../ui/tilt";

function BrandIdentityPreview() {
  const { isDarkMode, getActiveColors, radius } = useGlobalLayout();
  const activeColors = getActiveColors();

  // Get app details from brand identity store
  const { appName, appSlogan, appDescription } = useBrandIdentityStore();

  // Get logo from splash screen step
  const { lightIconUrl, darkIconUrl } = useSplashScreenStore();

  // Use appropriate values based on the current theme mode
  const iconUrl = isDarkMode ? darkIconUrl : lightIconUrl;

  return (
    <Tilt isRevese rotationFactor={8} className="flex h-full w-full items-center justify-center">
      <div
        style={{
          backgroundColor: activeColors.backgroundColor,
          color: activeColors.foregroundColor,
          borderRadius: radius == 100 ? 15: radius,
        }}
        className="w-[95%] max-w-md overflow-hidden shadow-lg"
      >
        {/* App Header */}
        <div className="flex items-center gap-4 p-6">
          {/* App Icon */}
          {iconUrl ? (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl">
              <Image
                src={iconUrl}
                alt="App Icon"
                className="object-cover"
                fill
                sizes="80px"
              />
            </div>
          ) : (
            <div
              style={{
                borderRadius: radius,
              }}
              className="flex h-20 w-20 items-center justify-center bg-gray-200 dark:bg-gray-700"
            >
              <p className="text-sm text-gray-400">No icon</p>
            </div>
          )}

          {/* App Info */}
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">{appName || "App Name"}</h2>
            <p
              style={{ color: activeColors.mutedForegroundColor }}
              className="text-sm"
            >
              {appSlogan || "Your app slogan will appear here"}
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-6 pt-0">
          <h3 className="mb-2 font-medium">About</h3>
          <p
            style={{ color: activeColors.mutedForegroundColor }}
            className="text-sm"
          >
            {appDescription ||
              "Your app description will appear here. Describe what your app does, its key features, and why users should download it."}
          </p>
        </div>
      </div>
    </Tilt>
  );
}

export default BrandIdentityPreview;
