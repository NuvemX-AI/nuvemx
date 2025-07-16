"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { AnimatedAIChat } from "@/app/components/ui/animated-ai-chat";
import { Bot, User, RefreshCw, MessageSquare, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from "@/app/components/ui/spinner";
import { Particles } from "@/app/components/ui/particles";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { LiquidGlassCard } from "@/app/components/ui/LiquidGlassCard";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";
import { TopDockNav } from "@/app/components/ui/TopDockNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  model?: string;
  attachments?: { name: string; type: string }[];
  timestamp?: Date;
}

interface BackendChatMessage {
  id: string;
  clerk_user_id: string;
  session_id: string;
  message_content: string;
  sender_type: 'user' | 'ai';
  channel: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ChatHistorySession {
  sessionId: string;
  lastMessageTimestamp: string;
  lastMessagePreview: string;
  title: string;
}

interface ShopifyPage {
  id: number;
  title: string;
  handle: string;
  body_html: string; 
  shop_id: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  admin_graphql_api_id: string;
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);
  const { theme } = useTheme();
  const [particleColor, setParticleColor] = useState("#000000");
  const { user, isLoaded: isUserLoadedHook, isSignedIn: isUserSignedInHook } = useUser();
  const { getToken, isLoaded: isAuthLoadedHook, isSignedIn: isAuthSignedInHook } = useAuth();
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [aiPlaceholderId, setAiPlaceholderId] = useState<string | null>(null);
  
  // Estados para validação de integrações
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);
  const [shopifyStatus, setShopifyStatus] = useState<{ connected: boolean; shop: string | null }>({ connected: false, shop: null });
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);
  const [integrationsError, setIntegrationsError] = useState<string | null>(null);

  const [iaName, setIaName] = useState('Júlia');
  const [iaStyle, setIaStyle] = useState('amigavel');
  const [iaLanguage, setIaLanguage] = useState('pt-br');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string | null>(null);

  const [chatHistorySessions, setChatHistorySessions] = useState<ChatHistorySession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSpecificChatHistory, setIsLoadingSpecificChatHistory] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [shopifyPages, setShopifyPages] = useState<ShopifyPage[]>([]);

  // Função para verificar status das integrações
  const checkIntegrationsStatus = useCallback(async () => {
    if (!user) return;
    
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
        localStorage.setItem('LS_OPENAI_STATUS', JSON.stringify(openAIData));
      } else {
        setIsOpenAIConfigured(false);
        localStorage.setItem('LS_OPENAI_STATUS', JSON.stringify({ configured: false }));
      }
      
      // Verificar Shopify
      const shopifyResponse = await fetch('/api/shopify/session/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json();
        setShopifyStatus(shopifyData);
        localStorage.setItem('LS_SHOPIFY_STATUS', JSON.stringify(shopifyData));
        if (shopifyData.connected && shopifyData.shop) {
          sessionStorage.setItem('currentShopifyStore', shopifyData.shop);
        } else {
          sessionStorage.removeItem('currentShopifyStore');
        }
      } else {
        setShopifyStatus({ connected: false, shop: null });
        localStorage.setItem('LS_SHOPIFY_STATUS', JSON.stringify({ connected: false, shop: null }));
        sessionStorage.removeItem('currentShopifyStore');
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

  // Carregar status inicial do localStorage
  useEffect(() => {
    if (user) {
      // Carregar do localStorage primeiro para evitar piscar
      const storedShopify = localStorage.getItem('LS_SHOPIFY_STATUS');
      if (storedShopify) {
        try {
          const parsed = JSON.parse(storedShopify);
          setShopifyStatus(parsed);
          if (parsed.connected && parsed.shop) {
            sessionStorage.setItem('currentShopifyStore', parsed.shop);
          } else {
            sessionStorage.removeItem('currentShopifyStore');
          }
        } catch {
          console.error("Erro ao parsear LS_SHOPIFY_STATUS");
          sessionStorage.removeItem('currentShopifyStore');
        }
      }
      
      const storedOpenAI = localStorage.getItem('LS_OPENAI_STATUS');
      if (storedOpenAI) {
        try {
          setIsOpenAIConfigured(JSON.parse(storedOpenAI).configured);
        } catch (e) {
          console.error("Erro ao parsear LS_OPENAI_STATUS", e);
        }
      }
      
      // Depois verificar no servidor
      checkIntegrationsStatus();
    }
  }, [user, checkIntegrationsStatus]);

  useEffect(() => {
    setParticleColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    setChatSessionId(newSessionId);
    setMessages([]);
  }, []); 

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 || aiPlaceholderId) {
      scrollToBottom();
    }
  }, [messages, aiPlaceholderId, scrollToBottom]);

  const fetchChatHistorySessions = useCallback(async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/ia/playground/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao buscar histórico: ${response.statusText}`);
      }
      const sessions: ChatHistorySession[] = await response.json();
      setChatHistorySessions(sessions);
    } catch (error) {
      console.error("Erro ao buscar sessões de histórico:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao carregar histórico.");
      setChatHistorySessions([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, getToken]);

  // Carregar histórico automaticamente quando a página for carregada
  useEffect(() => {
    if (user && isAuthLoadedHook && isUserLoadedHook) {
      fetchChatHistorySessions();
    }
  }, [user, isAuthLoadedHook, isUserLoadedHook, fetchChatHistorySessions]);

  const loadConversationFromHistory = useCallback((historyMessages: ChatMessage[], originalSessionId: string) => {
    const newSessionForLoadedHistory = crypto.randomUUID(); 
    setChatSessionId(newSessionForLoadedHistory);
    console.log(`Conversa do histórico (original session ID: ${originalSessionId}) carregada em nova sessão ID: ${newSessionForLoadedHistory}`);
    setMessages(historyMessages.map(m => ({ ...m, id: crypto.randomUUID() })));
    toast.success("Conversa carregada do histórico!");
  }, []);

  const loadChatSessionAndDisplay = useCallback(async (sessionId: string) => {
    if (!user) return;
    setIsLoadingSpecificChatHistory(sessionId);
    let loadedMessages: ChatMessage[] = [];

    try {
      const token = await getToken();
      const response = await fetch(`/api/ia/playground/history/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 404) {
            toast.info("Nenhuma mensagem encontrada para esta sessão.");
            return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao carregar mensagens da sessão: ${response.statusText}`);
      }
      const backendMessages: BackendChatMessage[] = await response.json();
      loadedMessages = backendMessages.map(bm => ({
        id: bm.id,
        text: bm.message_content,
        sender: bm.sender_type,
        timestamp: new Date(bm.timestamp),
      }));
      
      if (loadedMessages.length > 0) {
        loadConversationFromHistory(loadedMessages, sessionId);
      } else {
        toast.info("Sessão de histórico carregada estava vazia.");
      }

    } catch (error) {
      console.error("Erro ao carregar e exibir mensagens da sessão:", error);
      toast.error(error instanceof Error ? error.message : "Falha ao carregar mensagens da sessão.");
    } finally {
      setIsLoadingSpecificChatHistory(null);
    }
  }, [user, getToken, loadConversationFromHistory]);

  const handleSendMessage = async (
    text: string
  ) => {
    if (!text.trim()) return;

    const currentShopDomain = sessionStorage.getItem('currentShopifyStore');
    if (!currentShopDomain || currentShopDomain.trim() === '') {
      const errorMessage: ChatMessage = {
        id: String(Date.now()) + '-error',
        text: "Erro: Nenhuma loja Shopify está conectada ou selecionada. Por favor, conecte uma loja na página de 'Integrações' antes de usar o chat da IA.",
        sender: 'ai', 
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false); 
      toast.error("Nenhuma loja Shopify conectada. Verifique as Integrações.");
      return; 
    }

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setAiPlaceholderId(String(Date.now()) + '-ai-placeholder');

    let errorResponseMessage = "Falha ao enviar mensagem.";
    let errorData: unknown = null;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação.");
      }
      
      const shopifyPagesInfo = shopifyPages.map(page => ({ title: page.title, handle: page.handle }));
      
      const response = await fetch(`/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          chatSessionId: chatSessionId,
          userId: user?.id,
          shopifyStoreDomain: currentShopDomain,
          shopifyPagesContext: shopifyPagesInfo,
        }),
      });

      setAiPlaceholderId(null);

      if (!response.ok || !response.body) {
        errorData = await response.json().catch(() => null);
        if (errorData && typeof errorData === 'object' && 'message' in errorData && typeof errorData.message === 'string') {
          errorResponseMessage = errorData.message;
        } else {
          errorResponseMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorResponseMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentAiMessageId: string | null = null;
      let accumulatedText = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !done });
        accumulatedText += chunk;

        if (!currentAiMessageId) {
          currentAiMessageId = String(Date.now()) + '-ai-stream';
          setMessages((prevMessages) => [
            ...prevMessages,
            { id: currentAiMessageId!, text: accumulatedText, sender: 'ai', timestamp: new Date() },
          ]);
        } else {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === currentAiMessageId
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      let errorMessage = "Erro desconhecido ao enviar mensagem.";
      
      if (error instanceof Error) {
        // Verificar se é erro de integrações
        if (error.message.includes("OpenAI não configurada") || error.message.includes("Shopify não conectada")) {
          errorMessage = error.message;
          // Revalidar integrações
          checkIntegrationsStatus();
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorChatMessage: ChatMessage = {
        id: String(Date.now()) + '-error',
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorChatMessage]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      if (aiPlaceholderId) {
        setAiPlaceholderId(null);
      }
    }
  };

  const handleNewConversation = () => {
    const newSessionId = crypto.randomUUID();
    setChatSessionId(newSessionId);
    setMessages([]);
    setAiPlaceholderId(null);
    toast.success("Nova conversa iniciada.");
  };

  const fetchShopifyPagesList = useCallback(async () => {
    if (!user || !shopifyStatus.connected) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Token não encontrado para buscar páginas Shopify no Playground.");

      const response = await fetch('/api/shopify/pages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[Playground] Falha ao buscar páginas da Shopify:', errorData.error || `Status: ${response.status}`);
        setShopifyPages([]);
        return;
      }
      const pagesData: ShopifyPage[] = await response.json();
      setShopifyPages(pagesData);
      console.log('[Playground] Páginas Shopify carregadas para contexto:', pagesData.length);
    } catch (err: unknown) {
      console.warn('[Playground] Erro ao carregar páginas da Shopify para contexto:', err);
      setShopifyPages([]);
    }
  }, [user, getToken, shopifyStatus.connected]);

  const fetchSettings = useCallback(async () => {
    if (!user?.id || !isAuthSignedInHook) return;
    setIsLoadingSettings(true);
    setSettingsError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado para buscar configurações.");
      
      const response = await fetch('/api/ai/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Erro ao buscar configurações: ${response.statusText}` }));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }
      const data = await response.json();
      setIaName(data.ai_name || 'Júlia');
      setIaStyle(data.ai_style || 'amigavel');
      setIaLanguage(data.ai_language || 'pt-br');
    } catch (err: unknown) {
      console.error("[Playground FetchSettings] Erro:", err);
      setSettingsError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao buscar as configurações.");
    } finally {
      setIsLoadingSettings(false);
    }
  }, [user?.id, getToken, isAuthSignedInHook]);

  const handleSaveAISettings = async () => {
    if (!user?.id) {
      setSettingsError("Usuário não autenticado.");
      return;
    }
    setIsSavingSettings(true);
    setSettingsError(null);
    setSettingsSuccessMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado para salvar.");

      const settingsToSave = { ai_name: iaName, ai_style: iaStyle, ai_language: iaLanguage };
      const response = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Erro ao salvar configurações: ${response.statusText}` }));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.settings) {
        setIaName(result.settings.ai_name);
        setIaStyle(result.settings.ai_style);
        setIaLanguage(result.settings.ai_language);
        
        // Sincronizar com localStorage para outras páginas
        localStorage.setItem('LS_AI_SETTINGS', JSON.stringify(result.settings));
      }
      setSettingsSuccessMessage(result.message || "Configurações da IA salvas com sucesso!");
      toast.success(result.message || "Configurações da IA salvas com sucesso!");
    } catch (err: unknown) {
      console.error("[Playground SaveSettings] Erro:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao salvar as configurações.";
      setSettingsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    if (isAuthLoadedHook && isUserSignedInHook && user) {
      fetchChatHistorySessions();
      fetchSettings();
    }
  }, [isAuthLoadedHook, isUserSignedInHook, user, fetchChatHistorySessions, fetchSettings]);

  // Sincronização com localStorage - ouvir mudanças nas configurações da IA
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'LS_AI_SETTINGS' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          setIaName(settings.ai_name || 'Júlia');
          setIaStyle(settings.ai_style || 'amigavel');
          setIaLanguage(settings.ai_language || 'pt-br');
        } catch (error) {
          console.error('Erro ao sincronizar configurações da IA:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Efeito separado para carregar páginas do Shopify apenas quando estiver conectado
  useEffect(() => {
    if (isAuthLoadedHook && isUserSignedInHook && user && !isLoadingIntegrations && shopifyStatus.connected) {
      fetchShopifyPagesList();
    }
  }, [isAuthLoadedHook, isUserSignedInHook, user, isLoadingIntegrations, shopifyStatus.connected, fetchShopifyPagesList]);

  if (!isAuthLoadedHook || !isUserLoadedHook || isLoadingSettings) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        <TopDockNav />
        
        <EtherealShadow
          className="fixed inset-0 z-[-1]"
          animation={{ scale: 4, speed: 40 }}
          noise={{ opacity: 0.12, scale: 1.2 }}
          style={{ filter: "blur(120px)" }}
        />
        
        {/* Overlay escuro para o playground */}
        <div className="fixed inset-0 z-[-1] bg-black/25" />
        
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <Spinner variant="infinite" size={48} className="text-white" />
        </div>
      </div>
    );
  }

  // Verificar se as integrações estão conectadas
  const areIntegrationsReady = isOpenAIConfigured && shopifyStatus.connected;
  
  // Mostrar tela de bloqueio se as integrações não estiverem prontas
  if (isLoadingIntegrations) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        <TopDockNav />
        
        <EtherealShadow
          className="fixed inset-0 z-[-1]"
          animation={{ scale: 4, speed: 40 }}
          noise={{ opacity: 0.12, scale: 1.2 }}
          style={{ filter: "blur(120px)" }}
        />
        
        {/* Overlay escuro para o playground */}
        <div className="fixed inset-0 z-[-1] bg-black/25" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <Spinner variant="infinite" size={48} className="text-white mb-4" />
          <p className="text-white/70">Verificando integrações...</p>
        </div>
      </div>
    );
  }

  if (!areIntegrationsReady) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        <TopDockNav />
        
        <EtherealShadow
          className="fixed inset-0 z-[-1]"
          animation={{ scale: 4, speed: 40 }}
          noise={{ opacity: 0.12, scale: 1.2 }}
          style={{ filter: "blur(120px)" }}
        />
        
        {/* Overlay escuro para o playground */}
        <div className="fixed inset-0 z-[-1] bg-black/25" />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-20 px-8 pb-8">
          <LiquidGlassCard className="max-w-lg w-full text-center">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-white flex items-center justify-center gap-2 mb-2 text-lg font-semibold">
                <Bot className="h-5 w-5 text-blue-400" />
                Playground da IA Indisponível
              </CardTitle>
              <CardDescription className="text-white/70 text-sm">
                Para usar o Playground da IA, você precisa ter as seguintes integrações ativas:
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="grid gap-4">
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isOpenAIConfigured 
                    ? 'bg-green-500/10 border-green-400/30 text-green-300' 
                    : 'bg-red-500/10 border-red-400/30 text-red-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isOpenAIConfigured ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="font-medium text-sm">OpenAI</span>
                  </div>
                  <span className="text-xs font-medium">
                    {isOpenAIConfigured ? 'Conectado' : 'Não configurado'}
                  </span>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  shopifyStatus.connected 
                    ? 'bg-green-500/10 border-green-400/30 text-green-300' 
                    : 'bg-red-500/10 border-red-400/30 text-red-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      shopifyStatus.connected ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="font-medium text-sm">Shopify</span>
                  </div>
                  <span className="text-xs font-medium">
                    {shopifyStatus.connected ? `Conectado` : 'Não conectado'}
                  </span>
                </div>
              </div>
              
              {integrationsError && (
                <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl mt-4">
                  <p className="text-red-300 text-xs">{integrationsError}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3 justify-center pt-4 pb-6 px-6">
              <Button 
                onClick={() => window.location.href = '/dashboard/integracoes'}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-400/30 rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                Ir para Integrações
              </Button>
              <Button 
                onClick={checkIntegrationsStatus}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Novamente
              </Button>
            </CardFooter>
          </LiquidGlassCard>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopDockNav />
      
      <EtherealShadow
        className="fixed inset-0 z-[-1]"
        animation={{ scale: 4, speed: 40 }}
        noise={{ opacity: 0.12, scale: 1.2 }}
        style={{ filter: "blur(120px)" }}
      />
      
      {/* Overlay escuro para o playground */}
      <div className="fixed inset-0 z-[-1] bg-black/25" />
      
      <div className="flex flex-row h-[calc(100vh-5rem)] bg-transparent pt-4 px-6 pb-6 gap-6 overflow-hidden">
        <LiquidGlassCard className="flex-[2_2_0%] flex flex-col h-full overflow-hidden relative">
        <Particles
            className="absolute inset-0 -z-10"
            quantity={50} 
            color={particleColor}
        />
          <div className="p-4 border-b border-white/20 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Playground da IA</h2>
        </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn("flex items-end gap-3 max-w-[85%]", msg.sender === 'user' ? "flex-row-reverse" : "flex-row")}>
                  {msg.sender === 'ai' && <Bot className="w-8 h-8 text-blue-400 self-start flex-shrink-0" />}
                  {msg.sender === 'user' && <User className="w-8 h-8 text-green-400 self-start flex-shrink-0" />}
                <div 
                  className={cn(
                      "px-4 py-3 rounded-2xl shadow-lg text-sm break-words leading-relaxed",
                    msg.sender === 'user' 
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {aiPlaceholderId && (
            <div className="flex w-full justify-start">
                <div className="flex items-end gap-3 max-w-[85%] flex-row">
                  <Bot className="w-8 h-8 text-blue-400 self-start flex-shrink-0" />
                  <div className="px-4 py-3 rounded-2xl shadow-lg text-sm bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  <Spinner variant="infinite" size={20} className="text-white" />
                </div>
              </div>
            </div>
          )}
          {messages.length === 0 && !aiPlaceholderId && (
             <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-20 h-20 text-white/40 mb-6" />
                  <p className="text-white/80 text-lg font-medium mb-2">Comece uma conversa com a IA.</p>
                  <p className="text-white/60 text-sm">Digite sua mensagem abaixo para começar.</p>
            </div>
          )}
        </div>

          <div className="p-4 border-t border-white/20 flex-shrink-0">
            <AnimatedAIChat
                onSendMessage={handleSendMessage}
                isProcessing={isLoading} 
                onNewConversation={handleNewConversation}
                isOpenAIActive={isOpenAIConfigured}
                onOpenAIStatusClick={() => {
                  // Função para lidar com o clique no status da OpenAI
                  window.open('/dashboard/integracoes', '_blank');
                }}
            />
        </div>
        </LiquidGlassCard>

        <LiquidGlassCard className="flex-[1_1_0%] flex flex-col h-full gap-6 overflow-y-auto p-6">
          <div className="flex-shrink-0">
            <div className="pb-4">
              <h3 className="text-xl font-bold text-white">Configurações Rápidas</h3>
              <p className="text-white/70">Ajuste o comportamento da sua IA em tempo real.</p>
      </div>
            <div className="space-y-6">
            <div>
                <Label htmlFor="iaNamePlayground" className="text-white font-medium mb-2 block">Nome da IA</Label>
                <Input 
                  id="iaNamePlayground" 
                  value={iaName} 
                  onChange={(e) => setIaName(e.target.value)} 
                  placeholder="Ex: Atendente Virtual"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 w-1/2"
                />
            </div>
            <div>
                <Label htmlFor="iaStylePlayground" className="text-white font-medium mb-2 block">Estilo de Linguagem</Label>
              <Select value={iaStyle} onValueChange={setIaStyle}>
                  <SelectTrigger id="iaStylePlayground" className="bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                    <SelectValue placeholder="Selecione o estilo" className="text-white" />
                  </SelectTrigger>
                <SelectContent 
                  className="bg-black/80 backdrop-blur-xl border-white/20 shadow-2xl"
                  style={{ 
                    '--radix-select-item-indicator-color': 'white',
                    color: 'white'
                  } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}
                >
                  <SelectItem value="formal" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>Formal</SelectItem>
                  <SelectItem value="amigavel" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>Amigável</SelectItem>
                  <SelectItem value="divertido" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>Divertido</SelectItem>
                  <SelectItem value="neutro" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>Neutro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="iaLanguagePlayground" className="text-white font-medium mb-2 block">Idioma Principal</Label>
              <Select value={iaLanguage} onValueChange={setIaLanguage}>
                  <SelectTrigger id="iaLanguagePlayground" className="bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                    <SelectValue placeholder="Selecione o idioma" className="text-white" />
                  </SelectTrigger>
                <SelectContent 
                  className="bg-black/80 backdrop-blur-xl border-white/20 shadow-2xl"
                  style={{ 
                    '--radix-select-item-indicator-color': 'white',
                    color: 'white'
                  } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}
                >
                  <SelectItem value="pt-br" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇧🇷 Português (Brasil)</SelectItem>
                  <SelectItem value="en-us" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇺🇸 Inglês</SelectItem>
                  <SelectItem value="es-es" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇪🇸 Espanhol</SelectItem>
                  <SelectItem value="fr-fr" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇫🇷 Francês</SelectItem>
                  <SelectItem value="de-de" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇩🇪 Alemão</SelectItem>
                  <SelectItem value="it-it" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇮🇹 Italiano</SelectItem>
                  <SelectItem value="ja-jp" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇯🇵 Japonês</SelectItem>
                  <SelectItem value="ko-kr" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇰🇷 Coreano</SelectItem>
                  <SelectItem value="zh-cn" className="text-white hover:bg-white/10 focus:bg-white/10" style={{ '--radix-select-item-indicator-color': 'white' } as React.CSSProperties & { '--radix-select-item-indicator-color': string }}>🇨🇳 Chinês</SelectItem>
                </SelectContent>
              </Select>
            </div>
              {settingsError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{settingsError}</p>}
              {settingsSuccessMessage && <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">{settingsSuccessMessage}</p>}
            </div>
            <div className="pt-4">
              <Button 
                onClick={handleSaveAISettings} 
                disabled={isSavingSettings || isLoadingSettings} 
                className="w-full h-10 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 border border-emerald-400/30 backdrop-blur-sm"
              >
              {isSavingSettings ? <Spinner variant="infinite" size={16} className="mr-2 text-emerald-300" /> : null}
              Salvar Configurações
            </Button>
            </div>
          </div>
          
          {/* Prévia do Histórico */}
          <div>
            <div className="pb-3">
              <h3 className="text-lg font-bold text-white">Histórico Recente</h3>
              <p className="text-white/60 text-sm">Suas últimas conversas</p>
            </div>
            
            <div className="space-y-2">
              {isLoadingHistory && (
                <div className="flex justify-center items-center p-3">
                  <Spinner variant="infinite" size={20} className="text-white" />
                  <span className="ml-2 text-xs text-white/70">Carregando...</span>
                </div>
              )}
              
              {!isLoadingHistory && chatHistorySessions.length === 0 && (
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <History className="w-6 h-6 text-white/40 mx-auto mb-1" />
                  <p className="text-white/60 text-xs">Nenhuma conversa ainda</p>
                </div>
              )}
              
              {!isLoadingHistory && chatHistorySessions.length > 0 && (
                <>
                  {/* Mostrar apenas as 5 conversas mais recentes */}
                  {chatHistorySessions.slice(0, 5).map((session) => (
                    <Button 
                      key={session.sessionId}
                      variant="ghost"
                      className="w-full h-auto justify-start text-left p-2 rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors duration-200 bg-white/5 border border-white/10"
                      onClick={() => loadChatSessionAndDisplay(session.sessionId)}
                      disabled={isLoadingSpecificChatHistory === session.sessionId}
                      title={`Carregar: ${session.title || session.lastMessagePreview.substring(0,40)}...`}
                    >
                      {isLoadingSpecificChatHistory === session.sessionId && <Spinner variant="infinite" size={14} className="mr-2 flex-shrink-0 text-white" />}
                      <div className="flex flex-col w-full overflow-hidden">
                        <span className="font-medium text-xs text-white truncate">
                          {session.title || `${new Date(session.lastMessageTimestamp).toLocaleDateString()}`}
                        </span>
                        <p className="text-xs text-white/60 truncate mt-1 leading-relaxed">
                          {session.lastMessagePreview.length > 35 
                            ? session.lastMessagePreview.substring(0, 35) + '...' 
                            : session.lastMessagePreview}
                        </p>
                      </div>
                    </Button>
                  ))}
                </>
              )}
            </div>
            
            {/* Botão Ver Todos */}
            <div className="pt-2">
              <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setIsHistoryModalOpen(true);
                      if (chatHistorySessions.length === 0) {
                        fetchChatHistorySessions();
                      }
                    }}
                    className="w-full h-9 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-xs px-3 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    <History className="w-3 h-3" />
                    Ver Todos ({chatHistorySessions.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] bg-black/30 backdrop-blur-xl border-white/20 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Histórico Completo do Playground</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[60vh]">
                      {isLoadingHistory && (
                        <div className="flex justify-center items-center h-full p-6">
                          <Spinner variant="infinite" size={24} className="text-white" /> 
                          <span className="ml-3 text-sm text-white/70">Carregando histórico...</span>
                        </div>
                      )}
                      {!isLoadingHistory && chatHistorySessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                          <History className="w-16 h-16 text-white/40 mb-4" />
                          <p className="text-white/60 text-lg font-medium mb-2">Nenhum histórico encontrado</p>
                          <p className="text-white/50 text-sm">Suas conversas aparecerão aqui após você começar a usar o playground.</p>
                        </div>
                      )}
                      {!isLoadingHistory && chatHistorySessions.length > 0 && (
                        <div className="space-y-2 p-2">
                          {chatHistorySessions.map((session) => (
                            <Button 
                              key={session.sessionId}
                              variant="ghost"
                              className="w-full h-auto justify-start text-left p-4 rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors duration-200 bg-white/5 border border-white/10"
                              onClick={() => {
                                loadChatSessionAndDisplay(session.sessionId);
                                setIsHistoryModalOpen(false);
                              }}
                              disabled={isLoadingSpecificChatHistory === session.sessionId}
                              title={`Carregar: ${session.title || session.lastMessagePreview.substring(0,50)}...`}
                            >
                              {isLoadingSpecificChatHistory === session.sessionId && <Spinner variant="infinite" size={16} className="mr-3 flex-shrink-0 text-white" />}
                              <div className="flex flex-col w-full overflow-hidden">
                                <span className="font-medium text-sm text-white truncate">
                                  {session.title || `Conversa de ${new Date(session.lastMessageTimestamp).toLocaleDateString()}`}
                                </span>
                                <p className="text-xs text-white/60 truncate mt-1 leading-relaxed">
                                  {session.lastMessagePreview}
                                </p>
                                <p className="text-xs text-white/40 mt-2">
                                  {new Date(session.lastMessageTimestamp).toLocaleString()}
                                </p>
                              </div>
                            </Button>
                          ))}
                        </div>
              )}
            </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </>
  );
}