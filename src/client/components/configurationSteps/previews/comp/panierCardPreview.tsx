import { useGlobalLayout } from "@/client/store/globalLayout.store";
import Image from "next/image";

function PanierCardPreview() {
  const { getActiveColors, radius } = useGlobalLayout();
  const { cardColor, cardForegroundColor, mutedForegroundColor, mutedColor } =
    getActiveColors();

  return (
    <div
      style={{
        backgroundColor: cardColor,
        color: cardForegroundColor,
        borderRadius: radius == 100 ? 15 : radius,
      }}
      className="col-span-3 col-start-1 row-start-2 flex h-28 w-full gap-2 p-3 shadow-custom-sm"
    >
      <Image
        style={{ borderRadius: radius == 100 ? 15 : radius }}
        className="aspect-square"
        src="/images/panier-image-example.png"
        alt="product image"
        width={100}
        height={200}
      />
      <div className="flex w-full flex-col items-start justify-center px-2">
        <h2 className="truncate text-base font-semibold">Roller Rabbit</h2>
        <p
          style={{ color: mutedForegroundColor }}
          className="text-sm font-normal"
        >
          Vado Odelle Dress
        </p>
        <div className="mt-4 flex w-full items-center justify-between">
          <h2
            style={{ color: cardForegroundColor }}
            className="text-lg font-semibold"
          >
            $49.99
          </h2>
          <div
            style={{ backgroundColor: mutedColor, color: mutedForegroundColor }}
            className="flex h-6 items-center gap-2 rounded-full px-3 py-3 text-base"
          >
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
