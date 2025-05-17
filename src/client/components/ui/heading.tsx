import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({ title, description, className }) => {
  return (
    <div className={cn("", className)}>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default Heading;
