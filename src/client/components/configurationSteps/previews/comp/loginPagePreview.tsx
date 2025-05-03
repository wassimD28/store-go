import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { useGlobalLayout } from "@/client/store/globalLayout.store";

function LoginPagePreview() {
  const { getActiveColors, radius } = useGlobalLayout();
  const {
    cardColor,
    foregroundColor,
    inputColor,
    inputForegroundColor,
    primaryColor,
    primaryForegroundColor,
  } = getActiveColors();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Target all input placeholder text */
          .custom-placeholder::placeholder {
            color: ${inputForegroundColor} !important;
          }
          .custom-placeholder::-webkit-input-placeholder {
            color: ${inputForegroundColor} !important;
          }
          .custom-placeholder::-moz-placeholder {
            color: ${inputForegroundColor} !important;
          }
          .custom-placeholder:-ms-input-placeholder {
            color: ${inputForegroundColor} !important;
          }
          .custom-placeholder:-moz-placeholder {
            color: ${inputForegroundColor} !important;
          }
        `,
        }}
      />

      <div
        style={{ backgroundColor: cardColor, borderRadius: radius == 100 ? 15 : radius }}
        className="col-span-2 col-start-1 flex w-full flex-col gap-2 rounded-lg px-3 py-4 shadow-custom-sm"
      >
        <h2
          style={{ color: foregroundColor }}
          className="mb-2 text-xl font-bold"
        >
          Login
        </h2>
        <Input
          style={{
            backgroundColor: inputColor,
            color: foregroundColor,
            borderRadius: radius,
          }}
          className="custom-placeholder border-none bg-gray-100 pl-5 text-xs text-black placeholder:text-xs placeholder:font-thin"
          placeholder="Enter your email"
        />
        <Input
          style={{
            backgroundColor: inputColor,
            color: foregroundColor,
            borderRadius: radius,
          }}
          className="custom-placeholder rounded-full border-none bg-gray-100 pl-5 text-xs text-black placeholder:text-xs placeholder:font-thin"
          placeholder="Enter your password"
        />

        <Button
          style={{
            backgroundColor: primaryColor,
            color: primaryForegroundColor,
            borderRadius: radius,
          }}
          className="w-full rounded-full bg-black text-white hover:bg-black"
        >
          Continue
        </Button>
      </div>
    </>
  );
}

export default LoginPagePreview;
