"use client";

import { useSplashScreenStore } from "@/client/store/splashScreen.store";
import { useGlobalLayout } from "@/client/store/globalLayout.store";
import Image from "next/image";
import MobilePreview from "../../templates/mobilePreview";

function SplashScreenPreview() {
  const { isDarkMode } = useGlobalLayout();
  const {
    lightBackgroundColor,
    darkBackgroundColor,
    lightIconUrl,
    darkIconUrl,
  } = useSplashScreenStore();

  // Use appropriate values based on the current theme mode
  const backgroundColor = isDarkMode
    ? darkBackgroundColor
    : lightBackgroundColor;
  const iconUrl = isDarkMode ? darkIconUrl : lightIconUrl;

  return (
   <div className="h-full flex-center scale-95">
     <MobilePreview>
       <div
         style={{ backgroundColor }}
         className="flex h-full w-full items-center justify-center"
       >
         <div className="flex flex-col items-center justify-center">
           {iconUrl ? (
             <div className="relative h-32 w-32 rounded-full">
               <Image
                 src={iconUrl}
                 alt="App Logo"
                 className="rounded-full object-contain"
                 fill
                 sizes="128px"
               />
             </div>
           ) : (
             <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200">
               <p className="text-sm text-gray-400">No logo selected</p>
             </div>
           )}
         </div>
       </div>
     </MobilePreview>
   </div>
  );
}

export default SplashScreenPreview;
