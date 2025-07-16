"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  return (
    <>
      {!isDashboardRoute && (
        <header className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out",
          "px-0 sm:px-6 lg:px-8",
        )}>
          {/* O conteúdo do header foi removido para ser colocado no OriginalNuvemXHero.tsx */}
        </header>
      )}
      <main className={cn(
        "flex-1 flex flex-col",
        isDashboardRoute
          ? "" 
          : "pt-0" // Remover padding-top, será controlado pelo Hero
      )}>{children}</main>
    </>
  );
} 