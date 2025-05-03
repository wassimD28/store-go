"use client";

import { useGlobalLayout } from "@/client/store/globalLayout.store";
import BagIcon from "../../icons/bagIcon";
import LoginPagePreview from "./comp/loginPagePreview";
import PanierCardPreview from "./comp/panierCardPreview";
import ProductCardPreview from "./comp/productCardPreview";
import ProfilePagePreview from "./comp/profilePagePreview";

function GlobalLayoutPreview() {
  const { getActiveColors, radius } = useGlobalLayout();
  const activeColors = getActiveColors();

  return (
    <div
      style={{ backgroundColor: activeColors.backgroundColor }}
      className="h-full w-full flex-col"
    >
      <div className="grid h-full w-full grid-cols-[1fr_1fr_150px] grid-rows-[40%_auto_1fr] gap-4 p-3">
        <LoginPagePreview />
        <ProductCardPreview />
        <div className="col-span-3 col-start-1 row-start-2">
          <PanierCardPreview />
        </div>
        <div style={{backgroundColor:activeColors.cardColor, borderRadius: radius == 100? 15 : radius}} className="row-start-3 flex justify-center rounded-lg py-4 shadow-custom-md">
          <BagIcon
            style={{
              backgroundColor: activeColors.primaryColor,
              borderRadius: radius,
            }}
            color={activeColors.primaryForegroundColor}
            className="rounded-full p-3"
            width={50}
            height={50}
          />
        </div>
        {/* profile part  */}
        <ProfilePagePreview />
      </div>
    </div>
  );
}

export default GlobalLayoutPreview;
