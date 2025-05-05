"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export const ThreeDMarquee = ({
  images,
  className,
  scale = "100", // Add a scale prop with default value
  containerHeight = "600px", // Add a height control prop
}: {
  images: string[];
  className?: string;
  scale?: string; // Scale as percentage (50 = 50%)
  containerHeight?: string;
}) => {
  // Split the images array into 4 equal parts
  const chunkSize = Math.ceil(images.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return images.slice(start, start + chunkSize);
  });

  return (
    <div
      className={cn("mx-auto block overflow-hidden rounded-2xl", className)}
      style={{ height: containerHeight }} // Use the containerHeight prop
    >
      <div className="flex size-full items-center justify-center">
        <div
          className="size-[1200px] shrink-0"
          style={{
            // Convert scale to a decimal and apply it
            transform: `scale(${parseInt(scale) / 100})`,
          }}
        >
          <div
            style={{
              // More moderate transform with adjustable perspective
              transform: "rotateX(30deg) rotateY(0deg) rotateZ(-20deg)",
              transformOrigin: "center center",
            }}
            className="relative grid size-full grid-cols-4" // Reduced gap from 6 to 4
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={{
                  y: colIndex % 2 === 0 ? [0, 40, 0] : [0, -40, 0], // Reduced motion amplitude
                }}
                transition={{
                  duration: colIndex % 2 === 0 ? 10 : 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                key={colIndex + "marquee"}
                className="flex flex-col items-start gap-6" // Reduced gap from 6 to 4
              >
                <GridLineVertical className="-left-3" offset="40px" />
                {subarray.map((image, imageIndex) => (
                  <div className="relative left-3" key={imageIndex + image}>
                    <GridLineHorizontal className="-top-3" offset="20px" />
                    <motion.div
                      whileHover={{
                        y: -5, // Reduced hover movement
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Image
                        src={image}
                        alt={`Image ${imageIndex + 1}`}
                        className="w-full rounded-lg object-cover shadow-md ring-1 ring-gray-950/10"
                        width={200} // Reduced from 300
                        height={150} // Reduced from 200
                      />
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// GridLineHorizontal unchanged
const GridLineHorizontal = ({
  className,
  offset = "10px",
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset,
          "--color-dark": "rgba(255, 255, 255, 0.2)",
        } as React.CSSProperties
      }
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

// GridLineVertical unchanged
const GridLineVertical = ({
  className,
  offset = "10px",
}: {
  className?: string;
  offset?: string;
}) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset,
          "--color-dark": "rgba(255, 255, 255, 0.2)",
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};
