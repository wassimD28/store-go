import { JSX } from "react";
export interface NavUserData {
  name: string;
  email: string;
  avatar: string;
}

export interface SVGIcon {
  className: string;
  width: number;
  height: number;
  color: string;
}

export interface SideBarData {
  name: string;
  icon: (Icon: SVGIcon) => JSX.Element;
  route: string;
}