"use client"
import PageCard from "@/client/components/card/pageCard";

function Page() {
    const data = [
        { id: "DSFSQFDS", name: "Welcome page", image: "/images/OnboardingPage.png" },
        { id: "JSQFQLDF", name: "Home page", image: "/images/HomePage.png" },
        { id: "QFSQDFSQ", name: "Fiche product", image: "/images/ProductPage.png" },
        
    ];
  return (
    <div className="flex flex-col h-full w-full items-center">
      {/* Page content */}
      <div className="w-full h-full flex gap-8 p-10">
        {
            data.map(page=>(
                <PageCard key={page.id} id={page.id} name={page.name} image={page.image} />
            ))
        }
      </div>
    </div>
  );
}

export default Page;
