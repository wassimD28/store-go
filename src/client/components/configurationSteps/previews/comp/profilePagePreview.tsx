import { useGlobalLayout } from "@/client/store/globalLayout.store";
import Image from "next/image";

function ProfilePagePreview() {
   const { getActiveColors, radius } = useGlobalLayout();
  const {
    cardColor,
    foregroundColor,
    cardForegroundColor,
    mutedColor,
    mutedForegroundColor,
  } = getActiveColors();
    return (
      <div
        style={{ backgroundColor: cardColor , borderRadius: radius == 100 ? 15 : radius}}
        className="col-span-2 col-start-2 row-start-3 rounded-lg shadow-custom-md"
      >
        <div className="flex h-full w-full flex-col items-center justify-center p-3 pt-4">
          <Image
            className="mb-2 rounded-full"
            src="/images/profile-image-example.png"
            alt="profile image"
            width={70}
            height={70}
          />
          <span className="flex-center flex-col">
            <h2
              style={{ color: foregroundColor }}
              className="text-sm font-semibold"
            >
              Keira Knightley
            </h2>
            <p style={{ color: mutedForegroundColor }} className="mb-3 text-xs">
              @keirakn
            </p>
          </span>
          <div
            style={{
              backgroundColor: mutedColor,
              borderRadius: radius == 100 ? 15 : radius,
            }}
            className="flex h-full w-full flex-col gap-0.5 rounded-lg px-3 py-2"
          >
            <h2
              style={{ color: cardForegroundColor }}
              className="text-xs font-semibold"
            >
              Keira Knightley
            </h2>
            <p style={{ color: mutedForegroundColor }} className="text-xs">
              Knightley001@gmail.com
            </p>
            <p
              style={{ color: mutedForegroundColor }}
              className="text-xs text-black/30"
            >
              121-224-7890
            </p>
          </div>
        </div>
      </div>
    );
}

export default ProfilePagePreview;