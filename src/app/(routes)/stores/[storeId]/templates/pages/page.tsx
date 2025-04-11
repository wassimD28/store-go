"use client";
import PageCard from "@/client/components/card/pageCard";

function Page() {
  const data = [
    {
      id: "DSFSQFDS",
      name: "Welcome page",
      image: "/images/OnBoardingScreen.png",
    },
    { id: "JSQFQLDF", name: "Home page", image: "/images/HomePage.png" },
    { id: "QFSQDFSQ", name: "Fiche product", image: "/images/ProductPage.png" },
  ];
  return (
    <div className="flex h-full w-full flex-col items-center">
      {/* Page content */}
      <div className="flex h-full w-full gap-8 p-10">
        {data.map((page) => (
          <PageCard
            key={page.id}
            id={page.id}
            name={page.name}
            image={page.image}
          />
        ))}
      </div>
    </div>
  );
}

export default Page;
