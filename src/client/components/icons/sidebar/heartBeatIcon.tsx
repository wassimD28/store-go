"use client";
import { SVGIcon } from "@/lib/types/interfaces/common.interface";

// HeartBeatIcon.tsx
export default function HeartBeatIcon({
  className,
  width,
  height,
  color,
}: SVGIcon) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H9L12 5L14 18.5L17.5 12H21.5"
        color={color}
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
