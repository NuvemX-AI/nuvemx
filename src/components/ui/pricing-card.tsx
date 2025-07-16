"use client"

import React, { useState } from "react"
import { Check, ArrowRight, Loader2 } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import { LiquidGlassCard } from "@/app/components/ui/LiquidGlassCard"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export interface PricingTier {
  name: string
  planId: 'core' | 'neural' | 'nimbus';
  price: Record<string, number | string>
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  popular?: boolean
}

interface PricingCardProps {
  tier: PricingTier
  paymentFrequency: 'monthly' | 'yearly';
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency];
  const isHighlighted = tier.highlighted;
  const isPopular = tier.popular;
  const router = useRouter();
  const { userId } = useAuth();

  const { createCheckoutSession } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleCtaClick = async () => {
    console.log('[PricingCard] Botão clicado para plano:', tier.planId, 'frequência:', paymentFrequency);
    
    if (tier.planId === 'core') {
      console.log('[PricingCard] Plano Core, redirecionando para sign-up');
      router.push('/sign-up');
      return;
    }

    // Se o usuário não está logado, armazenar a seleção do plano e redirecionar para login
    if (!userId) {
      console.log('[PricingCard] Usuário não logado, salvando plano no storage');
      
      // Armazenar dados do plano selecionado no sessionStorage e localStorage
      const selectedPlan = {
        planId: tier.planId,
        billingCycle: paymentFrequency,
        timestamp: Date.now()
      };
      
      console.log('[PricingCard] Dados do plano a serem salvos:', selectedPlan);
      
      // Salvar em ambos os storages para garantir persistência
      const planJson = JSON.stringify(selectedPlan);
      sessionStorage.setItem('selectedPlan', planJson);
      localStorage.setItem('selectedPlan', planJson);
      
      // Verificar se foi salvo corretamente
      const savedSession = sessionStorage.getItem('selectedPlan');
      const savedLocal = localStorage.getItem('selectedPlan');
      console.log('[PricingCard] Plano salvo no sessionStorage:', savedSession);
      console.log('[PricingCard] Plano salvo no localStorage:', savedLocal);
      
      // Redirecionar para página de cadastro com parâmetro do plano
      const redirectUrl = `/sign-up?plan=${tier.planId}&billing=${paymentFrequency}`;
      console.log('[PricingCard] Redirecionando para:', redirectUrl);
      router.push(redirectUrl);
      return;
    }

    console.log('[PricingCard] Usuário logado, prosseguindo com checkout direto');
    
    // Usuário está logado, prosseguir com o checkout
    setIsLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession(tier.planId, paymentFrequency);
      window.location.href = checkoutUrl;
    } catch (error) {
      toast.error("Não foi possível iniciar o checkout. Tente novamente.");
      console.error("Checkout Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-[#171717] text-white text-xs font-medium px-3 py-1 rounded-full">
            MAIS POPULAR
          </div>
        </div>
      )}
      
      <LiquidGlassCard
        className={cn(
          "h-full p-8 relative border transition-all duration-300 backdrop-blur-xl flex flex-col",
          isPopular 
            ? "border-white/30 bg-black/40" 
            : isHighlighted
            ? "border-white/25 bg-black/35"
            : "border-white/20 bg-black/30"
        )}
      >
        <h3 className="text-xl font-light mb-2 text-white/95">{tier.name}</h3>
        
        <div className="mb-6">
          {typeof price === "number" ? (
            <div className="flex items-baseline">
              <span className="text-sm text-white/70 font-light">R$</span>
              <NumberFlow
                value={paymentFrequency === 'yearly' ? Math.round(price / 12) : price}
                className="text-4xl font-light text-white ml-1"
              />
              <span className="text-sm text-white/50 font-light ml-1">/mês</span>
            </div>
          ) : (
            <div className="text-4xl font-light text-white">{price}</div>
          )}
          {paymentFrequency === 'yearly' && typeof price === 'number' && (
            <p className="text-sm text-green-400 font-medium mt-2">
              Cobrado R${price.toLocaleString('pt-BR')} anualmente
            </p>
          )}
        </div>

        <p className="text-white/75 text-sm mb-8 font-light">{tier.description}</p>

        <div className="space-y-3 mb-8 flex-1">
          {tier.features.map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-3">
              <Check className="h-4 w-4 text-white/70 flex-shrink-0" />
              <span className="text-white/85 text-sm font-light">{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleCtaClick}
          disabled={isLoading}
          className={cn(
            "w-full h-12 font-medium rounded-xl transition-all duration-300 bg-[#171717] hover:bg-[#252525] text-white border-0"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {!userId && tier.planId !== 'core' ? 'Criar Conta e Assinar' : tier.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </LiquidGlassCard>
    </div>
  )
} 