'use client'
import Link from 'next/link'
import Image from 'next/image' // Adicionado Image
import { Menu, X } from 'lucide-react' // Removido Cloud, LogIn, UserPlus
import { Button } from '@/app/components/ui/button' 
import React from 'react'
import { cn } from '@/lib/utils' 
import { SignInButton, SignedIn, SignedOut, UserButton, SignUpButton } from '@clerk/nextjs' 
import { TypingAnimation } from "@/components/magicui/typing-animation";

// Itens de menu para NuvemX.AI
const menuItemsNuvemX = [
    { name: 'Início', href: '/' },
    { name: 'Funcionalidades', href: '/#features' },
    { name: 'Como Funciona', href: '/#como-funciona' },
    { name: 'Depoimentos', href: '/#depoimentos' },
    // { name: 'Preços', href: '/#precos' }, 
];

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50); 
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const iconSize = isScrolled ? 40 : 48; // Further increased logo size

    return (
        <header className="fixed top-0 z-50 w-full px-2 transition-all duration-300 ease-in-out lg:px-0">
            <nav
                data-state={menuState ? 'active' : 'inactive'} 
                className="w-full"
            >
                {/* Container que aplica o efeito de encolhimento e background no scroll */}
                <div className={cn(
                    'mx-auto mt-2 rounded-xl px-4 transition-all duration-300 ease-in-out sm:px-6 lg:px-6', 
                    isScrolled 
                        ? 'max-w-4xl bg-white/95 py-2.5 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95 border border-slate-200' 
                        : 'max-w-7xl border-transparent bg-transparent py-4' 
                )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0">
                        {/* Secção do Logo e botão de menu mobile */}
                        <div className="flex w-full items-center justify-between lg:w-auto">
                            {/* Link da Logo com o componente Image */}
                            <Link
                                href="/"
                                aria-label="Página Inicial NuvemX.AI"
                                className="flex items-center gap-2 group" // Adicionado gap-2 e group
                            >
                                <Image
                                  src="/nuvemx.png"
                                  alt="NuvemX.AI Logo"
                                  width={iconSize}
                                  height={iconSize}
                                  className="object-contain transition-all duration-300 ease-in-out"
                                />
                                <TypingAnimation
                                  as="span"
                                  className={cn(
                                    "font-semibold group-hover:text-[var(--primary)] transition-colors dark:text-neutral-100 dark:group-hover:text-[var(--primary)]",
                                    isScrolled ? "text-lg text-[#171717]" : "text-xl text-white"
                                  )}
                                >
                                  NuvemX.AI
                                </TypingAnimation>
                            </Link>

                            {/* Botão para abrir/fechar menu mobile */}
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Fechar Menu' : 'Abrir Menu'}
                                className="relative z-20 -m-2.5 block cursor-pointer p-2.5 text-slate-700 dark:text-slate-300 lg:hidden"
                            >
                                <Menu className={cn("m-auto size-6 duration-200", menuState ? "rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
                                <X className={cn("absolute inset-0 m-auto size-6 duration-200", menuState ? "rotate-0 scale-100 opacity-100" : "-rotate-180 scale-0 opacity-0")} />
                            </button>
                        </div>

                        {/* Container do Menu (Desktop centralizado, Mobile dropdown) */}
                        <div className={cn(
                            "absolute inset-x-0 top-full mt-2 origin-top rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 transition-all duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/40 lg:static lg:mt-0 lg:flex lg:w-auto lg:flex-1 lg:items-center lg:justify-center lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none",
                            menuState 
                                ? "opacity-100 scale-100" 
                                : "pointer-events-none scale-95 opacity-0 lg:pointer-events-auto lg:scale-100 lg:opacity-100"
                        )}>
                            <ul className={cn(
                                "flex flex-col gap-y-4 dark:text-slate-100 lg:flex-row lg:items-center lg:justify-center lg:gap-x-6 lg:text-sm lg:font-medium",
                                isScrolled ? "text-[#171717]" : "text-white"
                            )}>
                                {menuItemsNuvemX.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMenuState(false)} 
                                            className="block duration-150 hover:text-[var(--primary)] dark:hover:text-[var(--primary)] px-1 py-1" 
                                        >
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Container dos Botões de Autenticação (Clerk) */}
                        <div className={cn(
                            "mt-6 w-full flex-col items-center gap-2 lg:mt-0 lg:flex lg:w-fit lg:flex-row lg:items-center", 
                            menuState ? "flex items-center" : "hidden lg:flex" 
                        )}>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="outline" size="sm" className="w-full justify-center text-[#171717] dark:text-slate-300 dark:border-neutral-700 lg:w-auto px-3 cursor-pointer">
                                        Entrar
                                    </Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button variant="default" size="sm" className="w-full justify-center lg:w-auto px-3 bg-[#171717] hover:bg-[#171717]/90">
                                        Inscrever-se
                                    </Button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: {
                                                width: "1.5rem",  // 24px
                                                height: "1.5rem", // 24px
                                            },
                                        },
                                    }}
                                />
                                <Link href="/dashboard" passHref>
                                    <Button variant="default" size="sm" className="ml-2 cursor-pointer">
                                        Ir para o aplicativo
                                    </Button>
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
