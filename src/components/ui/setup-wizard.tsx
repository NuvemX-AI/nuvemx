"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Sparkles, Bot, Key, ShoppingCart, MessageSquare, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface SetupWizardProps {
  onComplete: () => void;
  onClose: (dontShowAgain: boolean) => void;
}

interface StepStatus {
  aiSettings: boolean;
  openaiKey: boolean;
  shopifyConnection: boolean;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onClose }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    aiSettings: false,
    openaiKey: false,
    shopifyConnection: false,
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao NuvemX.AI! 👋',
      description: 'Vamos configurar sua IA para e-commerce em poucos passos simples',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'ai-settings',
      title: 'Configure sua IA',
      description: 'Defina nome, personalidade e idioma da sua assistente',
      icon: Bot,
      color: 'from-blue-500 to-cyan-500',
      statusKey: 'aiSettings' as keyof StepStatus,
      configPath: '/dashboard/ia/settings',
    },
    {
      id: 'openai',
      title: 'Conectar OpenAI',
      description: 'Adicione sua chave de API para ativar a inteligência artificial',
      icon: Key,
      color: 'from-green-500 to-emerald-500',
      statusKey: 'openaiKey' as keyof StepStatus,
      configPath: '/dashboard/integracoes',
    },
    {
      id: 'shopify',
      title: 'Conectar Shopify',
      description: 'Autorize o acesso à sua loja para consultar pedidos e produtos',
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-500',
      statusKey: 'shopifyConnection' as keyof StepStatus,
      configPath: '/dashboard/integracoes',
    },
    {
      id: 'playground',
      title: 'Testar no Playground',
      description: 'Faça seu primeiro teste e veja a IA em ação',
      icon: MessageSquare,
      color: 'from-teal-500 to-blue-500',
      configPath: '/dashboard/ia/playground',
    },
    {
      id: 'complete',
      title: 'Tudo pronto! 🎉',
      description: 'Sua IA está configurada e pronta para atender seus clientes',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  // Verificar status das configurações
  useEffect(() => {
    console.log('🔍 Setup Wizard: Verificando status das configurações...');
    checkConfigurationStatus();
  }, []);

  const checkConfigurationStatus = async () => {
    try {
      let aiSettingsConfigured = false;
      let openaiConfigured = false;
      let shopifyConfigured = false;

      // Verificar configurações da IA
      try {
        const aiResponse = await fetch('/api/ai/settings');
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          console.log('AI Settings API Response:', aiData);
          // Verificar se não são valores padrão (a API retorna defaults quando não há configuração)
          const isNotDefaultValues = aiData.ai_name !== 'Júlia' || 
                                   aiData.ai_style !== '' || 
                                   aiData.ai_language !== 'pt-br';
          aiSettingsConfigured = !!(aiData.ai_name && aiData.ai_language && isNotDefaultValues);
          console.log('AI Settings configured:', aiSettingsConfigured, { 
            ai_name: aiData.ai_name, 
            ai_style: aiData.ai_style, 
            ai_language: aiData.ai_language,
            isNotDefaultValues 
          });
        }
      } catch (error) {
        console.log('IA settings não configuradas:', error);
      }

      // Verificar OpenAI
      try {
        const openaiResponse = await fetch('/api/openai/config/status');
        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          console.log('OpenAI API Response:', openaiData);
          // A API retorna { configured: boolean }
          openaiConfigured = !!(openaiData.configured);
          console.log('OpenAI configured:', openaiConfigured);
        }
      } catch (error) {
        console.log('OpenAI não configurada:', error);
      }

      // Verificar Shopify
      try {
        const shopifyResponse = await fetch('/api/shopify/session/status');
        if (shopifyResponse.ok) {
          const shopifyData = await shopifyResponse.json();
          console.log('Shopify API Response:', shopifyData);
          // A API retorna { connected: boolean, shop: string }
          shopifyConfigured = !!(shopifyData.connected);
          console.log('Shopify configured:', shopifyConfigured);
        }
      } catch (error) {
        console.log('Shopify não conectado:', error);
      }

      const finalStatus = {
        aiSettings: aiSettingsConfigured,
        openaiKey: openaiConfigured,
        shopifyConnection: shopifyConfigured,
      };
      
      console.log('Status final das configurações:', finalStatus);
      
      setStepStatus(finalStatus);
    } catch (error) {
      console.error('Erro ao verificar status das configurações:', error);
    }
  };

  const progress = (currentStep / (steps.length - 1)) * 100;
  const currentStepData = steps[currentStep];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToConfiguration = (path: string) => {
    window.location.href = path;
  };

  const isStepCompleted = (step: typeof steps[0]) => {
    if (!step.statusKey) return false;
    return stepStatus[step.statusKey];
  };

  const renderStepContent = () => {
    const IconComponent = currentStepData.icon;
    
    return (
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white mb-3">
            {currentStepData.title}
          </h3>
          <p className="text-white/80 mb-4">
            {currentStepData.description}
          </p>
          
          {currentStepData.statusKey && (
            <div className="flex items-center justify-center gap-2 mb-3">
               {isStepCompleted(currentStepData) ? (
                 <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/50">
                   <Check className="w-4 h-4 mr-1" />
                   Configurado
                 </div>
               ) : (
                 <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/50">
                   Pendente
                 </div>
               )}
             </div>
          )}
          
          {currentStepData.configPath && (
            <Button
              onClick={() => goToConfiguration(currentStepData.configPath)}
              className="mb-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isStepCompleted(currentStepData) ? 'Ver Configuração' : 'Configurar Agora'}
            </Button>
          )}
          
          {currentStepData.id === 'welcome' && (
            <p className="text-white/70">
              Olá {user?.firstName}! Vamos configurar sua IA em poucos minutos.
            </p>
          )}
          
          {currentStepData.id === 'complete' && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-white/20 rounded-lg p-4 mb-3">
              <h4 className="font-bold text-white mb-2 text-sm">Próximos passos:</h4>
              <ul className="text-left space-y-1 text-white/80 text-sm">
                <li>✅ Continue testando no Playground</li>
                <li>✅ Adicione base de conhecimento (opcional)</li>
                <li>✅ Conecte o WhatsApp para atendimento real</li>
                <li>✅ Monitore suas métricas no Dashboard</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ paddingTop: currentStep === 5 ? '80px' : '16px' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex flex-col rounded-3xl border border-white/20 bg-black/30 shadow-lg backdrop-blur-xl max-w-md w-full max-h-[85vh] my-auto overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">
              Configuração Inicial
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-sm text-white/70">
                {currentStep + 1} de {steps.length}
              </div>
              <Button
                onClick={() => onClose(dontShowAgain)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar moderno */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 flex items-center justify-center overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 md:p-4 border-t border-white/10 bg-white/5">
          {/* Botões de navegação */}
          <div className="flex items-center justify-between mb-3">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2 border-white/30 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 && (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button 
                  onClick={onComplete} 
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Finalizar
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Opção "Não mostrar novamente" */}
          <div className="flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-blue-500 bg-transparent border-white/30 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-white/70">
              Não mostrar novamente
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupWizard; 