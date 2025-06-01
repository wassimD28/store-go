import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface GridMotionProps {
  /**
   * Array of items to display in the grid
   */
  items?: (string | ReactNode)[];
  /**
   * Color for the radial gradient background
   */
  gradientColor?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function GridMotion({
  items = [],
  gradientColor = "black",
  className,
}: GridMotionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef(window.innerWidth / 2);
  const totalItems = 28; // 4 rows × 7 columns = 28 items
  const defaultItems = Array.from(
    { length: totalItems },
    (_, index) => `Item ${index + 1}`,
  );
  const combinedItems =
    items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
    };
    const updateMotion = () => {
      const maxMoveAmount = 80;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          // Reduce movement significantly for middle rows
          const rowMultiplier = index === 1 || index === 2 ? 0.3 : 0.7;
          const mouseProgress = mouseXRef.current / window.innerWidth;
          const moveAmount =
            (mouseProgress * maxMoveAmount * rowMultiplier -
              maxMoveAmount * rowMultiplier) *
            direction;

          gsap.to(row, {
            x: moveAmount,
            duration:
              baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div
      className={cn("h-full w-full overflow-hidden", className)}
      ref={gridRef}
    >
      {" "}
      <section
        className="relative flex h-screen w-full items-start justify-start overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        {" "}
        <div className="z-2 -rotate-15 relative grid h-[120vh] w-[120vw] flex-none origin-top-left -translate-x-10 -translate-y-10 grid-cols-[100%] grid-rows-[repeat(4,1fr)] gap-3">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="will-change-filter grid grid-cols-[repeat(7,1fr)] gap-3 will-change-transform"
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                const isImage =
                  typeof content === "string" && content.startsWith("http");

                return (
                  <div key={itemIndex} className="relative">
                    <div
                      className={`relative flex items-center justify-center overflow-hidden rounded-md bg-muted text-sm text-foreground ${
                        isImage ? "aspect-[9/16]" : "h-full w-full"
                      }`}
                    >
                      {isImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${content})`,
                          }}
                        />
                      ) : (
                        <div className="z-1 p-2 text-center text-xs">
                          {content}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="pointer-events-none relative inset-0 h-full w-full">
          <div className="rounded-none" />
        </div>
      </section>
    </div>
  );
}
