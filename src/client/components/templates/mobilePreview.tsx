"use client";

import { ReactNode } from "react";

function MobilePreview({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-[310px] 2xl:scale-150 items-center justify-center absolute">
      {/* Mobile device container with appropriate sizing */}
      <div className="m-2 w-full max-w-[300px]">
        {/* Aspect ratio container */}
        <div className="relative w-full pb-[216.6%]">
          {/* Device frame */}
          <div className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-lg ring-[6px] ring-gray-800">
            {/* This div positions the notch correctly while allowing content behind it */}
            <div className="relative h-full w-full">
              {/* Content area that will display the children - notice it starts from the very top now */}
              <div className="h-full w-full overflow-auto">
                {/* Wrapper to ensure children take up all available space */}
                <div className="flex h-full w-full flex-col">{children}</div>
              </div>

              {/* Notch positioned absolutely on top of the content */}
              <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center">
                <div className="h-4 w-1/3 rounded-b-xl bg-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobilePreview;
