"use client";
import { SignUpForm } from "@/client/components/auth/signup-form";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function SignUpPage() {

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
    <div className=" w-full h-svh flex justify-center items-center p-8 relative max-sm:flex-col">
      <Card className="min-w-96 p-5">
        <div className="space-y-6 ">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground mt-2">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary">
                Sign in
              </Link>
            </p>
          </div>
          <SignUpForm />
          <div className="flex items-center w-full">
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
