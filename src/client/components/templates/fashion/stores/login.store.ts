import { create } from "zustand";
import { InputElement, TextElement, ButtonElement } from "@/lib/types/interfaces/storeGoElements.interface";

// Update InputElement interface to include email and password placeholders
interface ExtendedInputElement extends Omit<InputElement, 'placeholderText'> {
  emailPlaceholder: string;
  passwordPlaceholder: string;
  placeholderTextColor: string;
}

interface LoginPageStore {
  header: TextElement;
  inputField: ExtendedInputElement;
  button: ButtonElement;
  forgotPassword: {
    show: boolean;
    text: string;
  };
  createAccount: {
    show: boolean;
    text: string;
  };
  updateHeader: (header: Partial<TextElement>) => void;
  updateInputField: (input: Partial<ExtendedInputElement>) => void;
  updateButton: (button: Partial<ButtonElement>) => void;
  updateForgotPassword: (forgotPassword: {show: boolean, text: string}) => void;
  updateCreateAccount: (createAccount: {show: boolean, text: string}) => void;
}

export const useLoginPageStore = create<LoginPageStore>((set) => ({
  // Initialize with values that match the image with fully rounded inputs
  header: {
    text: "log in",
    textColor: "#000000", // Black text for header
  },
  inputField: {
    textColor: "#000000",
    backgroundColor: "#F2F2F2", // Light gray input background
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    placeholderTextColor: "#9CA3AF", // Gray placeholder
    radius: "full", // Completely rounded corners
  },
  button: {
    text: "Continue",
    textColor: "#FFFFFF", // White text
    backgroundColor: "#000000", // Black background
    radius: "full", // Full rounded corners
  },
  forgotPassword: {
    show: true,
    text: "Forgot Password?",
  },
  createAccount: {
    show: true,
    text: "Don't have an Account? Create One",
  },
  
  updateHeader: (header) =>
    set((state) => ({
      header: { ...state.header, ...header },
    })),

  updateInputField: (input) =>
    set((state) => ({
      inputField: { ...state.inputField, ...input },
    })),
    
  updateButton: (button) =>
    set((state) => ({
      button: { ...state.button, ...button },
    })),
    
  updateForgotPassword: (forgotPassword) =>
    set(() => ({
      forgotPassword,
    })),
    
  updateCreateAccount: (createAccount) =>
    set(() => ({
      createAccount,
    })),
}));