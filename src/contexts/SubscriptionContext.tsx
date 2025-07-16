"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface SubscriptionData {
  id: string;
  clerk_user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  planType: 'core' | 'neural' | 'neural_annual' | 'nimbus' | 'nimbus_annual';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string | null;
  current_period_end: string | null;
  monthly_message_limit: number;
  messages_used_current_month: number;
  last_usage_reset: string | null;
  created_at: string;
  updated_at: string;
}

interface UsageData {
  whatsapp_messages: number;
  ai_interactions: number;
  product_sync: number;
  api_calls: number;
  total_actions: number;
  limit_reached: boolean;
  usage_percentage: number;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  usage: UsageData | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (planType: string, billingCycle: 'monthly' | 'yearly') => Promise<string>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, getToken } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado.");

      // Buscar dados da assinatura
      const subscriptionResponse = await fetch('/api/stripe/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!subscriptionResponse.ok) {
        // Tenta ler a resposta de erro do backend para um diagnóstico mais claro.
        const errorData = await subscriptionResponse.json().catch(() => null);
        const backendMessage = errorData?.error || `Status: ${subscriptionResponse.status}`;
        throw new Error(`Falha na API ao buscar assinatura: ${backendMessage}`);
      }

      const subscriptionData = await subscriptionResponse.json();
      setSubscription(subscriptionData);

      // Buscar dados de uso
      try {
        const usageResponse = await fetch('/api/usage/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!usageResponse.ok) {
          console.warn('[SubscriptionContext] Falha ao buscar dados de uso, usando valores padrão');
          // Define um valor padrão para usage se falhar
          setUsage({
            whatsapp_messages: 0,
            ai_interactions: 0,
            product_sync: 0,
            api_calls: 0,
            total_actions: 0,
            limit_reached: false,
            usage_percentage: 0
          });
        } else {
          const usageData = await usageResponse.json();
          
          // Mapear os dados da API para o formato esperado pelo UsageData
          setUsage({
            whatsapp_messages: usageData.breakdown?.whatsapp_messages || 0,
            ai_interactions: usageData.breakdown?.ai_interactions || 0,
            product_sync: usageData.breakdown?.product_sync || 0,
            api_calls: usageData.breakdown?.api_calls || 0,
            total_actions: usageData.currentUsage || subscriptionData.messages_used_current_month || 0,
            limit_reached: usageData.percentageUsed >= 100,
            usage_percentage: usageData.percentageUsed || 0
          });
        }
      } catch (usageError) {
        console.warn('[SubscriptionContext] Erro ao buscar uso, usando valores padrão:', usageError);
        // Define um valor padrão para usage se falhar
        setUsage({
          whatsapp_messages: 0,
          ai_interactions: 0,
          product_sync: 0,
          api_calls: 0,
          total_actions: 0,
          limit_reached: false,
          usage_percentage: 0
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      console.error('[SubscriptionContext] Erro detalhado:', err);
      setError(errorMessage);
      
      // Define valores padrão mesmo quando há erro na assinatura
      setUsage({
        whatsapp_messages: 0,
        ai_interactions: 0,
        product_sync: 0,
        api_calls: 0,
        total_actions: 0,
        limit_reached: false,
        usage_percentage: 0
      });
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  const createCheckoutSession = async (planType: string, billingCycle: 'monthly' | 'yearly'): Promise<string> => {
    console.log('[SubscriptionContext] createCheckoutSession chamado:', { planType, billingCycle, userId });
    
    if (!userId) throw new Error('Usuário não autenticado');
    const token = await getToken();
    if (!token) throw new Error("Token de autenticação não encontrado.");

    const actualPlanType = billingCycle === 'yearly' ? `${planType}_annual` : planType;
    console.log('[SubscriptionContext] Tipo de plano processado:', actualPlanType);

    const requestBody = {
      planType: actualPlanType,
      successUrl: `${window.location.origin}/dashboard?success=true`,
      cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
    };
    
    console.log('[SubscriptionContext] Enviando requisição para:', '/api/stripe/create-checkout-session');
    console.log('[SubscriptionContext] Body da requisição:', requestBody);
    console.log('[SubscriptionContext] Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[SubscriptionContext] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        // Tentar ler o erro do backend
        let errorMessage = 'Erro ao criar sessão de checkout';
        try {
          const errorData = await response.json();
          console.log('[SubscriptionContext] Dados de erro do backend:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('[SubscriptionContext] Não foi possível parsear erro do backend:', parseError);
          
          // Tentar ler como texto
          try {
            const errorText = await response.text();
            console.log('[SubscriptionContext] Resposta de erro como texto:', errorText);
          } catch (textError) {
            console.log('[SubscriptionContext] Erro ao ler resposta como texto:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[SubscriptionContext] Dados de sucesso:', data);
      return data.url;
    } catch (fetchError) {
      console.error('[SubscriptionContext] Erro na requisição fetch:', fetchError);
      throw fetchError;
    }
  };

  const openCustomerPortal = async () => {
    if (!userId) throw new Error('Usuário não autenticado');
    const token = await getToken();
    if (!token) throw new Error("Token de autenticação não encontrado.");

    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao abrir portal do cliente');
    }

    const data = await response.json();
    window.location.href = data.url;
  };

  const refreshSubscription = async () => {
    await fetchSubscriptionData();
  };

  useEffect(() => {
    if (userId) {
      fetchSubscriptionData();
    }
  }, [userId, fetchSubscriptionData]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        loading,
        error,
        refreshSubscription,
        createCheckoutSession,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Exportar as configurações dos planos para uso em outros componentes
export const planConfigs = {
  core: { name: 'Core', price: 0, limit: 500, features: ['1 integração WhatsApp', 'IA básica', 'Consulta pedidos/produtos'] },
  neural: { name: 'Neural', price: 100, limit: 5000, features: ['5.000 mensagens/mês', 'Configuração personalizada IA', 'Analytics básicos'] },
  neural_annual: { name: 'Neural Anual', price: 960, limit: 5000, features: ['5.000 mensagens/mês', 'Configuração personalizada IA', 'Analytics básicos'] },
  nimbus: { name: 'Nimbus', price: 200, limit: 15000, features: ['15.000 mensagens/mês', 'Analytics avançados', 'Histórico completo'] },
  nimbus_annual: { name: 'Nimbus Anual', price: 1920, limit: 15000, features: ['15.000 mensagens/mês', 'Analytics avançados', 'Histórico completo'] }
}; 