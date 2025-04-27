export type Radius = "none" | "sm" | "md" | "lg" | "full";

export interface TextElement {
  text: string;
  textColor: string; 
}

export interface ButtonElement {
  text: string;
  textColor: string;
  backgroundColor: string;
  radius: Radius;
}

export interface InputElement {
  emailPlaceholder: string | undefined;
  passwordPlaceholder: string | undefined;
  textColor: string;
  backgroundColor: string;
  placeholderText: string;
  placeholderTextColor: string
  radius: Radius;
}

export interface SignInElement {
  show: boolean;
  text: string;
  linkText: string;
}