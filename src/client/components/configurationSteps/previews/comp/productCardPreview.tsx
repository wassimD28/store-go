"use client";

import Image from "next/image";

interface ProductCardPreviewProps {
    radius?: number;
    cardColor?: string;
    textColor?: string;
}
function ProductCardPreview({
  radius = 5,
  cardColor = "#ffffff",
  textColor = "#000000",
}: ProductCardPreviewProps) {
  const productImagePath = "/images/product-image-example.png";
  const productName = "Men's Harrington Jacket";
  const productPrice = "$49.99";
  const originalPrice = "$49.99";
  return (
    <div
    style={{ backgroundColor: cardColor , color: textColor, borderRadius: radius }}
      className="flex flex-col overflow-hidden shadow-custom-sm col-start-3 h-full"
    >
        <Image className="w-full h-48 object-cover" height={100} width={200} src={productImagePath} alt={productName}/>
        <div className="flex flex-col w-full px-3 py-2">
            <h2 className="text-base font-normal truncate">{productName}</h2>
            <span className="flex items-center gap-2">
                <p style={{color: textColor}} className="text-sm font-semibold">{productPrice}</p>
                <p style={{color: textColor, opacity: 0.5}} className="text-xs font-base line-through">{originalPrice}</p>
            </span>
        </div>
    </div>
  );
}

export default ProductCardPreview;