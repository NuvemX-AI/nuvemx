"use client"

import React, { useId } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
// import Image from "next/image" // Removed unused import

interface GradientTracingProps {
  width?: number // Target width for the component's container
  height?: number // Target height for the component's container
  baseColor?: string
  gradientColors?: [string, string, string]
  animationDuration?: number
  strokeWidth?: number
  // path prop removed to default to standard infinity
  className?: string
}

export const GradientTracing: React.FC<GradientTracingProps> = ({
  width = 100, // Default container width if not overridden by className
  height = 50, // Default container height, maintaining 2:1 if not overridden
  baseColor = "currentColor", 
  gradientColors = [
    "hsl(var(--accent))", 
    "hsl(var(--primary))", 
    "hsl(var(--accent))"
  ], 
  animationDuration = 2,
  strokeWidth = 2, // Relative to the new viewBox
  className,
}) => {
  const uniqueId = useId();
  const gradientId = `pulse-${uniqueId}`;
  
  // Define a "padding" for the viewBox to prevent stroke clipping
  const padding = strokeWidth * 2; // Adjust padding based on strokeWidth

  // Intrinsic dimensions of the infinity path itself (without padding)
  const pathWidth = 100;
  const pathHeight = 50;

  // ViewBox dimensions including padding
  const viewBoxWidth = pathWidth + padding * 2;
  const viewBoxHeight = pathHeight + padding * 2;

  // Adjusted infinity path, now drawn starting from (padding, padding) 
  // within the new viewBox, instead of (0,0)
  const infinityPath = `M ${padding} ${pathHeight / 2 + padding}` +
    ` C ${padding} ${padding}, ${pathWidth * 0.25 + padding} ${padding}, ${pathWidth / 2 + padding} ${pathHeight / 2 + padding}` +
    ` C ${pathWidth * 0.75 + padding} ${pathHeight + padding}, ${pathWidth + padding} ${pathHeight + padding}, ${pathWidth + padding} ${pathHeight / 2 + padding}` +
    ` C ${pathWidth + padding} ${padding}, ${pathWidth * 0.75 + padding} ${padding}, ${pathWidth / 2 + padding} ${pathHeight / 2 + padding}` +
    ` C ${pathWidth * 0.25 + padding} ${pathHeight + padding}, ${padding} ${pathHeight + padding}, ${padding} ${pathHeight / 2 + padding} Z`;

  return (
    <div 
      className={cn("relative", className)} 
      // Apply width/height from props only if not specified in className
      style={
        !className?.includes('w-') && !className?.includes('h-') 
        ? { width: `${width}px`, height: `${height}px` } 
        : {}
      }
    >
      <svg
        width="100%" // SVG fills the div container
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} // Fixed viewBox to maintain aspect ratio
        preserveAspectRatio="xMidYMid meet" // Ensures scaling respects aspect ratio and centers
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={infinityPath}
          stroke={baseColor}
          strokeOpacity="0.2"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.path 
          d={infinityPath}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          initial={{ pathLength: 0.01, pathOffset: 1 }}
          animate={{ pathLength: 1, pathOffset: 0 }}
          transition={{
            duration: animationDuration / 1.5,
            ease: "easeInOut",
          }}
        />
        <defs>
          <motion.linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse" // Coordinates relative to viewBox
            // Animate gradient across the viewBox width
            x1={padding} 
            y1={padding} 
            // x2={viewBoxWidth} // A static x2 could also work if x1 moves enough
            // y2={0}
            animate={{
              x1: [`-${pathWidth}%`, `${pathWidth + padding * 2}%`], // Animate across the full viewBox with path
              x2: [`0%`, `${pathWidth * 2 + padding * 2}%`],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <stop stopColor={gradientColors[0]} stopOpacity="0" />
            <stop stopColor={gradientColors[1]} />
            <stop offset="1" stopColor={gradientColors[2]} stopOpacity="0" />
          </motion.linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default GradientTracing;
