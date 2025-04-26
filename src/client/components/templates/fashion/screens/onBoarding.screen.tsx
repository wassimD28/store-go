"use client";

import Image from "next/image";
import { useOnBoardingPageStore } from "../stores/onBoarding.store";
import { getRadiusClass } from "@/lib/utils/generation.utils";
import { Button } from "@/client/components/ui/button";

function OnBoardingScreen() {
  // Access the store values
  const { title, button } = useOnBoardingPageStore();


  return (
    <div className="relative h-full w-full overflow-hidden bg-black p-5 text-white flex flex-center flex-col">
      {/* Display the title from the store */}
      <Image className="absolute -left-16 -bottom-10 rotate-[19deg] opacity-30" src="/icons/bag.svg" width={150} height={150} alt="bagIcon"/>
      <Image className="absolute -right-8 bottom-20 -rotate-[20deg] opacity-30" src="/icons/bag.svg" width={80} height={80} alt="bagIcon"/>
      <h1
        style={{ color: title.textColor }}
        className="mb-8 text-3xl font-bold text-center"
      >
        {title.text}
      </h1>
      {/* Display the button from the store with its styling */}
      <Button
        className={`px-20 py-3 transition-all duration-300 ${getRadiusClass(button.radius)}`}
        style={{
          backgroundColor: button.backgroundColor,
          color: button.textColor,
        }}
      >
        {button.text}
      </Button>

     
    </div>
  );
}

export default OnBoardingScreen;
