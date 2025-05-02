import Image from "next/image";

interface PanierCardPreviewProps {
  radius?: number;
  cardColor?: string;
  textColor?: string;
}

function PanierCardPreview({
  radius = 5,
  cardColor = "#ffffff",
  textColor = "#000000",
}: PanierCardPreviewProps) {
  return (
    <div
      style={{
        backgroundColor: cardColor,
        color: textColor,
        borderRadius: radius,
      }}
      className="col-span-3 col-start-1 row-start-2 flex gap-2 h-28 w-full p-3 shadow-custom-sm"
    >
      <Image
        className="aspect-square rounded-lg"
        src="/images/panier-image-example.png"
        alt="product image"
        width={100}
        height={200}
      />
      <div className="flex w-full flex-col items-start justify-center px-2">
        <h2 className="truncate text-base font-semibold">Roller Rabbit</h2>
        <p
          style={{ color: `${textColor}`, opacity: 0.5 }}
          className="text-sm font-normal"
        >
          Vado Odelle Dress
        </p>
        <div className="mt-4 flex w-full items-center justify-between">
          <h2
            style={{ color: `${textColor}` }}
            className="text-lg font-semibold"
          >
            $49.99
          </h2>
          <div className="flex h-6 items-center gap-2 rounded-full bg-gray-200 px-3 py-3 text-base text-black">
            <span>-</span>
            <span>1</span>
            <span>+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanierCardPreview;
