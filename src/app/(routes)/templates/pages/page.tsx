"use client"
import { PagesBreadCrumb } from "@/client/components/breadcrumb/pages.breadcrumb";
import PageCard from "@/client/components/card/pageCard";
import { PublishedFilter } from "@/client/components/filter/published.filter";
import { Button } from "@/client/components/ui/button";
import { ChevronLeft, Eye } from "lucide-react";

function Page() {
    const data = [
        { id: "DSFSQFDS", name: "Welcome page", image: "/images/OnboardingPage.png" },
        { id: "JSQFQLDF", name: "Home page", image: "/images/HomePage.png" },
        { id: "QFSQDFSQ", name: "Fiche product", image: "/images/ProductPage.png" },
        
    ];
  return (
    <div className="gird grid-rows-[auto_1fr] h-full w-full flex-col items-center">
      {/* Bread crumb  */}
      <div className="flex w-full justify-between bg-sidebar px-4 py-3 shadow-xl">
        <div className="flex gap-3 items-center">
          <Button className="size-9 rounded-full bg-primary/10 hover:bg-primary/20">
            <ChevronLeft className="text-foreground" />
          </Button>
          <PagesBreadCrumb/>
        </div>
        <div className="flex gap-4">
          <PublishedFilter/>
          <Button size={"lg"}>Save</Button>
          <Button size={"lg"} className="bg-sidebar" variant={"outline"}>
            <span className="flex size-6 items-center justify-center rounded-full bg-foreground/10">
              <Eye />
            </span>
            Preview
          </Button>
        </div>
      </div>
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
