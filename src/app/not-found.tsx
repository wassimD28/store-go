"use client";
import Link from "next/link";
import { Button } from "@/client/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import NotFoundIcon from "@/client/components/icons/notFoundIcon";
import { useDarkMode } from "@/client/store/darkMode.store";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-md flex-col items-center justify-center space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight lg:text-5xl">
            404
          </h1>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-muted-foreground">
            Page not found
          </h2>
          <p className="mb-8 text-muted-foreground">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        {/* Optional: Custom Image or Illustration */}
        <div className="relative h-48 w-48">
          <NotFoundIcon
            color={darkMode ? "white" : "black"}
            width={40}
            height={40}
            className="h-full w-full opacity-80"
          />
        </div>{" "}
        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <Button variant="default" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
