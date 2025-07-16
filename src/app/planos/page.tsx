"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { PricingTab } from "@/components/ui/pricing-tab";
import { PricingCard, type PricingTier } from "@/components/ui/pricing-card";
import { BlurFade } from "@/app/components/magicui/blur-fade";
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";
import FullNavbar from '@/app/components/layout/FullNavbar';
import Footer from '@/app/components/layout/Footer';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';
import { useAutoCheckout } from '@/hooks/usePlanRedirect';
import { toast } from 'sonner';

const PAYMENT_FREQUENCIES = ["monthly", "yearly"] as const;
type PaymentFrequency = typeof PAYMENT_FREQUENCIES[number];

const TIERS: PricingTier[] = [
  {
    name: "Core",
    planId: "core",
    price: {
      monthly: "GRÁTIS",
      yearly: "GRÁTIS",
    },
    description: "Para testar e pequenos negócios",
    features: [
      "500 mensagens/mês",
      "1 integração WhatsApp", 
      "IA básica para atendimento",
      "Consulta de pedidos e produtos",
      "Playground para testes"
    ],
    cta: "Começar Grátis",
  },
  {
    name: "Neural",
    planId: "neural",
    price: {
      monthly: 100,
      yearly: 960, // R$80/mês * 12 = R$960 anual (20% desconto)
    },
    description: "Para negócios em crescimento",
    features: [
      "5.000 mensagens/mês",
      "Configuração personalizada da IA",
      "Analytics básicos", 
      "Rastreamento de envios",
      "Suporte por chat"
    ],
    cta: "Obtenha o Neural",
    popular: true
  },
  {
    name: "Nimbus",
    planId: "nimbus",
    price: {
      monthly: 200,
      yearly: 1920, // R$160/mês * 12 = R$1920 anual (20% desconto)
    },
    description: "Para empresas estabelecidas",
    features: [
      "15.000 mensagens/mês",
      "Analytics avançados",
      "Histórico completo de conversas", 
      "Suporte prioritário",
      "API de integração"
    ],
    cta: "Obtenha Nimbus",
    highlighted: true
  }
];

function AutoCheckoutHandler() {
  useAutoCheckout();
  return null;
}

function PlanosContent() {
  const [selectedFrequency, setSelectedFrequency] = useState<PaymentFrequency>(PAYMENT_FREQUENCIES[0]);
  const { createCheckoutSession } = useSubscription();

  useEffect(() => {
    const handleAutoCheckout = async (event: Event) => {
      console.log('[PlanosPage] Evento autoCheckout recebido:', event);
      
      const customEvent = event as CustomEvent;
      const { planId, billingCycle } = customEvent.detail;
      
      console.log('[PlanosPage] Dados do evento:', { planId, billingCycle });
      
      try {
        toast.loading('Iniciando checkout...', { id: 'auto-checkout' });
        
        // Definir a frequência correta baseada no plano selecionado
        setSelectedFrequency(billingCycle);
        console.log('[PlanosPage] Frequência definida para:', billingCycle);
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(async () => {
          try {
            console.log('[PlanosPage] Criando sessão de checkout...');
            const checkoutUrl = await createCheckoutSession(planId, billingCycle);
            console.log('[PlanosPage] URL de checkout criada:', checkoutUrl);
            
            toast.success('Redirecionando para o checkout...', { id: 'auto-checkout' });
            window.location.href = checkoutUrl;
          } catch (error) {
            console.error('[PlanosPage] Erro ao criar checkout:', error);
            toast.error('Erro ao iniciar checkout. Tente novamente.', { id: 'auto-checkout' });
          }
        }, 500);
        
      } catch (error) {
        console.error('[PlanosPage] Erro geral no auto-checkout:', error);
        toast.error('Erro ao processar auto-checkout', { id: 'auto-checkout' });
      }
    };

    console.log('[PlanosPage] Registrando listener para autoCheckout');
    window.addEventListener('autoCheckout', handleAutoCheckout);
    
    return () => {
      console.log('[PlanosPage] Removendo listener para autoCheckout');
      window.removeEventListener('autoCheckout', handleAutoCheckout);
    };
  }, [createCheckoutSession]);

  return (
    <>
      <FullNavbar />
      
      <Suspense fallback={null}>
        <AutoCheckoutHandler />
      </Suspense>
      
      <EtherealShadow 
        className="min-h-screen"
        animation={{ scale: 8.0, speed: 25 }}
        noise={{ opacity: 0.3, scale: 0.7 }}
        fullWidthChildren={true}
      >
        <div className="min-h-screen pt-32 pb-12 px-4 bg-black/25">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <BlurFade delay={0.1} inView>
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-light mb-4 text-white">
                  Preços
                </h1>
                <p className="text-lg text-white/90 font-light">
                  Escolha o plano que funciona para você
                </p>
              </div>
            </BlurFade>

            {/* Toggle Pricing */}
            <BlurFade delay={0.15} inView>
              <div className="flex items-center justify-center mb-16">
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 shadow-lg">
                  {PAYMENT_FREQUENCIES.map((freq) => (
                    <PricingTab
                      key={freq}
                      text={freq === "monthly" ? "MENSAL" : "ANUAL"}
                      selected={selectedFrequency === freq}
                      setSelected={() => setSelectedFrequency(freq)}
                      discount={freq === "yearly"}
                    />
                  ))}
                </div>
              </div>
            </BlurFade>

            {/* Pricing Cards */}
            <BlurFade delay={0.2} inView>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {TIERS.map((tier) => (
                  <PricingCard
                    key={tier.name}
                    tier={tier}
                    paymentFrequency={selectedFrequency}
                  />
                ))}
              </div>
            </BlurFade>

          </div>
        </div>
      </EtherealShadow>
      
      <Footer />
    </>
  );
}

export default function PlanosPage() {
  return (
    <SubscriptionProvider>
      <PlanosContent />
    </SubscriptionProvider>
  );
} 