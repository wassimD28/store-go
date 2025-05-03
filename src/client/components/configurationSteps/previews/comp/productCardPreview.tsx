"use client";

import { useGlobalLayout } from "@/client/store/globalLayout.store";
import Image from "next/image";

function ProductCardPreview() {
  const { getActiveColors, radius } = useGlobalLayout();
  const { cardColor, cardForegroundColor, mutedForegroundColor } =
    getActiveColors();

  const productImagePath = "/images/product-image-example.png";
  const productName = "Men's Harrington Jacket";
  const productPrice = "$49.99";
  const originalPrice = "$69.99";

  return (
    <div
      style={{
        backgroundColor: cardColor,
        color: cardForegroundColor,
        borderRadius: radius == 100 ? 15 : radius,
      }}
      className="col-start-3 flex h-full flex-col overflow-hidden shadow-custom-sm"
    >
      <Image
        className="h-48 w-full object-cover"
        height={100}
        width={200}
        src={productImagePath}
        alt={productName}
      />
      <div className="flex w-full flex-col px-3 py-2">
        <h2 className="truncate text-base font-normal">{productName}</h2>
        <span className="flex items-center gap-2">
          <p
            style={{ color: cardForegroundColor }}
            className="text-sm font-semibold"
          >
            {productPrice}
          </p>
          <p
            style={{ color: mutedForegroundColor }}
            className="font-base text-xs line-through"
          >
            {originalPrice}
          </p>
        </span>
      </div>
    </div>
  );
}

export default ProductCardPreview;
