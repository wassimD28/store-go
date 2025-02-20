import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import Link from "next/link";

function Page() {
  return (
    <div className="w-svw h-svh flex justify-center items-center bg-background text-foreground">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle className="capitalize text-center">Your email has been verified successfully!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            Thank you for verifying your email address. You can now log in to
            your account. If you have any questions, please don&apos;t hesitate
            to contact our support team.
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button>
            <Link href={"/dashboard"}>Go To Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Page;
