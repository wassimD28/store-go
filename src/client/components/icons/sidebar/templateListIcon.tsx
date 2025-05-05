"use client"
import { SVGIcon } from "@/lib/types/interfaces/common.interface";

const TemplateListIcon = ({
  className = "",
  width = 170,
  height = 112,
  color = "black",
}: SVGIcon) => {
  return (
    <svg
      className={className}
      width={width}
      height={height+10}
      viewBox="0 0 179 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="template-list-icon">
        <rect
          id="rectangle-left"
          x="2.5"
          y="2.5"
          width="49"
          height="107"
          rx="7.5"
          stroke={color}
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <rect
          id="rectangle-middle"
          x="63.5"
          y="2.5"
          width="52"
          height="107"
          rx="7.5"
          stroke={color}
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <rect
          id="rectangle-right"
          x="127.5"
          y="2.5"
          width="49"
          height="107"
          rx="7.5"
          stroke={color}
          strokeWidth="10"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default TemplateListIcon;
