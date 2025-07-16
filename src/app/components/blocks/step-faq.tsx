'use client';

import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { GradientHeading }  from "@/components/ui/gradient-heading";
import { ChevronRight, Zap, Shuffle, CheckCircle } from 'lucide-react';
import { SilkBackground } from '@/app/components/ui/silk-background';
import Link from 'next/link';
import Footer from '@/app/components/layout/Footer';
// Importar LiquidGlassCard
import { LiquidGlassCard } from "@/app/components/ui/LiquidGlassCard";

const steps = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Conecte seu WhatsApp",
    description: "Integre seu número do WhatsApp Business de forma segura e rápida.",
  },
  {
    icon: <Shuffle className="w-6 h-6" />,
    title: "Personalize a IA",
    description: "Ensine sua IA sobre seus produtos, serviços e tom de voz da sua marca.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Ative e Relaxe",
    description: "Deixe nossa IA cuidar do atendimento enquanto você foca no crescimento do seu negócio.",
  },
];

const faqItems = [
  {
    question: "O que é o NuvemX.AI?",
    answer:
      "NuvemX.AI é uma plataforma de inteligência artificial projetada para otimizar o atendimento ao cliente, automatizar respostas e personalizar interações em canais como WhatsApp, integrada a diversas ferramentas de e-commerce e CRM.",
  },
  {
    question: "Como funciona a integração com o Shopify?",
    answer:
      "Nossa integração com o Shopify permite que a IA acesse informações de produtos, pedidos e clientes em tempo real, fornecendo respostas precisas e contextuais sobre o status do pedido, detalhes do produto e muito mais, diretamente no chat.",
  },
  {
    question: "Preciso de conhecimentos técnicos para usar?",
    answer:
      "Não! A plataforma NuvemX.AI é projetada para ser intuitiva e fácil de usar. A configuração inicial é guiada e não requer habilidades de programação. Nosso AI Playground também é user-friendly para treinar e personalizar sua IA.",
  },
  {
    question: "O NuvemX.AI substitui o atendimento humano?",
    answer:
      "O NuvemX.AI visa potencializar o atendimento humano, não substituí-lo completamente. Ele pode lidar com uma grande volume de perguntas frequentes e tarefas rotineiras, liberando sua equipe para focar em questões mais complexas e estratégicas, além de garantir atendimento 24/7.",
  },
];

export default function StepFaqSection() {
  return (
    <div className="min-h-screen relative overflow-hidden"> 
        <div 
          className="absolute inset-x-0 top-0 w-full h-[300vh] overflow-hidden -z-10"
        >
            <SilkBackground 
                className="w-full h-full"
                speed={0.01}
                noiseIntensity={0.5}
            />
        </div>
        
        <div className="relative z-10">
            <section id="step-process" className="pt-12 md:pt-16 pb-6 md:pb-8 bg-transparent">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-12">
                  <GradientHeading className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
                    Comece em Apenas 3 Passos Simples
                  </GradientHeading>
                  <p className="md:text-lg max-w-2xl mx-auto text-[#484848]">
                    Configurar o NuvemX.AI é rápido e fácil. Veja como:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
                  {steps.map((step, index) => (
                    <LiquidGlassCard
                      key={index}
                      className="p-6 flex flex-col items-center text-center transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="relative z-[1]"> 
                        <div 
                          className="rounded-full p-3 mb-4 inline-flex items-center justify-center bg-white/20 text-white ring-1 ring-inset ring-white/30"
                        >
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                        <p className="text-sm flex-grow mb-4 text-white/80">{step.description}</p>
                        <div 
                          className="mt-4 text-xs px-2 py-1 rounded font-medium bg-white/20 text-white"
                        >
                          Passo {index + 1}
                        </div>
                      </div>
                    </LiquidGlassCard>
                  ))}
                </div>

                <div className="text-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group" asChild>
                    <Link href="/dashboard">
                      Experimentar Agora
                      <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            <section id="faq" className="pt-6 md:pt-8 pb-12 md:pb-16 bg-transparent">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-12">
                  <GradientHeading className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
                    Perguntas Frequentes
                  </GradientHeading>
                  <p className="md:text-lg max-w-xl mx-auto text-[#484848]">
                    Encontre respostas para as dúvidas mais comuns sobre o NuvemX.AI.
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto space-y-3">
                  {faqItems.map((item, index) => (
                    <LiquidGlassCard key={index} className="px-5">
                      <AccordionItem 
                        value={`item-${index + 1}`} 
                        className="border-b-0 last:border-b-0"
                      >
                        <AccordionTrigger className="text-left hover:no-underline text-white text-base font-medium">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/80 text-sm pt-1 pb-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </LiquidGlassCard>
                  ))}
                </Accordion>
              </div>
            </section>
            <Footer /> 
        </div>
    </div>
  );
} 