"use client";

import React, { useEffect, useState } from 'react';
import { TopDockNav } from '@/app/components/ui/TopDockNav';
import { HelpdeskWidget } from '@/app/components/ui/HelpdeskWidget';
// import { useSidebar } from '@/app/contexts/SidebarContext'; // Removido pois a sidebar foi substituída
import { cn } from "@/lib/utils";
import { Toaster } from "@/app/components/ui/sonner"; // Corrigido o caminho da importação
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
// Remover importações de Vercel Analytics/Speed Insights por enquanto
// import Script from 'next/script'; 
// import { Analytics } from "@vercel/analytics/react"
// import { SpeedInsights } from "@vercel/speed-insights/next"

// Defina um tipo para as props do DashboardLayout, se necessário
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // const { isOpen, setIsOpen } = useSidebar(); // Removido
  const [isMounted, setIsMounted] = useState(false);

  // Efeito para montar o componente apenas no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Se não estiver montado, não renderize nada (ou um loader)
  if (!isMounted) {
    return null; // Ou <SomeLoaderComponent />
  }

  // Ajuste de lógica para o layout, se a sidebar não for mais usada para abrir/fechar
  // const mainContentMarginClass = isOpen ? "lg:ml-60" : "lg:ml-16"; // Lógica antiga da sidebar

  return (
    <SubscriptionProvider>
      {/* Scripts do Google Analytics podem ser mantidos se você os usa e NEXT_PUBLIC_GOOGLE_ANALYTICS está definido 
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script strategy="lazyOnload" id="ga-script">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      */}
      {/* <Analytics /> */}
      {/* <SpeedInsights /> */}

      {/* TopDockNav permanece como está, acima da área de conteúdo principal */}
      <TopDockNav />

      {/* EtherealShadow como contêiner principal do layout e provedor de fundo */}
      <EtherealShadow
        className={cn(
          "flex-1 flex flex-col", // EtherealShadow ocupa o espaço principal
          "min-h-0",             // Para cálculo correto de flex-1
          "overflow-hidden"      // Remove scroll do layout principal
        )}
        animation={{ scale: 4, speed: 40 }}
        noise={{ opacity: 0.03, scale: 0.6 }}
        fullWidthChildren={true}
      >
        {/* Este div interno agora lida com o padding para a TopDockNav */}
        <div className="flex flex-col text-left w-full pt-20">
          {children}
        </div>
      </EtherealShadow>
      
      {/* Widget de Helpdesk - Flutuante no canto inferior direito */}
      <HelpdeskWidget />
      
      <Toaster />
    </SubscriptionProvider>
  );
}
