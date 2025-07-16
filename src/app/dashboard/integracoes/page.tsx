"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import WhatsAppConnectionManager from '@/app/components/dashboard/integrations/WhatsAppConnectionManager';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { LiquidGlassCard } from '@/app/components/ui/LiquidGlassCard';
import { WhatsAppIcon } from '@/app/components/logos/WhatsAppIcon';
import { ShopifyIcon } from '@/app/components/logos/ShopifyIcon';
import { OpenAiIcon } from '@/app/components/logos/OpenAiIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Smartphone, Link2, PowerOff, AlertTriangle, KeyRound, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/app/components/ui/spinner";
import OpenAIConfigModal from "@/app/components/dashboard/integrations/OpenAIConfigModal";
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";
import { TopDockNav } from "@/app/components/ui/TopDockNav";

const LS_SHOPIFY_STATUS = "nuvemx_shopify_status";
const LS_OPENAI_STATUS = "nuvemx_openai_status";

interface ShopifyStatus {
  connected: boolean;
  shop: string | null;
}

interface OpenAIStatus {
  configured: boolean;
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}> 
      <IntegrationsPageContent />
    </Suspense>
  );
}

function IntegrationsPageContent() {
  // LOG PARA DIAGNÓSTICO
  // console.log('[IntegrationsPage] process.env.NODE_ENV:', process.env.NODE_ENV);
  // console.log('[IntegrationsPage] NEXT_PUBLIC_BACKEND_API_URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL);

  const { userId, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkCurrentWhatsAppStatus } = useWhatsApp();
  
  const [isWhatsAppConfigModalOpen, setIsWhatsAppConfigModalOpen] = useState(false);
  const [isOpenAIModalOpen, setIsOpenAIModalOpen] = useState(false);
  const [isOpenAIManageModalOpen, setIsOpenAIManageModalOpen] = useState(false);
  const [isDisconnectingOpenAI, setIsDisconnectingOpenAI] = useState(false);

  const [isShopifyConnectModalOpen, setIsShopifyConnectModalOpen] = useState(false);
  const [shopifyShopName, setShopifyShopName] = useState('');
  const [isConnectingShopify, setIsConnectingShopify] = useState(false);
  const [shopifyError, setShopifyError] = useState('');
  // const [shopifySuccessMessage, setShopifySuccessMessage] = useState(''); // Removed

  // const [isShopifyConnected, setIsShopifyConnected] = useState(false); // Commented out, setter is used, variable is not read
  const [connectedShopName, setConnectedShopName] = useState('');
  const [isShopifyManageModalOpen, setIsShopifyManageModalOpen] = useState(false);

  // Estados para OpenAI
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);
  const [isLoadingOpenAIStatus, setIsLoadingOpenAIStatus] = useState(true);

  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [isLoadingShopifyStatus, setIsLoadingShopifyStatus] = useState(true);
  const [isDisconnectingShopify, setIsDisconnectingShopify] = useState(false);

  const fetchShopifyStatus = useCallback(async () => {
    if (!userId) {
      // Se não houver userId, definir status como não conectado e parar o loading.
      setShopifyStatus({ connected: false, shop: null });
      // setIsShopifyConnected(false); // Setter for unread state
      setConnectedShopName('');
      localStorage.setItem(LS_SHOPIFY_STATUS, JSON.stringify({ connected: false, shop: null }));
      sessionStorage.removeItem('currentShopifyStore');
      setIsLoadingShopifyStatus(false);
      return;
    }
    setIsLoadingShopifyStatus(true);
    try {
      const token = await getToken();
      if (!token) {
        console.error('[IntegrationsPage] Token do Clerk não obtido em fetchShopifyStatus.');
        setShopifyStatus({ connected: false, shop: null });
        // setIsShopifyConnected(false); // Setter for unread state
        setConnectedShopName('');
        localStorage.setItem(LS_SHOPIFY_STATUS, JSON.stringify({ connected: false, shop: null }));
        sessionStorage.removeItem('currentShopifyStore');
        toast.error('Sessão inválida. Por favor, recarregue a página ou faça login novamente.');
        setIsLoadingShopifyStatus(false); // ESSENCIAL
        return; // Não prosseguir com o fetch
      }
      const response = await fetch('/api/shopify/session/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setShopifyStatus(data);
        // setIsShopifyConnected(data.connected); // Setter for unread state
        setConnectedShopName(data.shop || '');
        localStorage.setItem(LS_SHOPIFY_STATUS, JSON.stringify(data));
        if (data.connected && data.shop) {
          sessionStorage.setItem('currentShopifyStore', data.shop);
        } else {
          sessionStorage.removeItem('currentShopifyStore');
        }
      } else {
        const responseText = await response.text();
        const defaultErrorState = { connected: false, shop: null };
        setShopifyStatus(defaultErrorState);
        // setIsShopifyConnected(false); // Setter for unread state
        setConnectedShopName('');
        localStorage.setItem(LS_SHOPIFY_STATUS, JSON.stringify(defaultErrorState));
        sessionStorage.removeItem('currentShopifyStore');
        
        let detailedErrorMessage = `Erro ${response.status} ao verificar status da Shopify.`;
        if (responseText.toLowerCase().includes("unauthenticated")) {
          detailedErrorMessage = `Erro ${response.status}: Não autenticado ao verificar Shopify.`;
          console.error('[IntegrationsPage] Erro de autenticação ao verificar status da Shopify:', response.status, responseText);
        } else {
          try {
              const errorJson = JSON.parse(responseText);
              detailedErrorMessage = errorJson.message || errorJson.error || `Erro ${response.status}: ${responseText.substring(0,100)}...`;
              console.error('[IntegrationsPage] Erro (JSON) ao verificar status da Shopify:', response.status, responseText);
          } catch {
              detailedErrorMessage = `Erro ${response.status}. Resposta: ${responseText.substring(0,100)}...`;
              console.error('[IntegrationsPage] Erro (não-JSON/HTML) ao verificar status da Shopify:', response.status, responseText);
          }
        }
        toast.error(detailedErrorMessage);
      }
    } catch (error) {
      const defaultErrorState = { connected: false, shop: null };
      setShopifyStatus(defaultErrorState);
      // setIsShopifyConnected(false); // Setter for unread state
      setConnectedShopName('');
      localStorage.setItem(LS_SHOPIFY_STATUS, JSON.stringify(defaultErrorState));
      sessionStorage.removeItem('currentShopifyStore');
      console.error('[IntegrationsPage] Erro na chamada fetch para verificar status da Shopify:', error);
      toast.error(`Erro de conexão ao verificar Shopify: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingShopifyStatus(false);
    }
  }, [userId, getToken]);

  const fetchOpenAIStatus = useCallback(async () => {
    if (!userId) {
      // Se não houver userId, definir status como não configurado e parar o loading.
      setIsOpenAIConfigured(false);
      localStorage.setItem(LS_OPENAI_STATUS, JSON.stringify({ configured: false }));
      setIsLoadingOpenAIStatus(false);
      return;
    }
    setIsLoadingOpenAIStatus(true);
    try {
      const token = await getToken();
      if (!token) {
        console.error('[IntegrationsPage] Token do Clerk não obtido em fetchOpenAIStatus.');
        setIsOpenAIConfigured(false);
        localStorage.setItem(LS_OPENAI_STATUS, JSON.stringify({ configured: false }));
        toast.error('Sessão inválida. Por favor, recarregue a página ou faça login novamente.');
        setIsLoadingOpenAIStatus(false); // ESSENCIAL
        return; // Não prosseguir com o fetch
      }
      const response = await fetch('/api/openai/config/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const responseText = await response.text(); 
        let errorMessage = `Erro ${response.status}`; 

        if (responseText.toLowerCase().includes("unauthenticated")) {
            errorMessage = `Erro ${response.status}: Não autenticado ao buscar status OpenAI.`;
            console.error('[IntegrationsPage] Erro de autenticação ao buscar status da OpenAI:', response.status, responseText);
        } else {
            try {
                const errorData = JSON.parse(responseText); 
                errorMessage = errorData.message || errorData.error || `Erro ${response.status}: ${responseText.substring(0,100)}...`;
            } catch {
                errorMessage = `Erro ${response.status}. Resposta do servidor: ${responseText.substring(0, 200)}...`;
                console.error('[IntegrationsPage] Falha ao buscar status da OpenAI (resposta não-JSON ou HTML):', response.status, responseText);
            }
        }
        toast.error(errorMessage); 
        setIsOpenAIConfigured(false);
        localStorage.setItem(LS_OPENAI_STATUS, JSON.stringify({ configured: false }));
        throw new Error(errorMessage); 
      }
      const data: OpenAIStatus = await response.json();
      setIsOpenAIConfigured(data.configured);
      localStorage.setItem(LS_OPENAI_STATUS, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao buscar status da OpenAI:", error);
      setIsOpenAIConfigured(false);
      localStorage.setItem(LS_OPENAI_STATUS, JSON.stringify({ configured: false }));
      if (!(error instanceof Error && error.message.startsWith("Erro "))) { 
          toast.error(`Erro ao buscar status da OpenAI: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsLoadingOpenAIStatus(false);
    }
  }, [userId, getToken]);

  useEffect(() => {
    if (userId) {
      fetchShopifyStatus();
      fetchOpenAIStatus();
      // Verificar status do WhatsApp quando a página carregar
      checkCurrentWhatsAppStatus(false);

      // Tenta carregar o status do localStorage inicialmente para evitar piscar
      const storedShopify = localStorage.getItem(LS_SHOPIFY_STATUS);
      if (storedShopify) {
        try {
          const parsed = JSON.parse(storedShopify);
          setShopifyStatus(parsed);
          // setIsShopifyConnected(parsed.connected); // Setter for unread state
          setConnectedShopName(parsed.shop || '');
          if (parsed.connected && parsed.shop) {
            sessionStorage.setItem('currentShopifyStore', parsed.shop);
          } else {
            sessionStorage.removeItem('currentShopifyStore');
          }
        } catch { // Removed _e
          console.error("Erro ao parsear LS_SHOPIFY_STATUS"); 
          sessionStorage.removeItem('currentShopifyStore');
        }
      }
      const storedOpenAI = localStorage.getItem(LS_OPENAI_STATUS);
      if (storedOpenAI) {
        try {
          setIsOpenAIConfigured(JSON.parse(storedOpenAI).configured);
        } catch (e) { 
          console.error("Erro ao parsear LS_OPENAI_STATUS", e); 
        }
      }
    }
  }, [userId, fetchShopifyStatus, fetchOpenAIStatus, checkCurrentWhatsAppStatus]);

  // Verificar status do WhatsApp quando a página carregar
  useEffect(() => {
    if (userId) {
      checkCurrentWhatsAppStatus(false);
    }
  }, [userId, checkCurrentWhatsAppStatus]);

  useEffect(() => {
    const shopifyConnectedParam = searchParams.get('shopify_connected');
    const shopNameParam = searchParams.get('shop');
    const shopifyErrorParam = searchParams.get('shopify_error');
    const shopifyMessageParam = searchParams.get('message');

    if (shopifyConnectedParam === 'true' && shopNameParam) {
      toast.success(`Loja Shopify "${shopNameParam}" conectada com sucesso!`);
      fetchShopifyStatus();
      router.replace('/dashboard/integracoes', undefined);
    } else if (shopifyErrorParam === 'true') {
      toast.error(shopifyMessageParam || 'Ocorreu um erro ao tentar conectar com a Shopify.');
      fetchShopifyStatus();
      router.replace('/dashboard/integracoes', undefined);
    }
  }, [searchParams, router, fetchShopifyStatus]);

  const handleShopifyConnect = async () => {
    console.log('[IntegrationsPage] handleShopifyConnect: FUNÇÃO INICIADA');
    setIsConnectingShopify(true);

    try {
      if (!shopifyShopName.trim()) {
        setShopifyError('Por favor, insira o nome da sua loja Shopify.');
        console.log('[IntegrationsPage] handleShopifyConnect: Nome da loja Shopify está vazio.');
        setIsConnectingShopify(false);
        return;
      }
      console.log(`[IntegrationsPage] handleShopifyConnect: Nome da loja Shopify inicial: "${shopifyShopName}"`);

      if (!userId) {
          setShopifyError('Usuário não autenticado. Por favor, faça login novamente.');
          console.log('[IntegrationsPage] handleShopifyConnect: Usuário não autenticado.');
          setIsConnectingShopify(false);
          return;
      }
      setShopifyError('');

      const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      console.log(`[IntegrationsPage] handleShopifyConnect: Valor de process.env.NEXT_PUBLIC_BACKEND_API_URL: "${backendApiUrl}"`);

      if (!backendApiUrl) {
        setShopifyError('A URL do backend não está configurada. Entre em contato com o suporte.');
        console.error('[IntegrationsPage] handleShopifyConnect: ERRO - NEXT_PUBLIC_BACKEND_API_URL não está definida ou é vazia.');
        setIsConnectingShopify(false);
        return;
      }

      // Limpa o nome da loja removendo .myshopify.com e quaisquer caracteres especiais/protocolos
      let cleanedShopName = shopifyShopName.trim();
      cleanedShopName = cleanedShopName.replace(/^(https?:\/\/)/, ''); // Corrected regex
      cleanedShopName = cleanedShopName.split('.')[0]; 
      console.log(`[IntegrationsPage] handleShopifyConnect: Nome da loja Shopify APÓS LIMPEZA: "${cleanedShopName}"`);

      const finalShopName = `${cleanedShopName}.myshopify.com`;
      console.log(`[IntegrationsPage] handleShopifyConnect: Nome da loja Shopify FINAL PARA A URL: "${finalShopName}"`);

      // CONSTRUÇÃO DA URL DE AUTENTICAÇÃO
      const authUrl = `${backendApiUrl}/api/shopify/auth?shop=${encodeURIComponent(finalShopName)}`;
      
      console.log(`[IntegrationsPage] handleShopifyConnect: authUrl construída (com encode): "${authUrl}"`);
      
      if (!finalShopName || finalShopName === '.myshopify.com' || !authUrl.includes("?shop=") || !authUrl.includes(encodeURIComponent(finalShopName))) {
        console.error("[IntegrationsPage] handleShopifyConnect: ERRO DE CONSTRUÇÃO DE URL ou finalShopName inválido. authUrl:", authUrl, "finalShopName:", finalShopName);
        setShopifyError("Nome da loja inválido ou erro ao construir URL. Verifique o nome inserido.");
        setIsConnectingShopify(false);
        return;
      }

      debugger; // Linha de depuração

      if (typeof authUrl === 'string' && authUrl.startsWith('http')) {
        setTimeout(() => {
          console.log('[IntegrationsPage] handleShopifyConnect: EXECUTANDO window.location.href AGORA PARA:', authUrl);
          window.location.href = authUrl;
        }, 500);
      } else {
        console.error('[IntegrationsPage] handleShopifyConnect: ERRO CRÍTICO - authUrl não é uma string HTTP válida:', authUrl);
        setShopifyError('Erro crítico ao tentar redirecionar. authUrl inválida.');
        setIsConnectingShopify(false);
      }
    } catch (error) {
        console.error('[IntegrationsPage] handleShopifyConnect: ERRO INESPERADO NA FUNÇÃO:', error);
        setShopifyError('Ocorreu um erro inesperado. Verifique o console do navegador e tente novamente.');
        setIsConnectingShopify(false);
    }
  };

  const handleShopifyDisconnect = async () => {
    if (!connectedShopName) {
      toast.info("Nenhuma loja Shopify para desconectar.");
      return;
    }
    setIsDisconnectingShopify(true);
    try {
      const response = await fetch('/api/shopify/session/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ shop: connectedShopName }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Loja Shopify "${connectedShopName}" desconectada.`);
        fetchShopifyStatus();
        setIsShopifyManageModalOpen(false);
      } else {
        toast.error(data.message || 'Falha ao desconectar a loja Shopify.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
      toast.error(error.message || 'Erro de comunicação ao tentar desconectar.');
      } else {
        toast.error('Erro de comunicação desconhecido ao tentar desconectar.');
      }
    } finally {
      setIsDisconnectingShopify(false);
    }
  };

  const handleOpenAIConfigSuccess = () => {
    fetchOpenAIStatus();
    setIsOpenAIModalOpen(false);
  };

  const handleOpenAIDisconnect = async () => {
    if (!userId) {
      toast.error("Usuário não autenticado.");
      return;
    }
    setIsDisconnectingOpenAI(true);
    try {
      const response = await fetch('/api/openai/config/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Integração OpenAI desconectada com sucesso!");
        setIsOpenAIConfigured(false);
        localStorage.setItem(LS_OPENAI_STATUS, JSON.stringify({ configured: false }));
        setIsOpenAIManageModalOpen(false);
      } else {
        toast.error(data.message || "Falha ao desconectar a integração OpenAI.");
      }
    } catch (error) {
      console.error("Erro ao desconectar OpenAI:", error);
      toast.error(`Erro de comunicação ao tentar desconectar OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDisconnectingOpenAI(false);
    }
  };

  const handleOpenAIClick = () => {
    if (isOpenAIConfigured) {
      setIsOpenAIManageModalOpen(true);
    } else {
      setIsOpenAIModalOpen(true);
    }
  };
  
  return (
    <>
      <TopDockNav />
      
      <EtherealShadow
        className="fixed inset-0 z-[-1]"
        animation={{ scale: 4, speed: 40 }}
        noise={{ opacity: 0.12, scale: 1.2 }}
        style={{ filter: "blur(120px)" }}
      />
      
      {/* Overlay escuro para as integrações */}
      <div className="fixed inset-0 z-[-1] bg-black/25" />
      
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl -z-10"></div>
          <div className="p-8 relative">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">Integrações</h1>
            <p className="mt-3 text-xl text-white/90 font-medium drop-shadow-md leading-relaxed">
              Conecte e gerencie suas integrações com outras plataformas.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
          {/* Card WhatsApp */}
          <LiquidGlassCard className="flex flex-col items-center text-center p-10 overflow-hidden transition-all duration-200 min-h-[360px] hover:scale-105">
            <div className="flex flex-col items-center flex-1 justify-center mb-8">
              <WhatsAppIcon className="w-20 h-20 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">WhatsApp</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Conecte sua conta WhatsApp para automação de atendimento ao cliente em tempo real.
              </p>
            </div>
            <div className="w-full">
              <Button className="w-full py-3 cursor-pointer bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl font-medium transition-all duration-200" onClick={() => setIsWhatsAppConfigModalOpen(true)}>
                <Smartphone className="mr-2 h-4 w-4" /> Configurar
              </Button>
            </div>
          </LiquidGlassCard>

          {/* Card Shopify */}
          <LiquidGlassCard className="flex flex-col items-center text-center p-10 overflow-hidden transition-all duration-200 min-h-[360px] hover:scale-105">
            <div className="flex flex-col items-center flex-1 justify-center mb-8">
              <ShopifyIcon className="w-20 h-20 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">Shopify</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Integre sua loja Shopify para acesso completo a produtos, pedidos e dados de clientes.
              </p>
            </div>
            <div className="w-full">
              {isLoadingShopifyStatus ? (
                <div className="h-12 w-full flex items-center justify-center"><Spinner variant="infinite" className="h-5 w-5 text-white/60" /></div>
              ) : shopifyStatus?.connected ? (
                <Button className="w-full py-3 cursor-pointer bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30 rounded-xl font-medium transition-all duration-200" onClick={() => setIsShopifyManageModalOpen(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Conectado
                </Button>
              ) : (
                <Button className="w-full py-3 cursor-pointer bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl font-medium transition-all duration-200" onClick={() => setIsShopifyConnectModalOpen(true)}>
                  <Link2 className="mr-2 h-4 w-4" /> Conectar
                </Button>
              )}
            </div>
          </LiquidGlassCard>

          {/* Card OpenAI */}
          <LiquidGlassCard className="flex flex-col items-center text-center p-10 overflow-hidden transition-all duration-200 min-h-[360px] hover:scale-105">
            <div className="flex flex-col items-center flex-1 justify-center mb-8">
              <OpenAiIcon className="w-20 h-20 mb-6 brightness-0 invert" />
              <h3 className="text-xl font-semibold text-white mb-3">OpenAI</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Configure sua chave API da OpenAI para alimentar a inteligência artificial do sistema.
              </p>
            </div>
            <div className="w-full">
              {isLoadingOpenAIStatus ? (
                <div className="h-12 w-full flex items-center justify-center"><Spinner variant="infinite" className="h-5 w-5 text-white/60" /></div>
              ) : (
                <Button 
                  variant="default"
                  className={`w-full py-3 cursor-pointer rounded-xl font-medium transition-all duration-200 ${
                    isOpenAIConfigured 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30' 
                      : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                  }`}
                  onClick={handleOpenAIClick}
                >
                  {isOpenAIConfigured ? (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Configurado</>
                  ) : (
                    <><KeyRound className="mr-2 h-4 w-4" /> Configurar</>
                  )}
                </Button>
              )}
            </div>
          </LiquidGlassCard>
        </div>

                  {/* Modais */}
          <Dialog open={isWhatsAppConfigModalOpen} onOpenChange={setIsWhatsAppConfigModalOpen}>
            <DialogContent className="sm:max-w-lg bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center text-white">
                  <Smartphone className="mr-2 h-6 w-6" /> Conexão WhatsApp
                </DialogTitle>
                <DialogDescription className="pt-1 text-white/70">
                  Gerencie a conexão da sua conta do WhatsApp para automações.
                </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              {isWhatsAppConfigModalOpen && <WhatsAppConnectionManager />}
            </div>
          </DialogContent>
        </Dialog>

                  {/* Modal de Conexão Shopify */}
          <Dialog open={isShopifyConnectModalOpen} onOpenChange={setIsShopifyConnectModalOpen}>
            <DialogContent className="sm:max-w-md bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Conectar Shopify</DialogTitle>
                <DialogDescription className="text-white/70">
                  Insira o nome da sua loja Shopify (ex: nomedaloja.myshopify.com) para conectar.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Input
                id="shopify-shop-name"
                placeholder="nomedaloja.myshopify.com"
                value={shopifyShopName}
                onChange={(e) => {
                  setShopifyShopName(e.target.value);
                  if (shopifyError) setShopifyError('');
                }}
                disabled={isConnectingShopify}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
              />
              {shopifyError && (
                <p className="text-sm text-red-400">{shopifyError}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isConnectingShopify} className="cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={async () => {
                  console.log('[IntegrationsPage] Botão CONECTAR (dentro do modal) CLICADO - chamando handleShopifyConnect...');
                  try {
                    await handleShopifyConnect();
                  } catch (error) {
                    console.error('[IntegrationsPage] Erro INESPERADO ao executar handleShopifyConnect a partir do onClick:', error);
                    setShopifyError('Ocorreu um erro inesperado durante a tentativa de conexão. Verifique o console do navegador e tente novamente.');
                    setIsConnectingShopify(false);
                  }
                }}
                disabled={isConnectingShopify || !shopifyShopName.trim()}
                className="cursor-pointer bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30"
              >
                {isConnectingShopify ? <Spinner variant="infinite" className="mr-2 h-4" /> : null}
                {isConnectingShopify ? 'Conectando...' : 'Conectar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Gerenciamento Shopify */}
        <Dialog open={isShopifyManageModalOpen} onOpenChange={setIsShopifyManageModalOpen}>
          <DialogContent className="sm:max-w-md bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Gerenciar Shopify</DialogTitle>
              <DialogDescription className="text-white/70">
                {shopifyStatus?.connected && connectedShopName ? 
                  `Conectado à loja: ` : 
                  'Nenhuma loja Shopify conectada.'
                }
                {shopifyStatus?.connected && connectedShopName && <strong className="text-green-300">{connectedShopName}</strong>}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              {shopifyStatus?.connected && (
              <Button variant="destructive" onClick={handleShopifyDisconnect} disabled={isDisconnectingShopify} className="cursor-pointer bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30">
                {isDisconnectingShopify ? <Spinner variant="infinite" className="mr-2 h-4"/> : <PowerOff className="mr-2 h-4"/>}
                Desconectar
              </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline" className="cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <OpenAIConfigModal
          isOpen={isOpenAIModalOpen}
          onClose={() => setIsOpenAIModalOpen(false)}
          onSaveSuccess={handleOpenAIConfigSuccess}
          isConfigured={isOpenAIConfigured}
        />

        <Dialog open={isOpenAIManageModalOpen} onOpenChange={setIsOpenAIManageModalOpen}>
          <DialogContent className="bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Gerenciar Integração OpenAI</DialogTitle>
              <DialogDescription className="text-white/70">
                Sua integração com a OpenAI está ativa.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              { isOpenAIConfigured ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-400 h-5 w-5" />
                  <p className="text-sm font-medium text-white">Status: Conectado</p>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-yellow-400 h-5 w-5" />
                  <p className="text-sm font-medium text-white">Status: Não configurado</p>
                </div>
              )}
            </div>
            <DialogFooter>
              {isOpenAIConfigured && (
              <Button 
                variant="destructive" 
                onClick={handleOpenAIDisconnect}
                disabled={isDisconnectingOpenAI}
                className="cursor-pointer bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30"
              >
                {isDisconnectingOpenAI ? <Spinner variant="infinite" className="mr-2 h-4 w-4" /> : <PowerOff className="mr-2 h-4 w-4" />} Desconectar
              </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline" className="cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 