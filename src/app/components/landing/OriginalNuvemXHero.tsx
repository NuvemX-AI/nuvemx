import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { TextEffect } from '@/app/components/ui/text-effect'; 
import { AnimatedGroup } from '@/app/components/ui/animated-group'; 
import { Cover } from '@/components/ui/cover';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import dynamic from "next/dynamic";

const ClientOnlyAuthButtons = dynamic(() => import("./ClientOnlyAuthButtons"), { ssr: false });

const transitionVariants = {
    item: {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
        visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { type: 'spring' as const, bounce: 0.3, duration: 1.5 } },
    },
    container: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } } 
};

export default function OriginalNuvemXHero() {
    return (
        <section className="relative pb-16 md:pb-24">
            <div className="mx-auto max-w-7xl px-6 pt-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:pt-36">
                <div className="text-center">
                    <AnimatedGroup variants={transitionVariants}>
                        <Link
                            href="/#features"
                            className="bg-[#f4f4f4] hover:bg-[#ffffff] dark:hover:border-t-border group mx-auto flex w-fit items-center gap-3 rounded-full p-1 pl-4 shadow-sm transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                        >
                            <AnimatedShinyText className="text-[#171717] dark:text-slate-300 text-sm font-medium">
                                NuvemX.AI: Automatize seu WhatsApp
                            </AnimatedShinyText>
                            <span className="dark:border-background block h-4 w-0.5 border-l border-l-[#e4e4e7] bg-[#ffffff] dark:bg-zinc-700 transition-colors duration-300"></span>
                            <div className="bg-[#ffffff] group-hover:bg-[#f4f4f4] size-6 overflow-hidden rounded-full duration-500">
                                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                    <span className="flex size-6 items-center justify-center">
                                        <ArrowRight className="text-[#171717] size-3" />
                                    </span>
                                    <span className="flex size-6 items-center justify-center">
                                        <ArrowRight className="text-[#171717] size-3" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </AnimatedGroup>
                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#171717] sm:text-5xl md:text-6xl lg:mt-10 xl:text-[4.5rem]">
                        Eleve o Atendimento da
                        <br />
                        <span className="whitespace-nowrap">
                            Sua Loja no{" "}
                            <Cover className="inline-block rounded-lg">
                               WhatsApp com IA
                            </Cover>
                        </span>
                    </h1>
                    <TextEffect
                        per="line"
                        preset="fade-in-blur"
                        speedSegment={0.3}
                        delay={0.5}
                        as="p"
                        className="mx-auto mt-6 max-w-2xl text-balance text-lg text-[#6c757d] dark:text-[#6c757d]"
                    >
                        Nossa Inteligência Artificial responde clientes em tempo real e impulsiona vendas na sua loja Shopify, 24 horas por dia, 7 dias por semana.
                    </TextEffect>
                    <AnimatedGroup
                        variants={transitionVariants}
                        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <ClientOnlyAuthButtons />
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-slate-300 dark:border-slate-700 text-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg px-8 py-3 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                        >
                            <Link href="/#como-funciona">
                                Ver Demonstração
                            </Link>
                        </Button>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    );
} 