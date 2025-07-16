"use client"

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface SelectedPlan {
  planId: 'neural' | 'nimbus';
  billingCycle: 'monthly' | 'yearly';
  timestamp: number;
}

export const usePlanRedirect = () => {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[usePlanRedirect] Hook executado', { userId, isLoaded });
    
    if (!isLoaded) {
      console.log('[usePlanRedirect] Auth ainda não carregado');
      return;
    }
    
    if (!userId) {
      console.log('[usePlanRedirect] Usuário não está logado');
      return;
    }

    // Aguardar um pouco para garantir que tudo esteja carregado
    const timer = setTimeout(() => {
      console.log('[usePlanRedirect] Usuário logado, verificando sessionStorage...');

      // Verificar se há um plano selecionado no sessionStorage
      const selectedPlanStr = sessionStorage.getItem('selectedPlan');
      console.log('[usePlanRedirect] selectedPlan do sessionStorage:', selectedPlanStr);
      
      if (!selectedPlanStr) {
        // Também verificar localStorage como fallback
        const localStoragePlan = localStorage.getItem('selectedPlan');
        console.log('[usePlanRedirect] Verificando localStorage como fallback:', localStoragePlan);
        
        if (!localStoragePlan) {
          console.log('[usePlanRedirect] Nenhum plano selecionado encontrado');
          return;
        }
        
        // Mover do localStorage para sessionStorage
        sessionStorage.setItem('selectedPlan', localStoragePlan);
        localStorage.removeItem('selectedPlan');
      }

      try {
        const finalPlanStr = sessionStorage.getItem('selectedPlan');
        if (!finalPlanStr) return;

        const selectedPlan: SelectedPlan = JSON.parse(finalPlanStr);
        console.log('[usePlanRedirect] Plano parseado:', selectedPlan);
        
        // Verificar se o timestamp não é muito antigo (máximo 2 horas para dar mais margem)
        const twoHours = 2 * 60 * 60 * 1000;
        const timeDiff = Date.now() - selectedPlan.timestamp;
        console.log('[usePlanRedirect] Diferença de tempo:', timeDiff, 'ms (limite:', twoHours, 'ms)');
        
        if (timeDiff > twoHours) {
          console.log('[usePlanRedirect] Plano expirado, removendo do sessionStorage');
          sessionStorage.removeItem('selectedPlan');
          localStorage.removeItem('selectedPlan');
          return;
        }

        // Remover o plano do sessionStorage
        sessionStorage.removeItem('selectedPlan');
        localStorage.removeItem('selectedPlan');
        console.log('[usePlanRedirect] Plano removido do storage, iniciando redirecionamento...');

        // Mostrar toast informativo
        toast.success(`Redirecionando para o checkout do plano ${selectedPlan.planId.charAt(0).toUpperCase() + selectedPlan.planId.slice(1)}...`);

        // Aguardar um pouco antes do redirecionamento para garantir que o toast seja exibido
        setTimeout(() => {
          // Redirecionar para a página de planos com parâmetros para trigger automático do checkout
          const params = new URLSearchParams();
          params.set('autoCheckout', 'true');
          params.set('plan', selectedPlan.planId);
          params.set('billing', selectedPlan.billingCycle);
          
          const redirectUrl = `/planos?${params.toString()}`;
          console.log('[usePlanRedirect] Redirecionando para:', redirectUrl);
          
          router.push(redirectUrl);
        }, 1000);

      } catch (error) {
        console.error('[usePlanRedirect] Erro ao processar plano selecionado:', error);
        sessionStorage.removeItem('selectedPlan');
        localStorage.removeItem('selectedPlan');
      }
    }, 1000); // Aguardar 1 segundo após o login

    return () => clearTimeout(timer);
  }, [userId, isLoaded, router]);
};

export const useAutoCheckout = () => {
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    console.log('[useAutoCheckout] Hook executado', { userId, isLoaded });
    
    if (!isLoaded || !userId) {
      console.log('[useAutoCheckout] Auth não carregado ou usuário não logado');
      return;
    }

    const autoCheckout = searchParams.get('autoCheckout');
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');

    console.log('[useAutoCheckout] Parâmetros URL:', { autoCheckout, plan, billing });

    if (autoCheckout === 'true' && plan && billing) {
      console.log('[useAutoCheckout] Disparando evento autoCheckout...');
      
      // Aguardar um pouco para garantir que a página esteja carregada
      setTimeout(() => {
        // Trigger automático do checkout
        const event = new CustomEvent('autoCheckout', {
          detail: {
            planId: plan,
            billingCycle: billing
          }
        });
        window.dispatchEvent(event);

        // Limpar os parâmetros da URL
        const newUrl = window.location.pathname;
        console.log('[useAutoCheckout] Limpando URL para:', newUrl);
        window.history.replaceState({}, '', newUrl);
      }, 500);
    }
  }, [searchParams, userId, isLoaded]);
}; 