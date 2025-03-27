/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ImageKitProvider, IKImage, IKUpload } from "imagekitio-next";
import { useRef, useState } from "react";
import { ImagePlusIcon } from "lucide-react";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";

const authenticator = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL!}/api/auth/imagekit`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `IK Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};
interface Props {
  onUploadSuccess: (data: any) => void;
}
function IKimageUploader({ onUploadSuccess }: Props) {
  const IKUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const handleUpload = (e: any) => {
    e.preventDefault();
    if (IKUploadRef.current) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      IKUploadRef.current.click();
    }
  };
  const onError = (err: any) => {
    console.log("Error", err);
  };

  const onSuccess = (res: IKUploadResponse) => {
    setFile(res);
    onUploadSuccess(res.url);
  };

  return (
    <ImageKitProvider
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={IKUploadRef}
        onSuccess={onSuccess}
        onError={onError}
        fileName="test-upload.png"
      />
      <button
        onClick={(e) => {
          handleUpload(e);
        }}
        className="flex h-44 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-border bg-primary-foreground"
      >
        {file ? (
          <IKImage
            className="h-[90%] rounded-lg shadow-custom-lg dark:shadow-primary/30"
            alt={file.filePath}
            path={file.filePath}
            width={150}
            height={150}
          />
        ) : (
          <>
            <ImagePlusIcon
              size={40}
              className="text-muted-foreground opacity-50"
            />
            <p className="text-sm text-muted-foreground opacity-50">
              Drag and drop image here, or click add image
            </p>
          </>
        )}
      </button>
    </ImageKitProvider>
  );
}

export default IKimageUploader;
