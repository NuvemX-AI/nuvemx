import React from 'react';
import { NuvemxLogo } from '@/app/components/logos/NuvemxLogo';
import { ComponentV2 as EtherealShadowHeroContentWrapper } from "@/components/ui/etheral-shadow-v2";
import { TypingAnimation } from '@/components/magicui/typing-animation';
import Link from 'next/link';

const links = [
    {
        title: 'Funcionalidades',
        href: '#',
    },
    {
        title: 'Integrações',
        href: '#',
    },
    {
        title: 'Preços',
        href: '#',
    },
    {
        title: 'Suporte',
        href: '#',
    },
    {
        title: 'Blog',
        href: '#',
    },
    {
        title: 'Sobre',
        href: '#',
    },
];

const Footer = () => {
  return (
    <footer className="relative">
      {/* Novo EtherealShadowHeroContentWrapper para o efeito de fundo, igual ao da seção features */}
      <EtherealShadowHeroContentWrapper
        className="absolute inset-0 -z-10" // Camada de FUNDO BASE - removido arredondamento
        animation={{ scale: 1, speed: 0 }} // Animação do fundo parada
        noise={{ opacity: 0, scale: 0 }}   // SEM ruído nesta camada
        color="#1A1A1A" // Cor base escura para o fundo
      />
      {/* Nova camada EtherealShadowHeroContentWrapper APENAS PARA O RUÍDO, por cima */}
      <EtherealShadowHeroContentWrapper
        className="absolute inset-0 z-20 pointer-events-none" // Camada de RUÍDO POR CIMA - removido arredondamento
        animation={{ scale: 1, speed: 0 }} // Animação parada
        noise={{ opacity: 0.25, scale: 0.375 }} // Ruído reduzido novamente pela metade
        color="transparent" // Fundo transparente para apenas o ruído aparecer
      />
      
      {/* Div de conteúdo COM bg-black/20 e COM backdrop-blur-sm para o efeito da imagem 2 */}
      <div 
        className="pt-8 md:pt-12 pb-6 md:pb-8 relative bg-black/20 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link
              href="/"
              aria-label="Página inicial"
              className="block">
              <NuvemxLogo className="h-8 w-auto" />
            </Link>
            <TypingAnimation
              className="text-2xl font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]"
              duration={50}
            >
              NuvemX.AI
            </TypingAnimation>
          </div>

          <div className="my-6 flex flex-wrap justify-center gap-6 text-sm">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-white hover:text-white/80 block duration-150">
                <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">{link.title}</span>
              </Link>
            ))}
          </div>

          <div className="my-6 flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X/Twitter"
              className="text-white hover:text-white/80 block [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]">
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"></path>
              </svg>
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white hover:text-white/80 block [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]">
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"></path>
              </svg>
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white hover:text-white/80 block [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]">
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"></path>
              </svg>
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-white/80 block [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]">
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path>
              </svg>
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-white hover:text-white/80 block [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]">
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48"></path>
              </svg>
            </Link>
          </div>

          <span className="text-white block text-center text-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
            © {new Date().getFullYear()} NuvemX.AI • Todos os direitos reservados
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 