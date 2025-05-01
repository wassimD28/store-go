"use client";
import { SVGIcon } from "@/lib/types/interfaces/common.interface";

// ShoppingCartIcon.tsx
function ShoppingCartIcon({ className, width, height, color }: SVGIcon) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 25"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2.95142H3.74001C4.82001 2.95142 5.67 3.88142 5.58 4.95142L4.75 14.9114C4.61 16.5414 5.89999 17.9414 7.53999 17.9414H18.19C19.63 17.9414 20.89 16.7614 21 15.3314L21.54 7.83142C21.66 6.17142 20.4 4.82141 18.73 4.82141H5.82001"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.25 22.9514C16.9404 22.9514 17.5 22.3918 17.5 21.7014C17.5 21.0111 16.9404 20.4514 16.25 20.4514C15.5596 20.4514 15 21.0111 15 21.7014C15 22.3918 15.5596 22.9514 16.25 22.9514Z"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 22.9514C8.94036 22.9514 9.5 22.3918 9.5 21.7014C9.5 21.0111 8.94036 20.4514 8.25 20.4514C7.55964 20.4514 7 21.0111 7 21.7014C7 22.3918 7.55964 22.9514 8.25 22.9514Z"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.95142H21"
        color={color}
        className="stroke-current"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ShoppingCartIcon;
