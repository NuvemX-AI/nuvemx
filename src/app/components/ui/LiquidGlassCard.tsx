import React from 'react';
import { cn } from "@/lib/utils"; // Assumindo que você tem uma função utilitária para classnames

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Estilos base otimizados para performance - mais escuro
          "flex flex-col rounded-3xl border border-white/20 bg-black/50 shadow-lg backdrop-blur-xl",
          // Transição suave sem hover
          "transition-all duration-200 ease-out",
          // GPU acceleration para melhor performance
          "transform-gpu will-change-transform",
          className // Permite adicionar classes customizadas
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LiquidGlassCard.displayName = "LiquidGlassCard";

// Você pode querer exportar subcomponentes como Header, Content, Footer
// de forma similar ao Card.tsx para manter a consistência, se desejar.
// Por exemplo:

// interface LiquidGlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
//   children: React.ReactNode;
// }
// const LiquidGlassCardHeader = React.forwardRef<HTMLDivElement, LiquidGlassCardHeaderProps>(
//   ({ className, children, ...props }, ref) => (
//     <div ref={ref} className={cn("mb-4", className)} {...props}>
//       {children}
//     </div>
// ));
// LiquidGlassCardHeader.displayName = "LiquidGlassCardHeader";

// interface LiquidGlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
//   children: React.ReactNode;
// }
// const LiquidGlassCardContent = React.forwardRef<HTMLDivElement, LiquidGlassCardContentProps>(
//   ({ className, children, ...props }, ref) => (
//     <div ref={ref} className={cn(className)} {...props}>
//       {children}
//     </div>
// ));
// LiquidGlassCardContent.displayName = "LiquidGlassCardContent";

// export { LiquidGlassCard, LiquidGlassCardHeader, LiquidGlassCardContent };

export { LiquidGlassCard }; 