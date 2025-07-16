import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
// import { SignInButton, SignedIn, SignedOut, UserButton, SignUpButton } from '@clerk/nextjs' // Removed
// import { Cloud, LogIn, UserPlus } from 'lucide-react' // Adicionado LogIn e UserPlus // Removed
import { ptBR } from '@clerk/localizations'
import { Inter as FontSans } from 'next/font/google'
import '@/app/globals.css'
// import Link from 'next/link' // Removed
import { ThemeProvider } from "@/app/components/theme-provider"
import PageLayout from '@/app/components/layout/page-layout'; // Importar o novo PageLayout
// import GlobalBackgroundAnimation from '@/app/components/layout/GlobalBackgroundAnimation'; // Importar o novo componente de animação // Removed as it's commented out below
// import ClientOnly from "@/app/components/layout/ClientOnly"; // Importar ClientOnly // Removed as it's commented out below
import { Toaster } from "@/app/components/ui/sonner";
import { WhatsAppProvider } from "@/contexts/WhatsAppContext"; // <<< ADICIONAR IMPORTAÇÃO
import GlobalQrModal from '@/app/components/layout/GlobalQrModal'; // <<< IMPORTAR O NOVO MODAL GLOBAL
import PlanRedirectHandler from '@/app/components/layout/PlanRedirectHandler'; // <<< ADICIONAR IMPORTAÇÃO
// import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { TwentyFirstToolbar } from '@21st-extension/toolbar-next';
import { ReactPlugin } from '@21st-extension/react';
// import { ComponentV2 as EtherealShadowHeroContentWrapper } from "@/components/ui/etheral-shadow-v2";
// EtherealShadow removido pois não está sendo usado neste layout

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NuvemX.AI | Automatize seu WhatsApp com IA', // Título mais descritivo
  description: 'Conecte o WhatsApp da sua loja Shopify e deixe nossa IA responder seus clientes 24/7. Teste grátis por 7 dias!', // Descrição mais completa
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const toolbarConfig = {
    plugins: [ReactPlugin]
  };

  const clerkAppearance = {
    elements: {
      // button__signIn: cn( // << COMENTANDO
      //   "justify-center lg:w-auto px-3 cursor-pointer",
      //   "text-white bg-transparent border-white/30 hover:bg-white/10 hover:border-white/50",
      //   "focus-visible:ring-0 focus-visible:ring-offset-0", 
      //   "text-sm font-medium"
      // ),
      // button__signUp: cn( // << COMENTANDO
      //   "w-full justify-center lg:w-auto px-3",
      //   "text-white bg-white/10 border-transparent hover:bg-white/20",
      //   "focus-visible:ring-0 focus-visible:ring-offset-0",
      //   "text-sm font-medium"
      // ),
    }
  };

  return (
    <ClerkProvider localization={ptBR} appearance={clerkAppearance}>
      <html lang="pt" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            "bg-background",
            fontSans.variable
          )}
        >
          {/* REMOVE EtherealShadowHeroContentWrapper instance from here */}
          {/* 
          <EtherealShadowHeroContentWrapper
            className="pointer-events-none fixed inset-0 -z-1"
            animation={{ scale: 5, speed: 60 }}
            noise={{ opacity: 0.05, scale: 0.7 }}
          />
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WhatsAppProvider>
              {/* Este div principal agora é transparente, o body tem o bg-background */}
              <div className={cn(
                "min-h-screen flex flex-col relative z-0",
                "bg-transparent"
              )}>
                <PageLayout>{children}</PageLayout>
              </div>
              <Toaster />
              <GlobalQrModal />
              <PlanRedirectHandler />
              {process.env.NODE_ENV === 'development' && <TwentyFirstToolbar config={toolbarConfig} />}
            </WhatsAppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
