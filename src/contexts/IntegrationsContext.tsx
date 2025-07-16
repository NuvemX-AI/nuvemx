"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';

interface ShopifyStatus {
  connected: boolean;
  shop: string | null;
}

interface IntegrationsContextType {
  isOpenAIConfigured: boolean;
  shopifyStatus: ShopifyStatus;
  isLoadingIntegrations: boolean;
  integrationsError: string | null;
  checkIntegrationsStatus: () => Promise<void>;
  areIntegrationsReady: boolean;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus>({ connected: false, shop: null });
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  const [integrationsError, setIntegrationsError] = useState<string | null>(null);
  
  const { user } = useUser();
  const { getToken } = useAuth();

  const checkIntegrationsStatus = useCallback(async () => {
    if (!user) {
      setIsLoadingIntegrations(false);
      return;
    }
    
    setIsLoadingIntegrations(true);
    setIntegrationsError(null);
    
    try {
      const token = await getToken();
      
      // Verificar OpenAI
      const openAIResponse = await fetch('/api/openai/config/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (openAIResponse.ok) {
        const openAIData = await openAIResponse.json();
        setIsOpenAIConfigured(openAIData.configured);
      } else {
        setIsOpenAIConfigured(false);
      }
      
      // Verificar Shopify
      const shopifyResponse = await fetch('/api/shopify/session/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json();
        setShopifyStatus(shopifyData);
      } else {
        setShopifyStatus({ connected: false, shop: null });
      }
      
    } catch (error) {
      console.error("Erro ao verificar status das integrações:", error);
      setIntegrationsError("Erro ao verificar integrações. Tente novamente.");
      setIsOpenAIConfigured(false);
      setShopifyStatus({ connected: false, shop: null });
    } finally {
      setIsLoadingIntegrations(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    checkIntegrationsStatus();
  }, [checkIntegrationsStatus]);

  const areIntegrationsReady = isOpenAIConfigured && shopifyStatus.connected;

  const value: IntegrationsContextType = {
    isOpenAIConfigured,
    shopifyStatus,
    isLoadingIntegrations,
    integrationsError,
    checkIntegrationsStatus,
    areIntegrationsReady,
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
} 