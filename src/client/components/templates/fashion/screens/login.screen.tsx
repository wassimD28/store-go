"use client";

import { useLoginPageStore } from "../stores/login.store";
import { Button } from "@/client/components/ui/button";
import Link from "next/link";

function LoginScreen() {
  // Access the store values
  const { header, inputField, button, forgotPassword, createAccount } = useLoginPageStore();

  // Helper function to get border radius class based on radius value
  const getBorderRadiusClass = (radius: string) => {
    switch (radius) {
      case 'none': return '';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      default: return 'rounded-full';
    }
  };

  const inputRadiusClass = getBorderRadiusClass(inputField.radius);
  const buttonRadiusClass = getBorderRadiusClass(button.radius);

  return (
    <div className="relative flex h-full w-full flex-col bg-white px-4 py-16">
      {/* Header */}
      <h1 
        style={{ color: header.textColor }}
        className="text-2xl font-medium mb-6"
      >
        {header.text}
      </h1>

      {/* Input fields */}
      <div className="space-y-3 mb-4">
        <div 
          className={`w-full overflow-hidden ${inputRadiusClass}`}
          style={{ backgroundColor: inputField.backgroundColor }}
        >
          <input
            type="email"
            placeholder={inputField.emailPlaceholder}
            style={{ 
              color: inputField.textColor,
              backgroundColor: inputField.backgroundColor
            }}
            className="w-full px-5 py-3 outline-none text-sm"
          />
        </div>
        
        <div 
          className={`w-full overflow-hidden ${inputRadiusClass}`}
          style={{ backgroundColor: inputField.backgroundColor }}
        >
          <input
            type="password"
            placeholder={inputField.passwordPlaceholder}
            style={{ 
              color: inputField.textColor,
              backgroundColor: inputField.backgroundColor
            }}
            className="w-full px-5 py-3 outline-none text-sm"
          />
        </div>
      </div>
      
      {/* Forgot password text */}
      {forgotPassword.show && (
        <div className="flex justify-end mb-4">
          <Link href="/forgot-password" className="text-xs text-gray-500">
            {forgotPassword.text}
          </Link>
        </div>
      )}

      {/* Login button */}
      <Button
        className={`w-full py-6 ${buttonRadiusClass}`}
        style={{
          backgroundColor: button.backgroundColor,
          color: button.textColor,
        }}
      >
        {button.text}
      </Button>

      {/* Don't have an account */}
      {createAccount.show && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {createAccount.text.includes("Create One") ? (
              <>
                {createAccount.text.split("Create One")[0]}
                <Link href="/signup" className="font-medium">Create One</Link>
              </>
            ) : (
              <>{createAccount.text} <Link href="/signup" className="font-medium">Sign up</Link></>
            )}
          </p>
        </div>
      )}
      
      {/* Bottom spacer */}
      <div className="flex-1"></div>
      
      {/* Home indicator */}
      <div className="flex justify-center pb-2">
        <div className="h-1 w-12 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}

export default LoginScreen;