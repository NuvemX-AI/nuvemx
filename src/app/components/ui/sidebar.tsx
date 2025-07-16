"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";
import {
    LayoutDashboard,
    Bot,
    MessageSquare,
    BarChart2,
    Settings,
    Zap,
    LifeBuoy,
    ChevronDown,
    Infinity,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Verifique este caminho
import { Separator } from '@/app/components/ui/separator'; // Verifique este caminho
import { ModeToggle } from "@/app/components/mode-toggle"; // Importar ModeToggle
import Image from 'next/image'; // Adicionado
import { ComponentV2 as EtherealShadowHeroContentWrapper } from "@/components/ui/etheral-shadow-v2"; // Added import

// Interface para os links, incluindo subItens opcionais
interface SidebarLink {
  label: string;
  href?: string; // Opcional para itens pais que não são links diretos
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subItems?: SidebarLink[];
  isParent?: boolean; // Para identificar itens que controlam submenus
}

const sidebarLinks: SidebarLink[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { 
        label: "IA", 
        icon: Infinity,
        isParent: true,
        subItems: [
            { label: "Playground", href: "/dashboard/ia/playground", icon: MessageSquare },
            { label: "Funções", href: "/dashboard/ia/funcoes", icon: Bot },
            { label: "Configurações", href: "/dashboard/ia/settings", icon: Settings },
        ]
    },
    { label: "Integrações", href: "/dashboard/integracoes", icon: Zap },
    { label: "Conversas", href: "/dashboard/conversas", icon: MessageSquare }, // Considere mudar este ícone se MessageSquare for repetitivo
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
    // Adicione mais links aqui para testar a rolagem, se necessário:
    // { label: "Link Extra 1", href: "/link1", icon: Zap },
    // { label: "Link Extra 2", href: "/link2", icon: Zap },
    // { label: "Link Extra 3", href: "/link3", icon: Zap },
];

// Links inferiores da sidebar
const bottomLinks = [
     { label: "Configurações", href: "/dashboard/settings", icon: Settings },
     { label: "Ajuda & Suporte", href: "/suporte", icon: LifeBuoy },
]

// Componente da Sidebar
// Esta versão visa garantir que a secção do meio (links principais)
// ocupe o espaço vertical disponível e seja rolável.
export function SessionNavBar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null); // Estado para controlar o menu expandido

  const toggleMenu = (label: string) => {
    if (expandedMenu === label) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(label);
    }
  };

  // A largura é agora controlada pelo div pai no DashboardLayout
  // const sidebarWidth = "w-60"; 
  // const dashboardHeaderSpacerHeight = "h-[56px]"; // Este espaçador não é mais necessário aqui

  return (
    <aside className={cn(
      "flex flex-col h-full relative", // Added relative
      "border-r border-slate-200/50 dark:border-neutral-800/50", // Kept subtle border
      "overflow-hidden" // Added overflow-hidden
      // Removed bg-white dark:bg-neutral-900
    )}>
      <EtherealShadowHeroContentWrapper
        className="absolute inset-0 w-full h-full" // Fills aside
        animation={{ scale: 5, speed: 60 }}      // From features.tsx
        noise={{ opacity: 0.05, scale: 0.7 }}    // From features.tsx
      >
        {/* This new div wraps ALL original content and sits on top */}
        <div className="relative z-10 flex flex-col h-full bg-transparent"> 
          {/* 1. Logo NuvemX no topo da Sidebar - Imagem e Texto */}
          <Link href="/" className="flex items-center justify-start gap-2 px-4 py-3 border-b border-black/10 dark:border-white/10 h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 rounded-t-md">
            <Image
              src="/nuvemx.png"
              alt="Logo NuvemX"
              width={48}
              height={48}
              priority
              className="object-contain"
            />
            <span className="text-lg font-semibold text-[#171717] dark:text-neutral-100">NuvemX.AI</span>
          </Link>

          {/* 2. Secção de Links Principais (rolável) */}
          <div className={cn("flex-1 overflow-y-auto min-h-0")}>
            <nav className="flex flex-col gap-1 px-4 py-4">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                
                if (link.isParent && link.subItems) {
                  const isOpen = expandedMenu === link.label;
                  // Check if any subitem is active to apply active styles to parent
                  const isAnySubItemActive = link.subItems.some(subItem => subItem.href ? pathname === subItem.href || pathname.startsWith(subItem.href) : false);

                  return (
                    <div key={link.label}>
                      <button
                        onClick={() => toggleMenu(link.label)}
                        className={cn(
                          "flex items-center justify-between w-full gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                          isAnySubItemActive // If a sub-item is active, parent gets active style
                            ? "bg-[#3D3D3D] dark:bg-neutral-700 text-white dark:text-neutral-50 font-semibold" 
                            : "text-[#171717] dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span>{link.label}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
                      </button>
                      {isOpen && (
                        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-black/10 dark:border-white/10 pl-3">
                          {link.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubItemActive = subItem.href ? pathname === subItem.href || pathname.startsWith(subItem.href) : false;
                            return (
                              <Link
                                key={subItem.label}
                                href={subItem.href || "#"}
                                className={cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                  isSubItemActive 
                                    ? "bg-[#3D3D3D] dark:bg-neutral-700 text-white dark:text-neutral-50 font-semibold" 
                                    : "text-[#171717] dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                                )}
                              >
                                <SubIcon className="h-4 w-4" />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Lógica original para links não-pais
                const isActive = pathname === link.href || (link.href && link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href || "#"} // Adicionado fallback para href
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-[#3D3D3D] dark:bg-neutral-700 text-white dark:text-neutral-50 font-semibold" 
                        : "text-[#171717] dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 3. Secção Inferior Fixa */}
          <div className={cn("flex-shrink-0 border-t border-black/10 dark:border-white/10 px-4 py-4")}>
             <nav className="flex flex-col gap-1">
               {bottomLinks.map((link) => {
                 const Icon = link.icon;
                 const isActive = pathname.startsWith(link.href);
                 return (
                   <Link
                     key={link.label}
                     href={link.href}
                     className={cn(
                       "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                       isActive 
                         ? "bg-[#3D3D3D] dark:bg-neutral-700 text-white dark:text-neutral-50 font-semibold" 
                         : "text-[#171717] dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                     )}
                   >
                     <Icon className="h-4 w-4" />
                     <span>{link.label}</span>
                   </Link>
                 );
               })}
             </nav>
             <Separator className="my-2 bg-black/10 dark:bg-white/10" />
             {/* Perfil do Usuário (Avatar Manual + Nome Manual) e ModeToggle */}
             <div className="flex items-center justify-between gap-3 py-1"> 
               {/* Container para Avatar Manual + Nome Manual */}
               <div className="flex items-center gap-2 group cursor-pointer rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                 {/* UserButton apenas para avatar, com wrapper para indicador */}
                 <div className="relative">
                   <UserButton
                      afterSignOutUrl="/"
                      showName={false} 
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9", 
                          userButtonTrigger: "focus:outline-none focus-visible:ring-0",
                        }
                      }}
                   />
                   {/* Indicador de status online */}
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900">
                   </div>
                 </div>
                 {/* Nome do usuário renderizado manualmente */}
                 <span className="text-sm font-medium text-[#171717] dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white truncate">
                   {user?.fullName || "NuvemX"} 
                 </span>
               </div>
               <ModeToggle />
             </div>
          </div>
        </div>
      </EtherealShadowHeroContentWrapper>
    </aside>
  );
}