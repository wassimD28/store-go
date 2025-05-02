import CurrentPreview from "@/client/components/configurationSteps/currentPreview";
import CurrentStepContainer from "@/client/components/configurationSteps/currentStepContainer";
import { QuickStartStepper } from "@/client/components/stepper/quick-start-stepper";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return (
    <div className="flex-center h-full p-3 text-2xl">
      <div className="grid h-full w-full grid-cols-[20%_1fr_1fr] gap-4">
        <div className="h-full">
          <QuickStartStepper />
        </div>
        <CurrentStepContainer />
        <CurrentPreview />
      </div>
    </div>
  );
}
