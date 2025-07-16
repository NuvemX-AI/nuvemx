'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SilkBackgroundProps {
  className?: string;
  foldColorValue?: number; 
  highlightColorValue?: number;
  speed?: number;
  noiseIntensity?: number;
  patternScale?: number;
}

export const SilkBackground: React.FC<SilkBackgroundProps> = ({
  className,
  foldColorValue = 225,      // Light gray default
  highlightColorValue = 255, // White default
  speed = 0.02,
  noiseIntensity = 0.8,
  patternScale = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationTimeRef = useRef(0);
  const isVisibleRef = useRef(false); // New ref to track visibility

  const runAnimationLoop = useCallback(() => {
    // If not visible or no canvas/context, stop the loop
    if (!isVisibleRef.current || !canvasRef.current || !ctxRef.current) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const currentLogicalTime = animationTimeRef.current;
    const { width, height } = canvas;

    if (width === 0 || height === 0) {
      animationFrameIdRef.current = requestAnimationFrame(runAnimationLoop);
      return;
    }

    // Use prop values (or their defaults if props are undefined)
    const currentHighlightColor = highlightColorValue;
    const currentFoldColor = foldColorValue;
    const currentPatternScale = patternScale;
    const currentSpeed = speed;
    const currentNoiseIntensity = noiseIntensity;

    ctx.fillStyle = `rgb(${currentHighlightColor}, ${currentHighlightColor}, ${currentHighlightColor})`;
    ctx.fillRect(0, 0, width, height);

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const localNoise = (x: number, y: number) => {
      const G = 2.71828;
      const rx = G * Math.sin(G * x);
      const ry = G * Math.sin(G * y);
      return (rx * ry * (1 + x)) % 1;
    };

    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        const u = (x / width) * currentPatternScale;
        const v = (y / height) * currentPatternScale;
        
        const tOffset = currentSpeed * currentLogicalTime;
        const tex_x = u;
        const tex_y = v + 0.03 * Math.sin(8.0 * tex_x - tOffset);

        const patternValue = 0.6 + 0.4 * Math.sin(
          5.0 * (tex_x + tex_y + 
            Math.cos(3.0 * tex_x + 5.0 * tex_y) + 
            0.02 * tOffset) +
          Math.sin(20.0 * (tex_x + tex_y - 0.1 * tOffset))
        );

        const rnd = localNoise(x, y);
        const intensity = Math.max(0, patternValue - rnd / 15.0 * currentNoiseIntensity);
        
        const colorVal = Math.floor(currentFoldColor + (currentHighlightColor - currentFoldColor) * intensity);
        const r = colorVal;
        const g = colorVal;
        const b = colorVal;
        const a = 255;

        // Fill 2x2 block
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            const currentX = x + dx;
            const currentY = y + dy;
            if (currentX < width && currentY < height) {
              const pixelIndex = (currentY * width + currentX) * 4;
              data[pixelIndex] = r;
              data[pixelIndex + 1] = g;
              data[pixelIndex + 2] = b;
              data[pixelIndex + 3] = a;
            }
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    animationTimeRef.current += 1;
    animationFrameIdRef.current = requestAnimationFrame(runAnimationLoop);
  }, [foldColorValue, highlightColorValue, speed, noiseIntensity, patternScale]); // Dependencies from props

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const context2D = canvas.getContext('2d');
    if (!context2D) {
      // console.error("Failed to get 2D context from canvas"); // Comentado o console.log original
      return;
    }
    ctxRef.current = context2D;
    animationTimeRef.current = 0; 

    const handleResize = () => {
      if (wrapperRef.current && canvasRef.current && ctxRef.current) { // Adicionado ctxRef.current check
        const newWidth = wrapperRef.current.offsetWidth;
        const newHeight = wrapperRef.current.offsetHeight;
        // console.log('SilkBackground Resized - Width:', newWidth, 'Height:', newHeight); // Mantido comentado
        if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
            canvasRef.current.width = newWidth;
            canvasRef.current.height = newHeight;
            // If visible, request a redraw, otherwise it will be picked up when visible
            if (isVisibleRef.current && !animationFrameIdRef.current) {
                animationTimeRef.current = 0; // Reset time for a fresh draw if needed
                animationFrameIdRef.current = requestAnimationFrame(runAnimationLoop);
            }
        }
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(wrapper);
    handleResize(); // Initial size setup

    // Intersection Observer setup
    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisibleRef.current = true;
          if (!animationFrameIdRef.current) { // Start animation if not already running
            animationTimeRef.current = 0; // Reset time for fresh animation
            animationFrameIdRef.current = requestAnimationFrame(runAnimationLoop);
          }
        } else {
          isVisibleRef.current = false;
          if (animationFrameIdRef.current) { // Stop animation
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }
        }
      });
    };
    const intersectionObserver = new IntersectionObserver(intersectionCallback, { threshold: 0.01 }); // Trigger if even 1% is visible
    intersectionObserver.observe(wrapper);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect(); // Disconnect intersection observer
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [runAnimationLoop]); // runAnimationLoop is stable

  return (
    // Reverted to absolute positioning to be contained by a relative parent
    <div 
      ref={wrapperRef} 
      className={cn(
        "absolute inset-0 w-full h-full -z-10", // Changed from fixed w-screen h-screen
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default SilkBackground; 