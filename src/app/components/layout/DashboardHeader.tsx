'use client';

import React from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // Image component no longer needed
import { UserButton, SignedIn } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Cloud } from 'lucide-react'; // Added Cloud icon
// import { Bell } from 'lucide-react'; // Exemplo se quiser adicionar notificações
import { TypingAnimation } from "@/components/magicui/typing-animation"; // Added TypingAnimation import

export const DashboardHeader = () => {
  // Removed isScrolled state and useEffect hook

  // const logoHeight = 32; // No longer needed for dynamic height

  return (
    <header className={cn(
      "sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out",
      "bg-white/95 shadow-md backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95 border-b border-slate-200 py-3"
    )}>
      <div className="max-w-full mx-auto flex items-center justify-between">
        <Link
          href="/dashboard" // Changed from "/" to "/dashboard" as it's a dashboard header
          aria-label="Dashboard NuvemX.AI"
          className="flex items-center gap-2 group" // Added group for hover effects
        >
          {/* Replaced Image with Cloud icon and text */}
          <Cloud size={32} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
          <span className="text-2xl font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
            <TypingAnimation>NuvemX.AI</TypingAnimation>
          </span>
        </Link>

        <div className="flex-1"></div> {/* Espaçador */}

        <div className="flex items-center gap-3">
          {/* Adicionar aqui outros ícones/controles se necessário */}
          {/* <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button> */}
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}; 