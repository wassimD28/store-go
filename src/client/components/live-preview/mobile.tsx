import { ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
}
function MobileLivePreview({ className, children }: Props) {
  return (
    <svg
      className={className}
      width="446"
      height="893"
      viewBox="0 0 446 893"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Mobile">
        <path
          id="power btn"
          d="M426 303H438C442.418 303 446 306.582 446 311V364C446 368.418 442.418 372 438 372H426V303Z"
          fill="#1C1C1D"
        />
        <path
          id="volume btns"
          d="M426 126H438C442.418 126 446 129.582 446 134V278C446 282.418 442.418 286 438 286H426V126Z"
          fill="#1C1C1D"
        />
        <rect id="edge" width="432" height="893" rx="32" fill="#27272A" />
        <foreignObject x="21" y="25" width="390" height="844">
          <div className="w-full h-full rounded-2xl overflow-hidden relative flex flex-col items-center justify-start">
            {children} {/* Render dynamic content here */}
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}

export default MobileLivePreview;
