"use client";

import { useEffect } from "react";
import { useOnBoardingPageStore } from "../stores/onBoarding.store";

function OnBoardingScreen() {
  // Access the store values
  const { title, button } = useOnBoardingPageStore();

  // This function dynamically generates the appropriate border-radius class
  const getRadiusClass = (radius: string) => {
    switch (radius) {
      case "none":
        return "";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "";
    }
  };

  // Effect to log store changes (helpful for debugging)
  useEffect(() => {
    console.log("Store updated:", { title, button });
  }, [title, button]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black p-5 text-white">
      {/* Display the title from the store */}
      <h1
        style={{ color: title.textColor }}
        className="mb-8 text-3xl font-bold"
      >
        {title.text}
      </h1>

      {/* Display the button from the store with its styling */}
      <button
        className={`px-6 py-3 transition-all duration-300 ${getRadiusClass(button.radius)}`}
        style={{
          backgroundColor: button.backgroundColor,
          color: button.textColor,
        }}
      >
        {button.text}
      </button>

      {/* Display current store values for debugging (you can remove this in production) */}
      <div className="mt-10 rounded-md bg-gray-900 p-4">
        <h3 className="mb-3 text-lg font-medium">Current Store Values:</h3>
        <pre className="overflow-auto text-xs">
          {JSON.stringify({ title, button }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default OnBoardingScreen;
