"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SignInButton, SignedIn, SignedOut, UserButton, SignUpButton } from '@clerk/nextjs';
import { ListChecks, Waypoints, MessageSquare, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavBar } from '@/components/ui/tubelight-navbar'; // Ajuste o caminho se necessário
import { MagnetizeButton } from '@/app/components/ui/magnetize-button'; // <<< ADICIONAR IMPORTAÇÃO

const navItems = [
    { name: 'Funcionalidades', url: '/#features', icon: ListChecks },
    { name: 'Como Funciona', url: '/#como-funciona', icon: Waypoints },
    { name: 'Planos', url: '/planos', icon: MessageSquare },
    { name: 'Ajuda', url: '/#ajuda', icon: HelpCircle },
  ];

export default function FullNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const iconSize = isScrolled ? 48 : 52;

  const LogoComponent = (
    <Link 
      href="/" 
      aria-label="Página Inicial NuvemX.AI" 
      className={cn(
        "flex items-center gap-1 group transition-all duration-300 ease-in-out",
      )}
    >
      <Image
        src="/nuvemx.png" // Confirme se este caminho está correto a partir desta nova localização
        alt="NuvemX.AI Logo"
        width={iconSize}
        height={iconSize}
        className="object-contain transition-all duration-300 ease-in-out"
      />
      <span className="text-2xl font-bold text-white">
        NuvemX.AI
      </span>
    </Link>
  );

  const AuthButtonsComponent = (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "justify-center lg:w-auto px-3 cursor-pointer",
              "text-white bg-transparent border-white/30 hover:bg-white/10 hover:border-white/50",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}>
            Entrar
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <MagnetizeButton 
            className={cn(
              "bg-[#ffffff] text-[#171717]", 
              "border border-neutral-300", 
              "hover:bg-neutral-100", 
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "h-9 rounded-md", 
              "px-3"
            )}
          >
            Participar
          </MagnetizeButton>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: { width: "1.5rem", height: "1.5rem" },
            },
          }}
        />
        <Link href="/dashboard" passHref>
          <Button variant="default" size="sm" className={cn(
             "ml-2 cursor-pointer",
             "bg-white/20 hover:bg-white/30 text-white"
          )}>
            Ir para o app
          </Button>
        </Link>
      </SignedIn>
    </div>
  );

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out",
        "px-0 sm:px-6 lg:px-8",
        isScrolled ? "pt-2" : "pt-4 sm:pt-6"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-300 ease-in-out backdrop-blur-sm",
          isScrolled
            ? "w-auto justify-center bg-gradient-to-r from-black/[.20] via-black/[.65] via-35% to-black/[.80] rounded-full py-1 px-2"
            : "w-full max-w-7xl justify-between bg-gradient-to-r from-black/[.20] via-black/[.65] via-35% to-black/[.80] rounded-full py-1 px-4"
        )}>
          {!isScrolled && LogoComponent}
          
          <NavBar 
            items={navItems} 
            isScrolled={isScrolled}
            logoComponent={isScrolled ? LogoComponent : null}
            authButtonsComponent={isScrolled ? AuthButtonsComponent : null}
            hasWhiteBackground={false}
            className={!isScrolled ? "mx-auto" : "w-full"}
          />

          {!isScrolled && AuthButtonsComponent}
        </div>
    </header>
  );
} 