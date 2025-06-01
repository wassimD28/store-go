"use client";
import { SignInForm } from "@/client/components/forms/auth/signin-form";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import { authClient } from "@/lib/auth-client";
import GoogleIcon from "@/client/components/icons/googleIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GridMotion } from "@/client/components/grid/grid-motion";
import { getStoreTemplates } from "@/app/actions/storeTemplate.actions";

export default function SignInPage() {
  const { data: session } = authClient.useSession();
  const [templateImages, setTemplateImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const result = await getStoreTemplates();
      if (result.success && result.templates) {
        // Extract all images from all templates and flatten the array
        const allImages: string[] = [];
        result.templates.forEach((template) => {
          if (template.images && Array.isArray(template.images)) {
            allImages.push(...template.images);
          }
        });
        setTemplateImages(allImages);
      }
    };
    fetchTemplates();
  }, [session]);
  const onSignUp = async () =>
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  return (
    <div className="relative h-svh w-full">
      {/* Background Grid Motion - Full Screen */}
      <div className="absolute inset-0 -left-44">
        <GridMotion items={templateImages} />
      </div>{" "}
      {/* Gradient Overlay - Right to Left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, hsl(var(--background)) 0%, hsl(var(--background) / 0.95) 25%, hsl(var(--background) / 0.8) 40%, hsl(var(--background) / 0.4) 55%, transparent 70%)",
        }}
      />
      {/* Sign In Form - Positioned on the Right */}
      <div className="relative z-10 flex h-full w-full items-center justify-end">
        <div className="flex w-full max-w-md items-center justify-center p-8 lg:mr-16">
          <Card className="w-full max-w-md p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Sign In</h1>
                <p className="mt-2 text-muted-foreground">
                  You don&apos;t have account?{" "}
                  <Link href="/sign-up" className="text-primary">
                    Sign Up
                  </Link>
                </p>
              </div>
              <SignInForm />
              <div className="flex w-full items-center">
                <hr className="w-full" />
                <p className="mx-2 text-sm opacity-50">Or</p>
                <hr className="w-full" />
              </div>
              <Button className="w-full capitalize" onClick={onSignUp}>
                <GoogleIcon className="size-5" />
                sign in with google
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
