"use client";
import { SVGIcon } from "@/lib/types/interfaces/common.interface";

function UserIcon({ className ="", width = 24, height = 24, color }: SVGIcon) {
  return (
    <svg
      className={className}
      fill="none"
      width={width}
      height={height}
      viewBox="0 0 14 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 9C9.48528 9 11.5 6.98528 11.5 4.5C11.5 2.01472 9.48528 0 7 0C4.51472 0 2.5 2.01472 2.5 4.5C2.5 6.98528 4.51472 9 7 9Z"
        fill={color}
        className="fill-current"
      />
      <path
        d="M7 10.499C3.27379 10.5032 0.254148 13.5228 0.25 17.249C0.25 17.6632 0.585777 17.999 0.999988 17.999H13C13.4142 17.999 13.75 17.6632 13.75 17.249C13.7458 13.5228 10.7262 10.5031 7 10.499Z"
        fill={color}
        className="fill-current"
      />
    </svg>
  );
}

export default UserIcon;
