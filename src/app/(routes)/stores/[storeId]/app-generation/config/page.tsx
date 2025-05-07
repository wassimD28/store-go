import CurrentPreview from "@/client/components/configurationSteps/currentPreview";
import ConfigStepperContainer from "@/client/components/configurationSteps/configStepperContainer";
import CurrentConfigForm from "@/client/components/configurationSteps/currentConfigForm";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return (
    <div className="flex-center h-full p-3 text-2xl">
      <div className="grid h-full w-full grid-cols-[20%_1fr_1fr] gap-4">
        <ConfigStepperContainer storeId={storeId} type="fashion" templateId="for-test-purposes" />
        <CurrentConfigForm />
        <CurrentPreview />
      </div>
    </div>
  );
}
