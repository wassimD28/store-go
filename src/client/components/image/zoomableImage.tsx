import Image from "next/image";
import { Lens } from "../ui/lens";
import { useState } from "react";

type BaseProps = {
  src: string;
  alt: string;
  className?: string;
};

type FillProps = BaseProps & {
  fill: true; // using true for a clearer discriminator
};

type FixedProps = BaseProps & {
  width: number;
  height: number;
};

type Props = FillProps | FixedProps;

function ZoomableImage(props: Props) {
  const [hovering, setHovering] = useState(false);

  return (
    <Lens hovering={hovering} setHovering={setHovering}>
      {"fill" in props ? (
        <Image
          src={props.src}
          alt={props.alt}
          fill
          className={props.className}
        />
      ) : (
        <Image
          src={props.src}
          alt={props.alt}
          width={props.width}
          height={props.height}
          className={props.className}
        />
      )}
    </Lens>
  );
}

export default ZoomableImage;
