"use client";

import React, { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Check, Zap, MessageSquare, Settings, BarChart3 } from 'lucide-react';
import { LiquidGlassCard } from "@/app/components/ui/LiquidGlassCard";
import { BlurFade } from "@/app/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

export default function PlanosPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Core",
      price: "GRÁTIS",
      description: "Para testar e pequenos negócios",
      features: [
        "500 mensagens/mês",
        "1 integração WhatsApp",
        "IA básica para atendimento",
        "Consulta de pedidos e produtos",
        "Playground para testes"
      ],
      buttonText: "Plano Atual",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Neural",
      price: isAnnual ? "R$39" : "R$49",
      originalPrice: isAnnual ? "R$588" : null,
      description: "Para negócios em crescimento",
      features: [
        "5.000 mensagens/mês",
        "Configuração personalizada da IA",
        "Analytics básicos",
        "Rastreamento de envios",
        "Suporte por chat"
      ],
      buttonText: "Upgrade para Neural",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Nimbus",
      price: isAnnual ? "R$80" : "R$100",
      originalPrice: isAnnual ? "R$1.200" : null,
      description: "Para empresas estabelecidas",
      features: [
        "15.000 mensagens/mês",
        "Analytics avançados",
        "Histórico completo de conversas",
        "Suporte prioritário",
        "API de integração"
      ],
      buttonText: "Upgrade para Nimbus",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

  const benefits = [
    {
      icon: MessageSquare,
      title: "IA Integrada ao WhatsApp",
      description: "Respostas automáticas para seus clientes"
    },
    {
      icon: Settings,
      title: "Consulta Shopify em Tempo Real",
      description: "Pedidos, produtos e rastreamento instantâneo"
    },
    {
      icon: BarChart3,
      title: "Dashboard com Métricas",
      description: "Acompanhe mensagens e desempenho"
    },
    {
      icon: Zap,
      title: "Configuração Simples",
      description: "Conecte suas contas em minutos"
    }
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              PREÇOS SIMPLES E TRANSPARENTES
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Escolha o plano ideal para você. Todos os planos incluem 7 dias de teste grátis!
            </p>

            {/* Toggle Mensal/Anual */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={cn("text-sm font-medium", !isAnnual ? "text-white" : "text-white/60")}>
                MENSAL
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  isAnnual ? "bg-gradient-to-r from-yellow-400 to-orange-500" : "bg-white/20"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    isAnnual ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span className={cn("text-sm font-medium", isAnnual ? "text-white" : "text-white/60")}>
                ANUAL
              </span>
              {isAnnual && (
                <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ECONOMIZE 20%
                </span>
              )}
            </div>
          </div>
        </BlurFade>

        {/* Cards dos Planos */}
        <BlurFade delay={0.2} inView>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan) => (
              <div key={plan.name} className="relative">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      MAIS POPULAR
                    </span>
                  </div>
                )}
                
                <LiquidGlassCard className={cn(
                  "h-full p-8 relative",
                  plan.popular && "ring-2 ring-gradient-to-r from-yellow-400 to-orange-500"
                )}>
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-2xl" />
                  )}
                  
                  <div className="relative z-10">
                    {/* Header do Card */}
                    <div className="text-center mb-8">
                      <h3 className="text-white/80 text-lg font-medium mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-white">
                          {plan.price}
                        </span>
                        {plan.price !== "GRÁTIS" && (
                          <span className="text-white/60 text-sm">/mês</span>
                        )}
                        {plan.originalPrice && (
                          <div className="text-white/50 text-sm line-through">
                            {plan.originalPrice}/ano
                          </div>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <Check className={cn(
                            "h-5 w-5 flex-shrink-0",
                            plan.popular ? "text-yellow-400" : "text-green-400"
                          )} />
                          <span className="text-white/90 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <Button 
                      className={cn(
                        "w-full h-12 font-semibold text-sm",
                        plan.popular 
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black"
                          : plan.buttonVariant === "outline"
                          ? "bg-white/10 hover:bg-white/20 text-white border border-white/30"
                          : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
                      )}
                      variant={plan.buttonVariant}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </LiquidGlassCard>
              </div>
            ))}
          </div>
        </BlurFade>

        {/* Seção de Benefícios */}
        <BlurFade delay={0.3} inView>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Por que escolher o NuvemX.AI?
            </h2>
            <p className="text-white/70 text-lg">
              Simplifique seu atendimento e aumente suas vendas
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <LiquidGlassCard key={index} className="p-6 text-center">
                <benefit.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/70 text-sm">
                  {benefit.description}
                </p>
              </LiquidGlassCard>
            ))}
          </div>
        </BlurFade>
      </div>
    </div>
  );
} 