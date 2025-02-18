"use client";
import { SignInForm } from "@/client/components/auth/signin-form";
import { Button } from "@/client/components/ui/button";
import { Card } from "@/client/components/ui/card";
import { useDarkMode } from "@/client/store/useDarkMode.store";
import { signIn, useSession } from "@/lib/auth-client";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function SignInPage() {
  const { darkMode, setDarkMode } = useDarkMode();
  const { data: session } = useSession();
  useEffect(() => {
    console.log("session :", session);
  }, [session]);
  const onSignUp = async () =>
    signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  return (
    <div className=" w-full flex justify-center items-center p-8 relative max-sm:flex-col" >
      <Button
        className="absolute border border-foreground/20 right-5 top-5 max-sm:relative max-sm:top-auto max-sm:right-auto max-sm:self-end max-sm:mb-5"
        variant={"ghost"}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun /> : <Moon />}
      </Button>
      <Card className="min-w-96 p-5">
        <div className="space-y-6 ">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have account?{" "}
              <Link href="/sign-up" className="text-primary">
                Sign Up
              </Link>
            </p>
          </div>
          <SignInForm />
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
