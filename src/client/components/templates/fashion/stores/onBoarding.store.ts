import { ButtonElement, TextElement, SignInElement } from "@/lib/types/interfaces/storeGoElements.interface";
import { create } from "zustand";

interface OnBoardingPageStore {
  title: TextElement;
  button: ButtonElement;
  subtext?: TextElement;
  signIn?: SignInElement;
  mainImage?: string;
  leftImage?: string;
  rightImage?: string;
  updateTitle: (title: Partial<TextElement>) => void;
  updateButton: (button: Partial<ButtonElement>) => void;
  updateSubtext: (subtext: TextElement) => void;
  updateSignIn: (signIn: SignInElement) => void;
  updateMainImage: (url: string) => void;
  updateLeftImage: (url: string) => void;
  updateRightImage: (url: string) => void;
}

export const useOnBoardingPageStore = create<OnBoardingPageStore>((set) => ({
  // Initialize with default values matching the second image
  title: {
    text: "Discover Seamless Shopping!",
    textColor: "#FFFFFF", // White text color for dark background
  },
  button: {
    text: "Get Started",
    textColor: "#000000", // Black text
    backgroundColor: "#FFFFFF", // White background
    radius: "full", // Full rounded corners
  },
  subtext: {
    text: "Fast Delivery, Easy Returns, And Endless Choices Await You",
    textColor: "#9CA3AF", // Gray text color
  },
  signIn: {
    show: true,
    text: "Already have account?",
    linkText: "Sign in",
  },
  // Default images
  mainImage: "/images/default-model.jpg", 
  leftImage: "/images/default-left-model.jpg",
  rightImage: "/images/default-right-model.jpg",
  
  updateTitle: (title) =>
    set((state) => ({
      title: { ...state.title, ...title },
    })),
    
  updateButton: (button) =>
    set((state) => ({
      button: { ...state.button, ...button },
    })),
    
  updateSubtext: (subtext) =>
    set(() => ({
      subtext,
    })),
    
  updateSignIn: (signIn) =>
    set(() => ({
      signIn,
    })),
    
  updateMainImage: (url) =>
    set(() => ({
      mainImage: url,
    })),
    
  updateLeftImage: (url) =>
    set(() => ({
      leftImage: url,
    })),
    
  updateRightImage: (url) =>
    set(() => ({
      rightImage: url,
    })),
}));