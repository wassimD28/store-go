import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";

function LoginPagePreview() {
  return (
    <div className="col-span-2 col-start-1 flex w-full flex-col gap-2 rounded-lg px-3 py-4 shadow-custom-sm">
      <h2 className="mb-2 text-xl font-bold text-black">Login</h2>
      <Input
        className="rounded-full border-none bg-gray-100 pl-5 text-xs text-black placeholder:text-xs placeholder:font-thin"
        placeholder="Enter your email"
      />
      <Input
        className="rounded-full border-none bg-gray-100 pl-5 text-xs text-black placeholder:text-xs placeholder:font-thin"
        placeholder="Enter your password"
      />

      <Button className="w-full rounded-full bg-black text-white hover:bg-black">
        Continue
      </Button>
    </div>
  );
}

export default LoginPagePreview;
