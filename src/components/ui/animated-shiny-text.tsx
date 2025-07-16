import { ComponentPropsWithoutRef, CSSProperties, FC } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={{
        "--shiny-width": `${shimmerWidth}px`,
      } as CSSProperties}
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",

        // Shine effect
        // Assuming 'animate-shiny-text' uses the 'shiny-text' keyframes defined in globals.css
        "animate-shiny-text bg-clip-text text-transparent bg-no-repeat [background-size:var(--shiny-width)_100%]",

        // Shine gradient
        "bg-gradient-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",

        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}; 