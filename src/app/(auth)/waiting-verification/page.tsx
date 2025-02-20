import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";

function Page() {
  return (
    <div className="w-svw h-svh flex justify-center items-center bg-background text-foreground">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="capitalize text-center">
            Account created successfully!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            A verification email has been sent. Please check your inbox to
            activate your account.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
