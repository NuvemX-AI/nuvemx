"use client"; // Adicionar "use client" para hooks como useState

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

import { LiquidGlassCard } from "@/app/components/ui/LiquidGlassCard";
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";
import { TopDockNav } from "@/app/components/ui/TopDockNav";
import { 
  Brain,
  Upload,
  FileText as File,
  Check,
  AlertTriangle,
  X,
  ShoppingBag
} from 'lucide-react';
import { Spinner } from "@/app/components/ui/spinner";

interface AISettings {
  ai_name: string;
  ai_style: string;
  ai_language: string;
}

interface ShopifyStoreData {
  products: number;
  orders: number;
  pages: number;
  shopName?: string;
  connected?: boolean;
}

interface ShopifyPage {
  id: number;
  title: string;
  handle: string;
  body_html: string;
}

interface KnowledgeBase {
  id?: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
  status: 'processing' | 'ready' | 'error';
}

const IASettingsPage = () => {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const [iaName, setIaName] = useState('Júlia');
  const [iaStyle, setIaStyle] = useState('amigavel');
  const [iaLanguage, setIaLanguage] = useState('pt-br');

  // Estados para Base de Conhecimento
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [shopifyStoreData, setShopifyStoreData] = useState<ShopifyStoreData | null>(null);
  const [shopifyPages, setShopifyPages] = useState<ShopifyPage[]>([]);

  // Funções para Base de Conhecimento
  const handleFileUpload = async (file: File) => {
    if (!userId) {
      setError("Usuário não autenticado.");
      return;
    }

    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de arquivo não suportado. Use TXT, MD ou PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError("Arquivo muito grande. Máximo de 10MB.");
      return;
    }

    setIsUploadingKnowledge(true);
    setUploadProgress(0);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/knowledge-base', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao fazer upload: ${response.statusText}`);
      }

      const result = await response.json();
      setKnowledgeBase({
        id: result.id,
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        status: 'processing'
      });

      setSuccessMessage("Base de conhecimento enviada com sucesso!");
      
      // Simular progresso de processamento
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setKnowledgeBase(prev => prev ? { ...prev, status: 'ready' } : null);
        }
      }, 200);

    } catch (err: unknown) {
      console.error("Erro ao fazer upload da base de conhecimento:", err);
      if (err instanceof Error) {
        setError(err.message || "Falha ao fazer upload.");
      } else {
        setError("Ocorreu um erro desconhecido ao fazer upload.");
      }
    } finally {
      setIsUploadingKnowledge(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeKnowledgeBase = async () => {
    if (!knowledgeBase?.id || !userId) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado.");

      console.log('[Frontend] Removendo base de conhecimento ID:', knowledgeBase.id);

      const response = await fetch(`/api/ai/knowledge-base/${knowledgeBase.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[Frontend] Resposta da remoção:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[Frontend] Base de conhecimento removida:', result);

      setKnowledgeBase(null);
      setSuccessMessage("Base de conhecimento removida com sucesso!");
    } catch (err: unknown) {
      console.error("Erro ao remover base de conhecimento:", err);
      if (err instanceof Error) {
        setError(err.message || "Falha ao remover base de conhecimento.");
      } else {
        setError("Erro desconhecido ao remover base de conhecimento.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchShopifyPages = useCallback(async () => {
    if (!userId || !shopifyStoreData?.connected) return;
    
    console.log('[Shopify Pages Frontend] Iniciando busca de páginas Shopify...');
    try {
      const token = await getToken();
      if (!token) throw new Error("Token de autenticação não encontrado para buscar páginas Shopify.");

      const response = await fetch('/api/shopify/pages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('[Shopify Pages Frontend] Status da resposta para /api/shopify/pages:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao buscar páginas da Shopify. Status: ${response.status}`);
      }
      const pagesData: ShopifyPage[] = await response.json();
      setShopifyPages(pagesData);
      console.log('[Shopify Pages Frontend] Páginas Shopify carregadas:', pagesData.length);
    } catch (err: unknown) {
      console.error('[Shopify Pages Frontend] Erro ao carregar páginas da Shopify:', err);
      if (err instanceof Error) {
      setError(err.message || 'Erro desconhecido ao carregar páginas da Shopify.');
      } else {
        setError('Erro desconhecido ao carregar páginas da Shopify.');
      }
      setShopifyPages([]);
    }
  }, [userId, getToken, shopifyStoreData?.connected]);

  useEffect(() => {
    const fetchShopifyStatusAndData = async () => {
      if (!userId) return;
      setShopifyPages([]);

      try {
        const token = await getToken();
        if (!token) throw new Error("Token de autenticação não encontrado.");

        const statusResponse = await fetch('/api/shopify/session/status', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!statusResponse.ok) throw new Error('Falha ao buscar status da loja Shopify.');
        const statusData = await statusResponse.json();

        if (statusData.connected && statusData.shop) {
          setShopifyStoreData(prev => ({ ...prev, shopName: statusData.shop, connected: true, products: prev?.products || 0, orders: prev?.orders || 0, pages: prev?.pages || 0 }));
        } else {
          setShopifyStoreData({ products: 0, orders: 0, pages: 0, connected: false });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.warn('Error fetching Shopify status:', err.message);
        } else {
          console.warn('Unknown error fetching Shopify status');
        }
        setShopifyStoreData({ products: 0, orders: 0, pages: 0, connected: false });
      }
    };

    const fetchSettings = async () => {
      if (!userId) {
        setIsFetching(false);
        return;
      }
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Não foi possível obter o token de autenticação.");
        }

        const response = await fetch('/api/ai/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('[AI Settings Frontend] Status da resposta para /api/ai/settings:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AI Settings Frontend] Resposta não OK (texto):', errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || `Erro ao buscar configurações: ${response.statusText}`);
          } catch {
            throw new Error(`Erro ao buscar configurações: ${response.statusText}. Resposta não era JSON válido.`);
          }
        }
        const data: AISettings = await response.json();
        setIaName(data.ai_name || 'Júlia');
        setIaStyle(data.ai_style || 'amigavel');
        setIaLanguage(data.ai_language || 'pt-br');
        console.log("Configurações da IA carregadas:", data);
      } catch (err: unknown) {
        console.error("Falha ao buscar configurações da IA:", err);
        if (err instanceof Error) {
        setError(err.message || "Ocorreu um erro desconhecido ao buscar as configurações.");
        } else {
          setError("Ocorreu um erro desconhecido ao buscar as configurações.");
        }
        setIaName(prev => prev || 'Júlia'); 
        setIaStyle(prev => prev || 'amigavel');
        setIaLanguage(prev => prev || 'pt-br');
      } finally {
        setIsFetching(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchShopifyStatusAndData();
      fetchSettings();
    } else if (isLoaded && !isSignedIn) {
      setIsFetching(false);
    }
  }, [isLoaded, isSignedIn, userId, getToken]);

  useEffect(() => {
    if (shopifyStoreData?.connected) {
      fetchShopifyPages();
    } else {
      setShopifyPages([]); 
    }
  }, [shopifyStoreData?.connected, fetchShopifyPages]);

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

  const handleSaveChanges = async () => {
    if (!userId) {
      setError("Usuário não autenticado.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação para salvar.");
      }

      const settingsToSave = {
        ai_name: iaName,
        ai_style: iaStyle,
        ai_language: iaLanguage,
      };

      const response = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settingsToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao salvar configurações: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.settings) {
        setIaName(result.settings.ai_name);
        setIaStyle(result.settings.ai_style);
        setIaLanguage(result.settings.ai_language);
        
        // Sincronizar com localStorage para outras páginas
        localStorage.setItem('LS_AI_SETTINGS', JSON.stringify(result.settings));
        
        setSuccessMessage(result.message || "Configurações da IA salvas com sucesso!");
        console.log('Alterações salvas com sucesso:', result.settings);
      } else {
        throw new Error(result.message || "Resposta inesperada do servidor ao salvar.");
      }

    } catch (err: unknown) {
      console.error("Erro ao salvar as configurações:", err);
      if (err instanceof Error) {
        setError(err.message || "Falha ao salvar configurações.");
      } else {
        setError("Ocorreu um erro desconhecido ao salvar as configurações.");
      }
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-10 space-y-8 flex flex-col items-center justify-center h-screen">
        <Spinner 
          variant="infinite"
          size={80}
          className="text-white"
        />
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
      
      {/* Overlay escuro para as configurações */}
      <div className="fixed inset-0 z-[-1] bg-black/25" />
      
      <div className="container mx-auto pt-8 px-6">
        {/* Card Principal Contentor */}
        <LiquidGlassCard className="w-full p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Identidade e Personalidade */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 shadow-xl backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Identidade e Personalidade</h2>
                  <p className="text-white/80 text-base leading-relaxed">
                    Defina como sua IA se apresenta e interage com os clientes.
                  </p>
                </div>
                
                  <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="iaName" className="text-white font-semibold text-base tracking-wide">Nome da IA</Label>
                <Input 
                  id="iaName" 
                        placeholder="Ex: Júlia, Clara" 
                  value={iaName} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIaName(e.target.value)}
                      className="bg-white/15 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/30 h-12 text-base font-medium"
                />
              </div>
                  <div className="space-y-4">
                    <Label htmlFor="iaStyle" className="text-white font-semibold text-base tracking-wide">Tom de Voz</Label>
                <Select value={iaStyle} onValueChange={setIaStyle}>
                      <SelectTrigger className="bg-white/15 border-white/30 text-white focus:border-white/50 focus:ring-white/30 h-12 text-base font-medium">
                          <SelectValue placeholder="Selecione o tom de voz" className="text-white" />
                  </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border-white/30 shadow-2xl">
                        <SelectItem value="formal" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">Formal</SelectItem>
                        <SelectItem value="amigavel" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">Amigável</SelectItem>
                        <SelectItem value="divertido" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">Divertido</SelectItem>
                        <SelectItem value="neutro" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">Neutro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                  <div className="space-y-4">
                    <Label htmlFor="iaLanguage" className="text-white font-semibold text-base tracking-wide">Idioma Principal</Label>
                <Select value={iaLanguage} onValueChange={setIaLanguage}>
                      <SelectTrigger className="bg-white/15 border-white/30 text-white focus:border-white/50 focus:ring-white/30 h-12 text-base font-medium">
                          <SelectValue placeholder="Selecione o idioma" className="text-white" />
                  </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border-white/30 shadow-2xl">
                        <SelectItem value="pt-br" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇧🇷 Português (Brasil)</SelectItem>
                        <SelectItem value="en-us" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇺🇸 Inglês</SelectItem>
                        <SelectItem value="es-es" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇪🇸 Espanhol</SelectItem>
                        <SelectItem value="fr-fr" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇫🇷 Francês</SelectItem>
                        <SelectItem value="de-de" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇩🇪 Alemão</SelectItem>
                        <SelectItem value="it-it" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇮🇹 Italiano</SelectItem>
                        <SelectItem value="ja-jp" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇯🇵 Japonês</SelectItem>
                        <SelectItem value="ko-kr" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇰🇷 Coreano</SelectItem>
                        <SelectItem value="zh-cn" className="text-white hover:bg-white/15 focus:bg-white/15 text-base">🇨🇳 Chinês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-col w-full gap-4">
                  {error && (
                      <div className="text-base text-red-300 bg-red-500/15 border border-red-400/30 rounded-xl p-5 font-medium">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                      <div className="text-base text-green-300 bg-green-500/15 border border-green-400/30 rounded-xl p-5 font-medium">
                      {successMessage}
                    </div>
                  )}
                  <div className="flex justify-start">
                    <Button 
                      onClick={handleSaveChanges} 
                      disabled={isLoading || isFetching}
                        className="h-12 px-8 py-3 text-base bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg font-semibold rounded-xl transition-all duration-200 tracking-wide"
                    >
                        {isLoading && <Spinner variant="infinite" size={18} className="mr-2 text-white" />}
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Base de Conhecimento */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 shadow-xl backdrop-blur-sm">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-purple-500/25 rounded-xl">
                      <Brain className="h-6 w-6 text-purple-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Base de Conhecimento</h2>
                  </div>
                  <p className="text-white/80 text-base leading-relaxed">
                    Faça upload de um arquivo para a IA consultar
                  </p>
                </div>
                
                <div className="space-y-4">
                  {!knowledgeBase ? (
                    <div 
                      className={`
                        relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                        ${isDragging 
                          ? 'border-purple-400 bg-purple-500/10' 
                          : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                        }
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".txt,.md,.pdf"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploadingKnowledge}
                      />
                      
                      <div className="flex flex-col items-center gap-3">
                        <div className={`
                          p-3 rounded-full transition-colors duration-200
                          ${isDragging ? 'bg-purple-500/20' : 'bg-white/10'}
                        `}>
                          <Upload className={`
                            h-6 w-6 transition-colors duration-200
                            ${isDragging ? 'text-purple-400' : 'text-white/70'}
                          `} />
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-white/90 text-base font-semibold">
                            {isDragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique'}
                          </p>
                          <p className="text-white/65 text-sm font-medium">
                            TXT, MD, PDF • Máx. 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 border border-white/20 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="p-2.5 bg-emerald-500/25 rounded-xl flex-shrink-0 mt-0.5">
                            <File className="h-5 w-5 text-emerald-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/95 text-base font-semibold truncate">
                              {knowledgeBase.filename}
                            </p>
                            <p className="text-white/65 text-sm font-medium">
                              {formatFileSize(knowledgeBase.fileSize)}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-3">
                              {knowledgeBase.status === 'processing' ? (
                                <>
                                  <Spinner variant="infinite" size={14} className="text-blue-400" />
                                  <span className="text-blue-300 text-sm font-medium">Processando...</span>
                                </>
                              ) : knowledgeBase.status === 'ready' ? (
                                <>
                                  <Check className="h-4 w-4 text-emerald-400" />
                                  <span className="text-emerald-300 text-sm font-medium">Pronto</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                  <span className="text-red-300 text-sm font-medium">Erro</span>
                                </>
                              )}
                            </div>

                            {isUploadingKnowledge && (
                              <div className="mt-4">
                                <div className="w-full bg-white/15 rounded-full h-2">
                                  <div 
                                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                                <p className="text-white/70 text-sm mt-2 font-medium">{uploadProgress}%</p>
                              </div>
                            )}
                          </div>
        </div>

                        <Button
                          onClick={removeKnowledgeBase}
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          className="p-2 h-auto text-white/70 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-all duration-200 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Spinner variant="infinite" size={16} className="text-white/70" />
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-500/15 border border-blue-400/30 rounded-xl p-4">
                    <p className="text-blue-200 text-sm leading-relaxed font-medium">
                      💡 <strong>Dica:</strong> A IA usará este arquivo para responder perguntas específicas sobre seu negócio, políticas internas, ou qualquer informação personalizada que você queira que ela saiba.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Páginas da Loja Shopify */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-8 shadow-xl backdrop-blur-sm">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-emerald-500/25 rounded-xl">
                      <ShoppingBag className="h-6 w-6 text-emerald-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Páginas da Loja Shopify</h2>
                  </div>
                  <p className="text-white/80 text-base leading-relaxed">
                  Conecte sua loja Shopify para listar páginas que a IA poderá consultar.
                  </p>
                </div>
                
                {!shopifyStoreData?.connected ? (
                  <div className="text-center py-8">
                    <div className="text-white/75 text-base mb-6 font-medium">
                      Sua loja Shopify não está conectada.
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/dashboard/integracoes'}
                      className="bg-blue-500/25 hover:bg-blue-500/35 text-blue-200 border-blue-400/40 rounded-xl px-6 py-3 font-semibold"
                    >
                      Conectar Shopify
                    </Button>
                </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-base text-white/80 font-medium">
                      {shopifyPages.length > 0 ? (
                        `${shopifyPages.length} página(s) disponível(is) para a IA consultar.`
                      ) : (
                        'Nenhuma página encontrada na sua loja.'
                      )}
                    </div>
                    {shopifyPages.length > 0 && (
                      <div className="bg-white/10 rounded-xl p-5 max-h-48 overflow-y-auto">
                        <div className="space-y-3">
                          {shopifyPages.slice(0, 10).map((page) => (
                            <div key={page.id} className="text-base text-white/85 flex items-center gap-3 font-medium">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
                              <span className="truncate">{page.title}</span>
                            </div>
                          ))}
                          {shopifyPages.length > 10 && (
                            <div className="text-sm text-white/70 pt-3 border-t border-white/20 font-medium">
                              ... e mais {shopifyPages.length - 10} página(s)
                </div>
              )}
                        </div>
                      </div>
                    )}
                </div>
              )}
              </div>
          </div>
          </div>
        </LiquidGlassCard>
      </div>
    </>
  );
};

export default IASettingsPage; 