import { getStoreTemplates } from "@/app/actions/storeTemplate.actions";
import TemplateDialogContent from "@/client/components/dialogContent/templateDialogContent";
import { ThreeDMarquee } from "@/client/components/ui/3d-marquee";
import { Card, Carousel } from "@/client/components/ui/apple-cards-carousel";
async function Page({ params }: { params: Promise<{ storeId: string }> }) {
  // Properly await the params object
  const data = await getStoreTemplates();
  const cards = (data.templates || []).map((template, index) => (
    <Card
      className="relative h-96 w-64 rounded-xl after:absolute after:inset-0 after:z-10 after:bg-gradient-to-b after:from-black/50 after:to-transparent after:content-[''] md:h-[30rem] md:w-80"
      key={template.id}
      card={{
        category: template.storeType,
        title: template.name,
        src: template.images[0],
        content: <TemplateDialogContent template={template} />,
        media: (
          <ThreeDMarquee
            scale="70"
            className="pointer-events-none"
            images={template.images}
          />
        ),
      }}
      index={index}
    />
  ));

  return (
    <div className="h-full w-full py-8">
      <h2 className="mx-auto mb-3 max-w-7xl pl-4 font-sans text-xl font-bold text-neutral-800 dark:text-neutral-200 md:text-4xl">
        Choose Your Template
      </h2>
      <Carousel scrollContainerClassName="md:py-6" items={cards} />
    </div>
  );
}

export default Page;
