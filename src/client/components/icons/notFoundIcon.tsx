"use client";
import { SVGIcon } from "@/lib/types/interfaces/common.interface";

function NotFoundIcon({
  className = "",
  width = 24,
  height = 24,
  color,
}: SVGIcon) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Exclamation mark vertical line */}
      <path
        d="M12 8L12 12"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Exclamation mark dot */}
      <path
        d="M12 16.01L12.01 15.9989"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Top-left corner */}
      <path
        d="M9 3H4V6"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Left middle segment */}
      <path
        d="M4 11V13"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Right middle segment */}
      <path
        d="M20 11V13"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Top-right corner */}
      <path
        d="M15 3H20V6"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Bottom-left corner */}
      <path
        d="M9 21H4V18"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />

      {/* Bottom-right corner */}
      <path
        d="M15 21H20V18"
        stroke={color || "#000000"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

export default NotFoundIcon;
