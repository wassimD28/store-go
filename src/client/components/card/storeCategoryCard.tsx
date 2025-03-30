import Image from "next/image";

interface props {
  name: string;
  description: string;
  image: string;
}
function StoreCategoryCard({ name, description, image }: props) {
  return (
    <div className="flex w-80 cursor-pointer flex-col rounded bg-background p-4 shadow-xl transition-all duration-200 ease-in-out dark:bg-foreground/5">
      <Image src={image} width={100} height={100} alt={name} />
      <h1>{name}</h1>
      <p className="text-xs text-foreground/50">{description}</p>
    </div>
  );
}

export default StoreCategoryCard;
