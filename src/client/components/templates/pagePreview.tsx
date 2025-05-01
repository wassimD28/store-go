
"use client";
import { usePageSelectionStore } from "./fashion/stores/page-selection.store";
import { ReactNode, useCallback } from "react";

interface PagePreviewProps {
  children?: ReactNode;
  pageType: "onboarding" | "login" | "home";
}

function PagePreview({ children, pageType }: PagePreviewProps) {
  const { currentPage, setCurrentPage } = usePageSelectionStore();

  const handleClick = useCallback(() => {
    setCurrentPage(pageType);
    console.log(`Selected page: ${pageType}`);
  }, [pageType, setCurrentPage]);

  // Add active state styling
  const isActive = currentPage === pageType;

  return (
    <div
      className={`relative w-full cursor-pointer overflow-hidden rounded-md pb-[216.6%] transition-all duration-200 ${
        isActive
          ? "shadow-lg ring-2 ring-blue-500"
          : "hover:ring-1 hover:ring-blue-300"
      }`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 overflow-hidden rounded-md">
        <div className="absolute h-full w-full transform overflow-hidden">
          <div className="flex w-[310px] origin-top-left -translate-x-1 scale-[0.34] items-center justify-center">
            {/* Mobile device container with appropriate sizing */}
            <div className="w-full max-w-[300px]">
              {/* Aspect ratio container */}
              <div className="relative w-full pb-[216.6%]">
                {/* Device frame */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* This div positions the notch correctly while allowing content behind it */}
                  <div className="relative h-full w-full">
                    {/* Content area that will display the children - notice it starts from the very top now */}
                    <div className="h-full w-full overflow-auto">
                      {/* Wrapper to ensure children take up all available space */}
                      <div className="flex h-full w-full flex-col">
                        {children}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Label to show page name */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-2 py-1 text-center text-xs text-white">
        {pageType.charAt(0).toUpperCase() + pageType.slice(1)}
      </div>
    </div>
  );
}

export default PagePreview;
