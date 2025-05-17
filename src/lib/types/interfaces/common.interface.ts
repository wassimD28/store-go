import { JSX } from "react";
export interface NavUserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface SVGIcon {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  iconColor?: string;
}

export interface SideBarData {
  name: string;
  icon: (Icon: SVGIcon) => JSX.Element;
  route: string;
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
