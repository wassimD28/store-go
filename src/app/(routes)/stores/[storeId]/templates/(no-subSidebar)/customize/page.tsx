import CurrentPreview from "@/client/components/configurationSteps/currentPreview";
import ConfigStepperContainer from "@/client/components/configurationSteps/configStepperContainer";
import CurrentConfigForm from "@/client/components/configurationSteps/currentConfigForm";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string  }>;
  searchParams: Promise<{
    templateId: string;
    type: "fashion" | "shoes" | "electronic";
  }>;
}) {
  const { storeId } = await params;
  const { templateId, type } = await searchParams;
 
  return (
    <div className="flex-center h-full p-3 text-2xl">
      <div className="grid h-full w-full grid-cols-[20%_1fr_1fr] gap-4">
        <ConfigStepperContainer storeId={storeId} templateId={templateId} type={type}/>
        <CurrentConfigForm />
        <CurrentPreview />
      </div>
    </div>
  );
}
