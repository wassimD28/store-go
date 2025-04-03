"use client";
import { SVGIcon } from "@/lib/types/interfaces/common.interface";

// ExternalDriveIcon.tsx
function ExternalDriveIcon({ className, width, height, color }: SVGIcon) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 22H9C6 22 4 20 4 17V7C4 4 6 2 9 2H16C19 2 21 4 21 7V17C21 20 19 22 16 22Z"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15H21"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12H8"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9.5H8"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7H8"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.4945 18.25H16.5035"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ExternalDriveIcon;
