'use client';

import React, { useState, useEffect } from 'react';

// Componentes da UI (ajuste conforme seus componentes existentes)
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { Spinner } from '@/components/ui/spinner'; // Se tiver um spinner

const SystemPromptViewerPage = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [currentView, setCurrentView] = useState('real'); // 'real' ou 'template'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentShopDomain, setCurrentShopDomain] = useState<string | null>(null);

  useEffect(() => {
    const shopDomainFromStorage = sessionStorage.getItem('currentShopifyStore');
    if (shopDomainFromStorage) {
      setCurrentShopDomain(shopDomainFromStorage);
    } else {
      setError("Domínio da loja Shopify não encontrado. Conecte uma loja em Integrações.");
      setIsLoading(false);
    }
  }, []);

  const fetchPrompt = React.useCallback(async (viewType: string) => {
    setIsLoading(true);
    setError(null);
    setSystemPrompt(''); // Limpa o prompt anterior

    try {
      let url = '';
      if (viewType === 'real') {
        if (!currentShopDomain) {
          setError("Domínio da loja Shopify não encontrado para buscar o prompt real.");
          setIsLoading(false);
          return;
        }
        url = `/api/ia/system-prompt?shopDomain=${encodeURIComponent(currentShopDomain)}`;
      } else { // viewType === 'template'
        url = '/api/ia/system-prompt-template';
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao buscar o prompt: ${response.statusText}`);
      }
      const data = await response.json();
      if (viewType === 'real') {
        setSystemPrompt(data.systemPrompt || 'Prompt real não retornado ou vazio.');
      } else {
        setSystemPrompt(data.systemPromptTemplate || 'Template do prompt não retornado ou vazio.');
      }
    } catch (err: unknown) {
      console.error(`Erro ao buscar system prompt (${viewType}):`, err);
      if (err instanceof Error) {
      setError(err.message || `Falha ao carregar o prompt (${viewType}).`);
      } else {
        setError(`Falha ao carregar o prompt (${viewType}). Ocorreu um erro desconhecido.`);
      }
      setSystemPrompt(`Falha ao carregar o prompt (${viewType}).`);
    } finally {
      setIsLoading(false);
    }
  }, [currentShopDomain]);

  useEffect(() => {
    // Carrega o prompt real inicialmente se o domínio da loja estiver disponível
    if (currentShopDomain) {
      fetchPrompt('real');
      setCurrentView('real');
    }
  }, [currentShopDomain, fetchPrompt]);

  const handleViewChange = (newView: string) => {
    setCurrentView(newView);
    fetchPrompt(newView);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Visualizador do System Prompt da IA</h1>
      
      {!currentShopDomain && !isLoading && currentView === 'real' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Atenção</p>
          <p>{error || "Nenhuma loja Shopify está conectada ou selecionada. Por favor, conecte uma loja na página de Integrações para visualizar o prompt específico da loja."}</p>
        </div>
      )}

      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => handleViewChange('real')}
          disabled={isLoading || !currentShopDomain}
          className={`px-4 py-2 rounded-md transition-colors duration-150 ease-in-out 
            ${currentView === 'real' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-600'}
            disabled:bg-gray-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed`}
        >
          Ver Prompt Real (Processado)
        </button>
        <button
          onClick={() => handleViewChange('template')}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md transition-colors duration-150 ease-in-out 
            ${currentView === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-600'}
            disabled:bg-gray-400 dark:disabled:bg-neutral-600`}
        >
          Ver Template do Prompt (Placeholders)
        </button>
      </div>

      {(currentShopDomain || currentView === 'template') && (
        <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-300">
              {currentView === 'real' 
                ? <>Prompt para a Loja: <span className='text-blue-600 dark:text-blue-400'>{currentShopDomain}</span></>
                : 'Template Base do System Prompt'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {currentView === 'real'
                ? "Este é o prompt de sistema principal que instrui a IA sobre sua identidade, capacidades e como interagir com os clientes da loja selecionada."
                : "Este é o template base usado para gerar o prompt da IA, mostrando os placeholders que seriam substituídos."
              }
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600 dark:text-neutral-300">Carregando prompt...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
              <p className="font-bold">Erro ao Carregar</p>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="mt-4">
              <label htmlFor="systemPromptTextarea" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                Conteúdo do System Prompt:
              </label>
              <textarea
                id="systemPromptTextarea"
                readOnly
                value={systemPrompt}
                className="w-full h-96 p-3 border border-gray-300 dark:border-neutral-700 rounded-md shadow-sm bg-gray-50 dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Carregando prompt..."
              />
            </div>
          )}
           {/* O botão de recarregar agora é substituído pelos botões de alternância de visão */}

            {!isLoading && !error && systemPrompt && currentView === 'real' && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-neutral-300 mb-4">
                  Principais Capacidades da IA (Conforme System Prompt Real):
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-full shadow-md">
                    Consultar Pedidos e Rastreio
                  </span>
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-full shadow-md">
                    Informações Gerais sobre Produtos
                  </span>
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-full shadow-md">
                    Busca Detalhada de Produtos (Tempo Real)
                  </span>
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-md">
                    Consultar Políticas da Loja
                  </span>
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-full shadow-md">
                    Fornecer Link do Site
                  </span>
                  <span className="px-3 py-1.5 text-sm font-medium text-white bg-slate-600 rounded-full shadow-md">
                    Gerenciar Incertezas e Limites
                  </span>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SystemPromptViewerPage; 