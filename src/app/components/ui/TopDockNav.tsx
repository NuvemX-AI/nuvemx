"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from "@clerk/nextjs";
// import { GlassDock, GlassFilter } from "@/components/ui/liquid-glass"; // GlassDock no longer used here
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass"; // Use GlassEffect directly
// import { ComponentV2 as EtherealShadowHeroContentWrapper } from "@/components/ui/etheral-shadow-v2"; // Removed
import {
    LayoutDashboard,
    InfinityIcon,
    Zap,
    Settings,
    User,
    LucideIcon // Added for type safety
} from "lucide-react";
import { usePathname } from 'next/navigation'; // For active state
import { cn } from '@/lib/utils'; // For conditional classes

// Interface para os itens de navegação do TopDockNav (similar à do LimelightNav)
interface TopNavItem {
  id: string;
  icon: LucideIcon; // Use LucideIcon type
  label: string;
  href: string;
}

export function TopDockNav() {
    const pathname = usePathname();

    const navItems: TopNavItem[] = [
        {
            id: "dashboard",
            icon: LayoutDashboard,
            label: "Dashboard",
            href: "/dashboard",
        },
        {
            id: "playground",
            icon: InfinityIcon,
            label: "Playground IA",
            href: "/dashboard/ia/playground",
        },
        {
            id: "integrations",
            icon: Zap,
            label: "Integrações",
            href: "/dashboard/integracoes",
        },
        {
            id: "settings",
            icon: Settings,
            label: "Configurações IA",
            href: "/dashboard/ia/settings",
        },
        {
            id: "account",
            icon: User,
            label: "Conta",
            href: "/dashboard/conta",
        },
    ];

    return (
        <>
            <GlassFilter /> 
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-auto py-2 px-4 sm:px-6 lg:px-8 pointer-events-none">
                <GlassEffect 
                    className="rounded-2xl p-2.5 hover:p-3 pointer-events-auto flex items-center shadow-xl"
                    style={{ minHeight: '56px' }} // Ensure a minimum height for the dock
                >
                    <div className="flex items-center justify-between w-full gap-x-2 sm:gap-x-3 mx-auto max-w-fit"> 
                        {/* Logo e Nome */}
                        <div className="flex items-center flex-shrink-0 pr-1 sm:pr-2">
                            <Link href="/dashboard" className="flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-300 rounded-md py-1">
                                <Image
                                    src="/nuvemx.png"
                                    alt="NuvemX Logo"
                                    width={36}
                                    height={36}
                                    priority
                                    className="object-contain"
                                />
                                <span className="font-bold text-xl text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">NuvemX.AI</span>
                            </Link>
                        </div>

                        {/* Navigation Icons with App-like Containers - CORRECTED BLOCK */}
                        <div className="flex items-center gap-x-1.5 sm:gap-x-2">
                            {navItems.map(item => {
                                const IconComponent = item.icon;
                                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        title={item.label}
                                        className={cn(
                                            "relative transition-transform duration-700 ease-in-out transform rounded-full group",
                                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-opacity-75",
                                            isActive ? "scale-105" : "hover:scale-110"
                                        )}
                                        style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)" }}
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-700",
                                                "backdrop-blur-xl border border-white/20 shadow-lg"
                                            )}
                                            style={{ 
                                                backgroundColor: '#565656', // Cor específica solicitada
                                                transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)" 
                                            }}
                                        >
                                            <IconComponent
                                                className={cn(
                                                    "w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200",
                                                    "text-white"
                                                )}
                                                strokeWidth={isActive ? 2.2 : 2}
                                            />
                                        </div>
                                        {isActive && (
                                            <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Avatar do Usuário */}
                        <div className="flex items-center flex-shrink-0 pl-1 sm:pl-2">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8 sm:w-9 sm:h-9 shadow-md", 
                                        userButtonTrigger: "focus:outline-none focus-visible:ring-0",
                                    }
                                }}
                            />
                        </div>
                    </div>
                </GlassEffect>
            </header>
        </>
    );
} 