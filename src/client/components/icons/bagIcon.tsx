import React from "react";

interface BagIconProps {
  style: React.CSSProperties;
  className?: string;
  color?: string;
  width?: number | string;
  height?: number | string;
}

const BagIcon: React.FC<BagIconProps> = ({
  className = "",
  color = "white",
  width = 24,
  height = 24,
  style = {},
}) => {
  return (
    <svg
      style={style}
      className={className}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.00001 5.11324V4.46658C5.00001 2.96658 6.20667 1.49324 7.70667 1.35324C8.12346 1.31229 8.5442 1.35906 8.94181 1.49053C9.33943 1.62201 9.70512 1.83527 10.0153 2.11661C10.3256 2.39794 10.5734 2.74111 10.743 3.12402C10.9126 3.50694 11.0002 3.92112 11 4.33991V5.25991M2.54001 11.0399L2.69334 12.2866C2.84001 13.5932 3.32001 14.6666 6.00001 14.6666H10C12.68 14.6666 13.16 13.5932 13.3 12.2866L13.8 8.28658C13.98 6.65991 13.5133 5.33324 10.6667 5.33324H5.33334C2.48667 5.33324 2.02001 6.65991 2.20001 8.28658"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.33 8H10.336M5.66333 8H5.66866"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BagIcon;
