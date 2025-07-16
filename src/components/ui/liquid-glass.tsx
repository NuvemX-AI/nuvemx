"use client";

import React from "react";
import Image from "next/image";

// Types
interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
}

interface DockIcon {
  src?: string; // Made optional
  alt?: string; // Made optional
  iconNode?: React.ReactNode; // Added for React components as icons
  onClick?: () => void;
  href?: string; // Optional: if each icon itself is a link
  label?: string; // Optional: for accessibility, if iconNode is used
}

// Glass Effect Wrapper Component - Simplified for macOS Dock Look
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
}) => {
  const glassStyle = {
    // Main outer shadow for depth
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0,0,0,0.1)", 
    transition: "all 0.7s cubic-bezier(0.175, 0.885, 0.32, 2.2)", // Adjusted timing function
    ...style,
  };

  const content = (
    <div
      // Removed text-black, font-semibold from here as it should be on children if needed
      className={`relative flex overflow-hidden cursor-pointer ${className}`}
      style={glassStyle}
    >
      {/* Glass Layers */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-inherit"
        style={{
          backdropFilter: "blur(16px)", // Increased blur
          // filter: "url(#glass-distortion)", // Temporarily removed complex SVG filter
          WebkitBackdropFilter: "blur(16px)", // For Safari
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-inherit"
        // Light, highly transparent overlay for the glass color itself
        style={{ background: "rgba(255, 255, 255, 0.08)" }} // Adjusted for more transparency
      />
      <div
        className="absolute inset-0 z-20 rounded-inherit overflow-hidden pointer-events-none"
        // Inner shadow for highlights, similar to macOS
        style={{
          boxShadow: 
            "inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -1px 1px rgba(0, 0, 0, 0.1)",
        }}
      />

      {/* Content: ensure children are above glass layers */}
      <div className="relative z-30 flex items-center w-full h-full">{children}</div>
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

// Dock Component - Original, might be replaced by custom logic in TopDockNav for Lucide icons
export const GlassDock: React.FC<{ icons: DockIcon[]; href?: string; iconClassName?: string }> = ({ 
  icons,
  href, 
  iconClassName = "p-1.5 rounded-full transition-all duration-300 ease-in-out hover:scale-125 flex items-center justify-center"
}) => (
  <GlassEffect
    href={href} 
    className="rounded-3xl p-2 hover:p-3 hover:rounded-4xl"
  >
    <div className="flex items-center justify-center gap-1.5 rounded-3xl p-0 overflow-hidden"> 
      {icons.map((icon, index) => {
        const commonProps = {
          key: index,
          onClick: icon.onClick,
          title: icon.label, 
          className: `${iconClassName} ${icon.onClick ? 'cursor-pointer' : ''}`,
          style: {
            transformOrigin: "center center",
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
          },
        };

        const iconContent = icon.iconNode ? (
          <div {...commonProps}>{icon.iconNode}</div>
        ) : icon.src ? (
          <Image
            src={icon.src}
            alt={icon.alt || 'dock icon'}
            width={48}
            height={48}
            {...commonProps}
          />
        ) : null;

        return icon.href ? (
          <a key={`link-${index}`} href={icon.href} target="_blank" rel="noopener noreferrer">
            {iconContent}
          </a>
        ) : (
          iconContent
        );
      })}
    </div>
  </GlassEffect>
);

// Button Component - Original
export const GlassButton: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href,
}) => (
  <GlassEffect
    href={href}
    className="rounded-3xl px-10 py-6 hover:px-11 hover:py-7 hover:rounded-4xl overflow-hidden"
  >
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
      }}
    >
      {children}
    </div>
  </GlassEffect>
);

// SVG Filter Component - Kept for reference, but #glass-distortion is not used in simplified GlassEffect
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

// Main Component (example usage) - This should be updated if GlassDock changes significantly or is not used.
export const Component = () => {
  const dockIcons: DockIcon[] = [
    {
      // Example with iconNode for testing the interface
      iconNode: <div style={{width: '48px', height: '48px', backgroundColor:'orange', borderRadius: '10px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'24px'}}>C</div>,
      label: "Claude",
    },
    {
      src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/9e80c50a5802d3b0a7ec66f3fe4ce348_low_res_Finder.png",
      alt: "Finder",
      label: "Finder",
    },
    // ... (rest of the example icons from user provided code) ...
    {
      src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/c2c4a538c2d42a8dc0927d7d6530d125_low_res_ChatGPT___Liquid_Glass__Default_.png",
      alt: "Chatgpt",
      label: "Chatgpt",
    },
    {
      src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/6d26d432bd65c522b0708185c0768ec3_low_res_Maps.png",
      alt: "Maps",
      label: "Maps",
    },
    {
      src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/7c59c945731aecf4f91eb8c2c5f867ce_low_res_Safari.png",
      alt: "Safari",
      label: "Safari",
    },
    {
      src: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/b7f24edc7183f63dbe34c1943bef2967_low_res_Steam___Liquid_Glass__Default_.png",
      alt: "Steam",
      label: "Steam",
    },
  ];

  return (
    <div
      className="min-h-screen h-full flex items-center justify-center font-light relative overflow-hidden w-full"
      style={{
        background: `url("https://images.unsplash.com/photo-1432251407527-504a6b4174a2?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D") center center`,
        animation: "moveBackground 60s linear infinite",
      }}
    >
      <GlassFilter />

      <div className="flex flex-col gap-6 items-center justify-center w-full">
        {/* The href on GlassDock here applies to the whole dock container if it acts as a single link */}
        <GlassDock icons={dockIcons} href="https://x.com/notsurajgaud" iconClassName="w-12 h-12" />

        <GlassButton href="https://x.com/notsurajgaud">
          <div className="text-xl text-white">
            <p>How can i help you today?</p>
          </div>
        </GlassButton>
      </div>     
    </div>
  );
}

