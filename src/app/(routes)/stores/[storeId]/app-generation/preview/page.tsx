import OnBoardingPage from "@/client/components/templates/fashion/onBoarding";
import MobilePreview from "@/client/components/templates/mobilePreview";

interface Props {
  params: Promise<{ storeId: string }> | { storeId: string };
}
async function Preview({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const { storeId } = resolvedParams;
  return (
    <div className="flex-center text-2xl">
      Preview page withe storId :{storeId}
      <MobilePreview>
        <OnBoardingPage/>
      </MobilePreview>
    </div>
  );
}

export default Preview;
