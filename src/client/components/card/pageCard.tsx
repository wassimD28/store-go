import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";

interface props {
  id: string;
  name: string;
  image: string;
}
function PageCard({ id, name, image }: props) {
  return (
    <div className="shadow-custom-xl py-2 flex h-fit w-72 flex-col items-center gap-2 rounded-xl bg-background dark:bg-border/20">
      <div className="relative w-[calc(100%-16px)] bg-border rounded-xl flex items-center justify-center h-48 mb-2">
        <Image
          src={image}
          className="aspect-auto h-[103%] shadow-custom-md w-24 rounded-xl absolute"
          width={200}
          height={300}
          alt={name}
        />
      </div>
      <h2 className="self-start pl-2 font-medium text-sm mb-1">{name}</h2>
      <hr className="w-full" />
      <div className="flex w-full justify-between px-2">
        <Button variant={"outline"}>Preview</Button>
        <Button className="bg-primary/20 hover:bg-primary/30 text-primary">
          Edit <ArrowUpRight />
        </Button>
      </div>
    </div>
  );
}

export default PageCard;
