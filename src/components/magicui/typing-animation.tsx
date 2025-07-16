"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps extends HTMLMotionProps<"div"> {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
  onComplete?: () => void;
}

export function TypingAnimation({
  children,
  className,
  duration = 100,
  delay = 0,
  as: Component = "div",
  startOnView = false,
  onComplete,
  ...props
}: TypingAnimationProps) {
  const MotionComponent = motion(Component as React.ElementType);

  const [displayedText, setDisplayedText] = useState<string>("");
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!startOnView) {
      setTimeout(() => {
        setStarted(true);
      }, delay);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setStarted(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
        if (currentElement && observer.takeRecords().length > 0) {
             observer.unobserve(currentElement);
        }
        observer.disconnect();
    };
  }, [delay, startOnView]);

  useEffect(() => {
    if (!started || !children) {
        setDisplayedText("");
        return;
    }

    let i = 0;
    setDisplayedText("");
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
        onComplete?.();
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [children, duration, started, onComplete]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn(className)}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
}
