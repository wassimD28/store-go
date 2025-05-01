"use client";

import Image from "next/image";
import Link from "next/link";
import { useOnBoardingPageStore } from "../stores/onBoarding.store";
import { getRadiusClass } from "@/lib/utils/generation.utils";
import { Button } from "@/client/components/ui/button";

function OnBoardingScreen() {
  // Access the store values
  const { title, button, subtext, signIn, mainImage } = useOnBoardingPageStore();

  // Function to split the title to make "Shopping!" bold
  const formatTitle = (titleText: string) => {
    if (titleText.includes("Shopping!")) {
      const parts = titleText.split("Shopping!");
      return (
        <>
          {parts[0]}
          <span className="font-bold">Shopping!</span>
          {parts[1]}
        </>
      );
    }
    return titleText;
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-black text-white">
      {/* Status bar mockup */}
      <div className="flex items-center justify-between p-2">
        <div className="text-sm font-medium">9:41</div>
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-2h2v2h-2zm0-4v-2h2v2h-2zm0-4v-2h2v2h-2z" />
          </svg>
        </div>
      </div>

      {/* Main content area with proper spacing */}
      <div className="flex flex-1 flex-col px-4">
        {/* Main image container */}
        <div className="mb-4 mt-6 w-full overflow-hidden rounded-xl">
          {mainImage ? (
            <Image 
              src={mainImage} 
              alt="Model image" 
              width={400} 
              height={300}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-56 w-full bg-black flex items-center justify-center text-white/70 font-medium">
              Model Image
            </div>
          )}
        </div>

        {/* Text section - with smaller font sizes */}
        <div className="w-full mt-4 text-center">
          {/* Title with styled formatting - smaller text size */}
          <h1
            style={{ color: title.textColor }}
            className="text-2xl font-medium mb-1"
          >
            {formatTitle(title.text)}
          </h1>

          {/* Subtext with smaller font size */}
          <p
            style={{ color: subtext?.textColor }}
            className="mb-4 text-xs font-normal opacity-75"
          >
            {subtext?.text}
          </p>
        </div>
      </div>

      {/* Bag icon background overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        
        <Image 
          className="absolute -right-8  top-10 w-20 h-20 -rotate-[20deg] opacity-30" 
          src="/icons/bag.svg" 
          width={96} 
          height={96} 
          alt="bagIcon"
        />
        
        <Image 
          className="absolute -left-10 top-1/2 w-20 h-35 rotate-[19deg] opacity-30" 
          src="/icons/bag.svg" 
          width={128} 
          height={128} 
          alt="bagIcon"
        />

         <Image 
          className="absolute -right-8  top-1/2 w-20 h-20 -rotate-[20deg] opacity-30" 
          src="/icons/bag.svg" 
          width={160} 
          height={160} 
          alt="bagIcon"
        />

        {/* Bottom left bag */}
        <Image 
          className="absolute -left-16 -bottom-10 rotate-[19deg] opacity-30" 
          src="/icons/bag.svg" 
          width={150} 
          height={150} 
          alt="bagIcon"
        />

        {/* Bottom right bag */}
        <Image 
          className="absolute -right-8 bottom-20 -rotate-[20deg] opacity-30" 
          src="/icons/bag.svg" 
          width={120} 
          height={120} 
          alt="bagIcon"
        />
      </div>

      {/* Bottom section with fixed positioning */}
      <div className="mt-auto p-4 space-y-4">
        {/* Button with styling to match image */}
        <Button
          className={`w-full py-6 ${getRadiusClass(button.radius)}`}
          style={{
            backgroundColor: button.backgroundColor,
            color: button.textColor,
          }}
        >
          {button.text}
        </Button>
        
        {/* Sign in text with proper styling */}
        {signIn?.show && (
          <div className="flex items-center justify-center space-x-1 text-sm">
            <span className="text-gray-400">{signIn.text}</span>
            <Link href="/signin" className="font-semibold text-white">
              {signIn.linkText}
            </Link>
          </div>
        )}
        
        {/* White line divider at bottom */}
        <div className="flex justify-center">
          <div className="h-1 w-12 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default OnBoardingScreen;