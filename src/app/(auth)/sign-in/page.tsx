"use client";
import { SignInForm } from "@/client/components/forms/auth/signin-form";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session } = authClient.useSession();
  useEffect(() => {
    console.log("session :", session);
  }, [session]);
  const onSignUp = async () =>
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  return (
    <div className="relative flex h-svh w-full items-center justify-center max-sm:flex-col">
      <Card className="min-w-96 p-5">
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
            <Image
              src={"/google-logo.svg"}
              className="size-5"
              width={50}
              height={50}
              alt="google-logo"
            />
            sign in with google
          </Button>
        </div>
      </Card>
    </div>
  );
}
