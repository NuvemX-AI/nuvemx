"use client"; // Adicionado para habilitar hooks e interatividade

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { LiquidGlassCard } from "@/app/components/ui/LiquidGlassCard";
import { Button } from "@/app/components/ui/button";
import { 
  MessageSquare, 
  Activity,
  Smartphone,
  CheckCircle,
  XCircle,
  Sprout,
  Sparkles,
  Crown,
  RefreshCw,
  AlertTriangle,
  Clock,
  LayoutGrid,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Spinner } from "@/app/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Importando os componentes do Magic UI
import { NumberTicker } from "@/app/components/magicui/number-ticker";
import { BlurFade } from "@/app/components/magicui/blur-fade";
import { Progress } from "@/components/ui/progress";

// Removendo import do BlurryBlob e adicionando AIOrb
import AIOrb from "@/app/components/ui/AIOrb";

// Importando os Ícones corretos
import { WhatsAppIcon } from '@/app/components/logos/WhatsAppIcon';
import { ShopifyIcon } from '@/app/components/logos/ShopifyIcon';
import { OpenAiIcon } from '@/app/components/logos/OpenAiIcon';

// Imports para os Charts
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
} from '@/app/components/ui/chart';

// Importar o contexto do WhatsApp
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { useSubscription } from '@/contexts/SubscriptionContext';
import SetupWizard from '@/components/ui/setup-wizard';

// Interface para o status da instância WhatsApp
interface InstanceStatusDetails {
  status?: string;
  message?: string;
  error?: string;
  instanceName?: string;
  instance?: {
    instanceName?: string;
    state?: string;
    status?: string;
    last_status_reason?: string;
    qr_received_at?: string;
  };
  rawEvolutionResponse?: {
    error?: string;
  };
}

// Chaves do localStorage
const LS_SHOPIFY_STATUS = "nuvemx_shopify_status";
const LS_OPENAI_STATUS = "nuvemx_openai_status";

// Mock data inicial - connectionStatus será gerenciado pelo estado
// const initialStats = { // Removido pois não está sendo usado
//   messagesToday: 125,
// };

// Dados dos gráficos - mantido comentado pois pode ser usado futuramente
// const hourlyMessagesData = [
//   { hour: "00:00", messages: 12 },
//   { hour: "01:00", messages: 8 },
//   { hour: "02:00", messages: 5 },
//   { hour: "03:00", messages: 3 },
//   { hour: "04:00", messages: 2 },
//   { hour: "05:00", messages: 4 },
//   { hour: "06:00", messages: 15 },
//   { hour: "07:00", messages: 28 },
//   { hour: "08:00", messages: 42 },
//   { hour: "09:00", messages: 58 },
//   { hour: "10:00", messages: 67 },
//   { hour: "11:00", messages: 73 },
//   { hour: "12:00", messages: 85 },
//   { hour: "13:00", messages: 79 },
//   { hour: "14:00", messages: 92 },
//   { hour: "15:00", messages: 88 },
//   { hour: "16:00", messages: 95 },
//   { hour: "17:00", messages: 103 },
//   { hour: "18:00", messages: 98 },
//   { hour: "19:00", messages: 87 },
//   { hour: "20:00", messages: 76 },
//   { hour: "21:00", messages: 65 },
//   { hour: "22:00", messages: 48 },
//   { hour: "23:00", messages: 32 }
// ];

const hourlyMessagesChartConfig = {
  messages: {
    label: "Mensagens",
    color: "white",
  },
} satisfies ChartConfig;

// Dados para o Area Chart de Vendas da IA (em R$) - COMENTADO pois não está sendo usado
// const aiSalesData = [
//   { hora: "08:00", vendas: 280 },
//   { hora: "10:00", vendas: 450 },
//   { hora: "12:00", vendas: 720 },
//   { hora: "14:00", vendas: 960 },
//   { hora: "16:00", vendas: 1340 },
//   { hora: "18:00", vendas: 1890 },
//   { hora: "20:00", vendas: 2340 },
// ];

// const aiSalesChartConfig = {
//   vendas: {
//     label: "Vendas (R$)",
//     color: "#10b981",
// },
// } satisfies ChartConfig;

// Componente para o MINI gráfico de Mensagens por Hora (COMENTADO - não utilizado)
// function MiniHourlyMessagesChart() {
//   return (
//     <ChartContainer config={hourlyMessagesChartConfig} className="w-full h-20 sm:h-24 mt-2">
//       <AreaChart
//         accessibilityLayer
//         data={[
//           { hour: "18", total: 2 },
//           { hour: "19", total: 5 },
//           { hour: "20", total: 3 },
//           { hour: "21", total: 8 },
//           { hour: "22", total: 6 },
//           { hour: "23", total: 4 }
//         ]}
//         margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
//       >
//         <defs>
//           <linearGradient id="fillMiniHourlyTrend" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="white" stopOpacity={0.15} /> 
//             <stop offset="95%" stopColor="white" stopOpacity={0.01} />
//           </linearGradient>
//         </defs>
//         <Tooltip
//           cursor={{ stroke: 'white', strokeWidth: 1, strokeOpacity: 0.3 }}
//           content={({ active, payload, label }) => {
//             if (active && payload && payload.length) {
//               return (
//                 <div className="bg-black/80 border border-white/20 rounded-lg p-2 backdrop-blur-sm">
//                   <p className="text-white text-xs font-medium">{`${label}h`}</p>
//                   <p className="text-white/80 text-xs">
//                     {`${payload[0].value} ${payload[0].value === 1 ? 'mensagem' : 'mensagens'}`}
//                   </p>
//                 </div>
//               );
//             }
//             return null;
//           }}
//         />
//         <Area
//           dataKey="total"
//           type="natural"
//           fill="url(#fillMiniHourlyTrend)"
//           stroke="white"
//           strokeWidth={2}
//           dot={false}
//         />
//       </AreaChart>
//     </ChartContainer>
//   );
// }

// Funções de gráficos grandes removidas pois não estão sendo utilizadas

// export default async function DashboardPage() { // Modificado para Client Component
export default function DashboardHome() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { subscription, usage, loading: isLoadingSubscription, refreshSubscription } = useSubscription();
  const searchParams = useSearchParams();
  
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const firstName = user?.firstName || 'Usuário';
  const [currentDate, setCurrentDate] = useState('');

  const {
    instanceName: whatsAppInstanceName,
    connectionStatus: whatsAppConnectionStatus,
    isLoading: isLoadingWhatsApp,
    connectWhatsApp,
    disconnectWhatsApp,
    checkCurrentWhatsAppStatus,
  } = useWhatsApp();

  const [shopifyStatus, setShopifyStatus] = useState<{ connected: boolean; shop: string | null }>({ connected: false, shop: null });
  const [isLoadingShopifyStatus, setIsLoadingShopifyStatus] = useState<boolean>(true);
  const [openAIStatus, setOpenAIStatus] = useState<{ configured: boolean }>({ configured: false });
  const [isLoadingOpenAIStatus, setIsLoadingOpenAIStatus] = useState<boolean>(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [instanceStatusDetails, setInstanceStatusDetails] = useState<InstanceStatusDetails | null>(null);
  const [isLoadingStatusCheck, setIsLoadingStatusCheck] = useState<boolean>(false);
  const _messagesUsed = 350;
  
  // Estados para dados de conversões da IA
  const [aiConversions, setAiConversions] = useState<{
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    hourlyData: Array<{ hora: string; vendas: number }>;
  }>({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    hourlyData: []
  });

  // Estados para os filtros do card de conversões
  const [salesFilter, setSalesFilter] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  // Estados para o modal de seleção de planos
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // Estados para dados reais do dashboard
  const [dashboardStats, setDashboardStats] = useState({
    messagesToday: 0,
    whatsappMessagesToday: 0,
    playgroundMessagesToday: 0,
    hourlyData: [],
    usage: {
      planType: 'core',
      monthlyLimit: 500,
      messagesUsed: 0,
      usagePercentage: 0
    }
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Verificar status do WhatsApp quando o componente carregar
    if (user?.id) {
      checkCurrentWhatsAppStatus(false); // false = não mostrar loading
      fetchDashboardStats(); // Buscar estatísticas iniciais
      
      // Auto-refresh apenas a cada 5 minutos (em vez de 30 segundos)
      const interval = setInterval(() => {
        fetchDashboardStats();
      }, 5 * 60 * 1000); // 5 minutos
      
      return () => clearInterval(interval);
    }
  }, [user?.id, checkCurrentWhatsAppStatus]);
  
  useEffect(() => {
    // Formatar a data atual em português
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' }; // weekday: 'long' para nome completo
    setCurrentDate(today.toLocaleDateString('pt-BR', options).replace(/^./, str => str.toUpperCase())); // Capitaliza o dia da semana

    const handleFocus = () => {
      fetchShopifyStatusFromLocalStorage();
      fetchOpenAIStatusFromLocalStorage();
      // Também verificar WhatsApp quando a janela ganhar foco
      if (user?.id) {
        checkCurrentWhatsAppStatus(false);
      }
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LS_SHOPIFY_STATUS) {
        fetchShopifyStatusFromLocalStorage();
        }
      if (event.key === LS_OPENAI_STATUS) {
        fetchOpenAIStatusFromLocalStorage();
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    const fetchShopifyStatusFromLocalStorage = () => {
      setIsLoadingShopifyStatus(true);
      try {
        const storedShopify = localStorage.getItem(LS_SHOPIFY_STATUS);
        if (storedShopify) {
          const parsed = JSON.parse(storedShopify);
          setShopifyStatus({ connected: parsed.connected, shop: parsed.shop });
        } else {
          setShopifyStatus({ connected: false, shop: null });
        }
      } catch (error) {
        console.error("Erro ao carregar status do Shopify do localStorage:", error);
        setShopifyStatus({ connected: false, shop: null });
      }
      setIsLoadingShopifyStatus(false);
    };
    const fetchOpenAIStatusFromLocalStorage = () => {
      setIsLoadingOpenAIStatus(true);
      try {
        const storedOpenAI = localStorage.getItem(LS_OPENAI_STATUS);
        if (storedOpenAI) {
          const parsed = JSON.parse(storedOpenAI);
          setOpenAIStatus({ configured: parsed.configured });
        } else {
          setOpenAIStatus({ configured: false });
        }
      } catch (error) {
        console.error("Erro ao carregar status do OpenAI do localStorage:", error);
        setOpenAIStatus({ configured: false });
      }
      setIsLoadingOpenAIStatus(false);
    };
    fetchShopifyStatusFromLocalStorage();
    fetchOpenAIStatusFromLocalStorage();
    
    // Verificar se deve mostrar setup wizard
    checkFirstTimeUser();
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, checkCurrentWhatsAppStatus]);

  useEffect(() => {
    // Removed the setAnimatedProgress code as it's not defined
    // and not being used anywhere
  }, []);

  useEffect(() => {
    // Removed the setAnimatedProgress timer as the variable is not defined
  }, [_messagesUsed]);

  // useEffect para detectar retorno do Stripe e atualizar assinatura
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    const plan = searchParams.get('plan');
    
    if (upgrade === 'success' && plan) {
      console.log('[Dashboard] Detectado retorno do Stripe com sucesso:', { upgrade, plan });
      
      // Mostrar toast de sucesso
      toast.success(`Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} ativado com sucesso! 🎉`);
      
      // Forçar atualização da assinatura
      refreshSubscription().then(() => {
        console.log('[Dashboard] Assinatura atualizada após retorno do Stripe');
      }).catch((error) => {
        console.error('[Dashboard] Erro ao atualizar assinatura:', error);
      });
      
      // Limpar os parâmetros da URL sem recarregar a página
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, refreshSubscription]);

  const handleConnectWhatsApp = async () => {
    await connectWhatsApp();
  };

  const handleDisconnectWhatsApp = async () => {
    await disconnectWhatsApp();
  };

  const handleShowStatus = async () => {
    if (!whatsAppInstanceName) {
      toast.error("Nome da instância não encontrado. Conecte primeiro.");
      return;
    }
    setIsStatusModalOpen(true);
    setIsLoadingStatusCheck(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/whatsapp/instance/status/${whatsAppInstanceName}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao buscar status: ${response.status}`);
      }
      const data = await response.json();
      setInstanceStatusDetails(data);
      toast.success("Status da instância verificado com sucesso!")
    } catch (error: unknown) {
      console.error("Erro ao verificar status da instância:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setInstanceStatusDetails({ error: errorMessage });
      toast.error(`Erro ao verificar status: ${errorMessage}`);
    }
    setIsLoadingStatusCheck(false);
  };

  const IntegrationStatusIcon = ({ connected }: { connected: boolean }) => {
    return connected ? (
      <CheckCircle className="h-5 w-5 text-green-300" />
    ) : (
      <XCircle className="h-5 w-5 text-red-300" />
    );
  };

  // Função simples para verificar primeira vez
  const checkFirstTimeUser = () => {
    const hasSeenSetup = localStorage.getItem('nuvemx_setup_completed');
    const dontShow = localStorage.getItem('nuvemx_dont_show_setup');
    
    if (!hasSeenSetup && !dontShow) {
      // Delay pequeno para não mostrar imediatamente
      setTimeout(() => {
        setShowSetupWizard(true);
      }, 2000);
    }
  };

  // Handlers do Setup Wizard
  const handleSetupComplete = () => {
    setShowSetupWizard(false);
    localStorage.setItem('nuvemx_setup_completed', 'true');
  };

  const handleSetupClose = (dontShowAgain: boolean) => {
    setShowSetupWizard(false);
    if (dontShowAgain) {
      localStorage.setItem('nuvemx_dont_show_setup', 'true');
    }
  };

  // Função para verificar se todas as integrações estão ativas
  const areAllIntegrationsActive = () => {
    const whatsAppActive = whatsAppConnectionStatus === 'Conectado';
    const shopifyActive = shopifyStatus.connected;
    const openAIActive = openAIStatus.configured;
    
    return whatsAppActive && shopifyActive && openAIActive;
  };

  // Função para lidar com o clique no botão da IA
  const handleAIButtonClick = () => {
    if (areAllIntegrationsActive()) {
      // Se todas as integrações estão ativas, redirecionar para o playground
      window.location.href = '/dashboard/ia/playground';
    } else {
      // Se não estão todas ativas, abrir o Setup Wizard
      setShowSetupWizard(true);
    }
  };

  // const handleManageSubscription = async () => {
  //   try {
  //     await openCustomerPortal();
  //   } catch {
  //     toast.error("Erro ao abrir o portal de gerenciamento.");
  //   }
  // };

  // Função para criar checkout session com verificação de plano
  const createCheckoutSession = async (planType: string, billingCycle: 'monthly' | 'yearly') => {
    if (!subscription) {
      throw new Error('Dados da assinatura não encontrados');
    }
    
    // Determinar o tipo de plano que o usuário quer contratar
    const targetPlanType = billingCycle === 'yearly' ? `${planType}_annual` : planType;
    
    // Verificar se o usuário já tem este plano exato
    if (subscription.planType === targetPlanType) {
      toast.info('Você já possui este plano!');
      return null; // Retorna null em vez de string para indicar que não deve redirecionar
    }
    
    // Verificar se é tentativa de downgrade (não permitido por enquanto)
    const currentPlan = subscription.planType;
    const planHierarchy = {
      'core': 0,
      'neural': 1,
      'neural_annual': 1,
      'nimbus': 2,
      'nimbus_annual': 2
    };
    
    const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
    const targetLevel = planHierarchy[targetPlanType as keyof typeof planHierarchy] || 0;
    
    // Se é o mesmo nível mas diferente billing (mensal <-> anual), permitir
    const basePlan = currentPlan.replace('_annual', '');
    const targetBasePlan = targetPlanType.replace('_annual', '');
    
    if (currentLevel === targetLevel && basePlan === targetBasePlan) {
      // Permitir mudança entre mensal e anual do mesmo plano
    } else if (targetLevel < currentLevel) {
      toast.info('Para fazer downgrade, acesse o Portal de Gerenciamento através do botão "Gerenciar Plano".');
      return null;
    }
    
    const token = await getToken();
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planType: targetPlanType, billingCycle })
    });

    if (!response.ok) {
      throw new Error('Falha ao criar checkout session');
    }

    const data = await response.json();
    return data.url;
  };

  const PlanDetailsCard = () => {
    if (isLoadingSubscription) {
  return (
        <div className="flex items-center justify-center h-full">
          <Spinner variant="infinite" size={24} className="text-white" />
        </div>
      );
    }
    
    if (!subscription) {
      return <div className="text-center text-sm text-neutral-400">Não foi possível carregar os dados do plano.</div>;
    }

    // Garante que usage.total_actions é um número válido, mesmo se usage for null
    const totalActions = usage?.total_actions || 0;
    const monthlyLimit = subscription?.monthly_message_limit || 500;
    const usagePercentage = (totalActions / monthlyLimit) * 100;

    const planInfo = {
      core: { name: "Core", icon: <Sprout className="mr-1 h-3.5 w-3.5" />, badgeText: "Teste Grátis" },
      neural: { name: "Neural", icon: <Sparkles className="mr-1 h-3.5 w-3.5" />, badgeText: "Pro" },
      neural_annual: { name: "Neural", icon: <Sparkles className="mr-1 h-3.5 w-3.5" />, badgeText: "Pro Anual" },
      nimbus: { name: "Nimbus", icon: <Crown className="mr-1 h-3.5 w-3.5" />, badgeText: "Business" },
      nimbus_annual: { name: "Nimbus", icon: <Crown className="mr-1 h-3.5 w-3.5" />, badgeText: "Business Anual" }
    }[subscription.planType] || { name: "Core", icon: <Sprout className="mr-1 h-3.5 w-3.5" />, badgeText: "Teste Grátis" };

    return (
      <>
        <CardHeader className="flex flex-row items-center space-y-0 pb-0.5 px-0">
          <CardTitle className="text-lg font-semibold text-white">Plano Atual</CardTitle>
        </CardHeader>
        <CardContent className="px-0 flex flex-col flex-grow pb-4">
          <div className="bg-neutral-700/40 backdrop-blur-sm p-3 rounded-lg border border-neutral-500/50 mb-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-2xl font-bold text-white">{planInfo.name}</div>
              {planInfo && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {planInfo.icon}
                  {planInfo.badgeText}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white">{totalActions.toLocaleString()}</span>
            <span className="text-sm text-white/70 ml-1.5">/ {monthlyLimit.toLocaleString()} mensagens usadas</span>
          </div>
          <Progress 
  value={usagePercentage} 
  aria-label={`${usagePercentage.toFixed(0)}% used`} 
  className="mt-2.5 h-2.5 w-full max-w-xs bg-neutral-700/50 rounded-full"
  indicatorClassName="bg-green-400 rounded-full"
/>
          {subscription.current_period_end && (
            <p className="text-xs text-white/50 mt-2.5 leading-tight">
              Próxima renovação: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0.5 px-0 mt-auto w-full">
          <Button 
            onClick={() => setShowPlanModal(true)} 
            className="w-full h-8 px-3 text-xs bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg"
          >
            Gerenciar Plano
          </Button>
        </CardFooter>
      </>
    );
  };

  // Componente do Modal de Seleção de Planos (Estilo NuvemX.AI)
  const PlanSelectionModal = () => {
    const [selectedPlan, setSelectedPlan] = useState<'neural' | 'nimbus' | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isProcessing, setIsProcessing] = useState(false);

    const plans = [
      {
        id: 'neural' as const,
        name: 'Neural',
        description: 'Para negócios em crescimento',
        price: { monthly: 100, yearly: 960 },
        monthlyEquivalent: { monthly: 100, yearly: 80 },
        badge: 'Mais Popular',
        features: ['5.000 mensagens/mês', 'Configuração personalizada IA', 'Analytics básicos', 'Rastreamento envios']
      },
      {
        id: 'nimbus' as const,
        name: 'Nimbus', 
        description: 'Para empresas estabelecidas',
        price: { monthly: 200, yearly: 1920 },
        monthlyEquivalent: { monthly: 200, yearly: 160 },
        badge: 'Business',
        features: ['15.000 mensagens/mês', 'Analytics avançados', 'Histórico completo', 'Suporte prioritário']
      }
    ];

    // Função para verificar se um plano pode ser selecionado (COMENTADA - não utilizada)
    // const canSelectPlan = (planId: 'neural' | 'nimbus') => {
    //   if (!subscription) return true; // Se não tem subscription, pode selecionar qualquer um
      
    //   const targetPlanType = billingCycle === 'yearly' ? `${planId}_annual` : planId;
    //   const currentPlan = subscription.planType;
      
    //   // Se é o mesmo plano, não pode "selecionar" novamente
    //   if (currentPlan === targetPlanType) return false;
      
    //   const planHierarchy = {
    //     'core': 0,
    //     'neural': 1,
    //     'neural_annual': 1,
    //     'nimbus': 2,
    //     'nimbus_annual': 2
    //   };
      
    //   const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
    //   const targetLevel = planHierarchy[targetPlanType as keyof typeof planHierarchy] || 0;
      
    //   // Se é o mesmo nível mas diferente billing (mensal <-> anual), permitir
    //   const basePlan = currentPlan.replace('_annual', '');
    //   const targetBasePlan = targetPlanType.replace('_annual', '');
      
    //   if (currentLevel === targetLevel && basePlan === targetBasePlan) {
    //     return true; // Permitir mudança entre mensal e anual do mesmo plano
    //   }
      
    //   // Só pode selecionar planos superiores
    //   return targetLevel >= currentLevel;
    // };

    // Função para obter o status do plano
    const getPlanStatus = (planId: 'neural' | 'nimbus') => {
      if (!subscription) return null;
      
      const targetPlanType = billingCycle === 'yearly' ? `${planId}_annual` : planId;
      const currentPlan = subscription.planType;
      
      if (currentPlan === targetPlanType) {
        return 'current';
      }
      
      const planHierarchy = {
        'core': 0,
        'neural': 1,
        'neural_annual': 1,
        'nimbus': 2,
        'nimbus_annual': 2
      };
      
      const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
      const targetLevel = planHierarchy[targetPlanType as keyof typeof planHierarchy] || 0;
      
      const basePlan = currentPlan.replace('_annual', '');
      const targetBasePlan = targetPlanType.replace('_annual', '');
      
      if (currentLevel === targetLevel && basePlan === targetBasePlan) {
        return 'same_tier'; // Mesmo plano, billing diferente
      }
      
      if (targetLevel < currentLevel) {
        return 'downgrade';
      }
      
      return 'upgrade';
    };

    const handleConfirmSelection = async () => {
      if (!selectedPlan || !subscription) return;
      
      const planStatus = getPlanStatus(selectedPlan);
      
      // Se é o plano atual, redirecionar para dashboard
      if (planStatus === 'current') {
        toast.info('Este é seu plano atual!');
        setShowPlanModal(false);
        window.location.href = '/dashboard';
        return;
      }
      
      // Se é tentativa de downgrade, mostrar mensagem e fechar modal
      if (planStatus === 'downgrade') {
        toast.info('Para fazer downgrade, acesse o Portal de Gerenciamento através do botão "Gerenciar Plano".');
        setShowPlanModal(false);
        return;
      }
      
      setIsProcessing(true);
      try {
        const checkoutUrl = await createCheckoutSession(selectedPlan, billingCycle);
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setIsProcessing(false);
          setShowPlanModal(false);
        }
      } catch (error) {
        console.error('Erro ao criar checkout:', error);
        toast.error('Erro ao processar upgrade. Tente novamente.');
        setIsProcessing(false);
      }
    };

    return (
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mx-4">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              Escolha Seu Plano
            </DialogTitle>
            <p className="text-white/70 text-sm">
              Selecione o plano perfeito para suas necessidades. Faça upgrade ou downgrade a qualquer momento.
            </p>
          </DialogHeader>

          {/* Toggle Mensal/Anual */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex border border-white/20">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white/20 text-white shadow-sm border border-white/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white/20 text-white shadow-sm border border-white/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Anual
              </button>
            </div>
          </div>

          {/* Cards dos Planos */}
          <div className="space-y-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const price = billingCycle === 'yearly' ? plan.monthlyEquivalent.yearly : plan.monthlyEquivalent.monthly;
              const totalPrice = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all backdrop-blur-sm ${
                    isSelected
                      ? 'border-white/50 bg-white/10'
                      : 'border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-white text-black px-2 py-1 rounded-full text-xs font-medium">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Checkbox */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-white border-white' 
                        : 'border-white/40'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-3 h-3 text-black" />
                      )}
                    </div>
                  </div>

                  <div className="pr-8">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-white/70 mb-3">{plan.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">R${price}</span>
                        <span className="text-white/70">/mês</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-green-400">
                          R${totalPrice}/ano (pago anualmente)
                        </p>
                      )}
                    </div>

                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-white/80">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowPlanModal(false)}
              className="flex-1 border-white/30 text-white/80 hover:bg-white/10 hover:border-white/50 bg-transparent"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedPlan || isProcessing}
              className="flex-1 bg-white hover:bg-white/90 text-black font-medium"
            >
              {isProcessing ? 'Processando...' : 'Confirmar Seleção'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Função para buscar dados de conversões da IA
  const fetchAiConversions = async (period: 'today' | 'week' | 'month' = 'today') => {
    try {
      const response = await fetch(`/api/analytics/ai-conversions?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiConversions(data);
      } else {
        console.error('Erro ao buscar conversões da IA:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar conversões da IA:', error);
    }
  };

  // Função para formatar valores monetários brasileiros
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // useEffect para buscar dados quando o filtro mudar
  useEffect(() => {
    const periodMap = {
      'hoje': 'today',
      'semana': 'week', 
      'mes': 'month'
    };
    fetchAiConversions(periodMap[salesFilter] as 'today' | 'week' | 'month');
  }, [salesFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Função para buscar estatísticas reais do dashboard
  const fetchDashboardStats = async () => {
    if (!user?.id) {
      console.log('[Dashboard] ❌ User ID não disponível');
      return;
    }
    
    try {
      console.log('[Dashboard] 🔄 Buscando estatísticas...');
      setIsLoadingStats(true);
      const token = await getToken();
      
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[Dashboard] Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('[Dashboard] ✅ Estatísticas carregadas:', result.data);
        console.log('[Dashboard] 📊 Dados do gráfico:', result.data.hourlyData);
        setDashboardStats(result.data);
      } else {
        const errorData = await response.text();
        console.error('[Dashboard] ❌ Erro ao buscar estatísticas:', response.status, errorData);
      }
    } catch (error) {
      console.error('[Dashboard] ❌ Erro de rede ao buscar estatísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/25 -mt-20 pt-20">
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 md:pt-6 bg-transparent">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <LiquidGlassCard className="lg:col-span-1 flex flex-col gap-y-3 p-3">
            <BlurFade delay={0.1} inView>
              <div>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-white">
                    Bem-vindo, {firstName}
                  </h2>
                  <span className="text-2xl ml-2">👋</span>
                </div>
                <p className="text-sm text-[#e1e1e1] mt-1">
                  {currentDate}
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.25} inView>
              <div className="relative z-10 flex flex-col p-2 gap-y-1 bg-black/20 rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 px-0">
                  <CardTitle className="text-sm font-semibold text-white">
                  Mensagens Hoje
                </CardTitle>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fetchDashboardStats()}
                      disabled={isLoadingStats}
                      className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                      title="Atualizar estatísticas"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                    </button>
                  <MessageSquare className="h-6 w-6 text-white/80" />
                  </div>
              </CardHeader>
                <CardContent className="px-0 flex flex-col">
                  <div className="text-2xl font-bold text-white leading-none">
                    {isLoadingStats ? (
                      <Spinner variant="infinite" size={20} className="text-white" />
                    ) : (
                      <NumberTicker value={dashboardStats.messagesToday} className="text-white" />
                    )}
                </div>
                  <p className="text-xs text-white/60 leading-tight mt-0.5">
                  Respostas enviadas pela IA
                </p>
                  {!isLoadingStats && dashboardStats.hourlyData.length > 0 && (
                    <ChartContainer config={hourlyMessagesChartConfig} className="w-full h-20 sm:h-24 mt-2">
                      <AreaChart
                        accessibilityLayer
                        data={dashboardStats.hourlyData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="fillRealHourlyTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="white" stopOpacity={0.15} /> 
                            <stop offset="95%" stopColor="white" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          cursor={{ stroke: 'white', strokeWidth: 1, strokeOpacity: 0.3 }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-black/80 border border-white/20 rounded-lg p-2 backdrop-blur-sm">
                                  <p className="text-white text-xs font-medium">{`${label}h`}</p>
                                  <p className="text-white/80 text-xs">
                                    {`${payload[0].value} ${payload[0].value === 1 ? 'mensagem' : 'mensagens'}`}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          dataKey="total"
                          type="natural"
                          fill="url(#fillRealHourlyTrend)"
                          stroke="white"
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                  {!isLoadingStats && dashboardStats.hourlyData.length === 0 && (
                    <div className="w-full h-16 sm:h-20 mt-2 flex items-center justify-center">
                      <p className="text-xs text-white/40">Sem dados suficientes para gráfico</p>
                    </div>
                  )}
              </CardContent>
            </div>
            </BlurFade>
          </LiquidGlassCard>

          <LiquidGlassCard className="lg:col-span-1">
            <BlurFade delay={0.35} inView>
              <div className="relative z-10 flex flex-col h-full p-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                  <CardTitle className="text-lg font-semibold text-white">
                  Conexão WhatsApp
                </CardTitle>
                  <WhatsAppIcon className="h-6 w-6 text-white/80" />
              </CardHeader>
                
                <CardContent className="px-0 flex-grow flex flex-col items-center justify-center min-h-[120px]">
              {isLoadingWhatsApp ? (
                    <div className="flex flex-col items-center justify-center">
                      <Spinner variant="infinite" size={32} className="text-white mb-2" />
                      <p className="text-sm text-white/60">Verificando conexão...</p>
                </div>
                  ) : whatsAppConnectionStatus === 'Conectado' ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <p className="text-lg font-semibold text-green-300 leading-none">
                    Conectado
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        WhatsApp ativo e funcionando
                      </p>
                </div>
                ) : (
                  <div className="text-center">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="h-6 w-6 text-red-400" />
                      </div>
                      <p className="text-lg font-semibold text-red-300 leading-none">
                    Desconectado
                    </p>
                      <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
                        Conecte para começar a usar a IA
                    </p>
                </div>
                )}
              </CardContent>
                
                <CardFooter className="flex flex-col gap-2 px-0 pt-4 mt-auto border-t border-white/10">
                {isLoadingWhatsApp ? (
                    <Button disabled className="w-full h-9 bg-white/5 text-neutral-400 rounded-lg">
                      <Spinner variant="infinite" size={16} className="mr-2 text-white" /> 
                      Verificando...
                    </Button>
                  ) : whatsAppConnectionStatus === 'Conectado' ? (
                    <>
                      <Button 
                        onClick={handleDisconnectWhatsApp} 
                        className="w-full h-9 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-400/30 hover:border-red-400/50 rounded-lg"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> 
                        Desconectar
                    </Button>
                      <Button 
                        onClick={handleShowStatus} 
                        variant="outline"
                        className="w-full h-8 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg"
                      >
                        <Activity className="mr-2 h-4 w-4" /> 
                        Ver Status
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={handleConnectWhatsApp} 
                        className="w-full h-9 bg-green-500/10 hover:bg-green-500/20 text-green-300 hover:text-green-200 border border-green-400/30 hover:border-green-400/50 rounded-lg"
                      >
                        <Smartphone className="mr-2 h-4 w-4" /> 
                        Conectar WhatsApp
                    </Button>
                      <Button 
                        onClick={handleShowStatus} 
                        variant="outline"
                        className="w-full h-8 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg"
                      >
                        <Activity className="mr-2 h-4 w-4" /> 
                        Ver Status
                </Button>
                    </>
                  )}
              </CardFooter>
            </div>
            </BlurFade>
          </LiquidGlassCard>

          <LiquidGlassCard className="lg:col-span-1 relative overflow-hidden">
            <BlurFade delay={0.4} inView>
              <div className="flex flex-col h-full min-h-[280px] p-4">
                {/* AIOrb movida um pouco para cima */}
                <div className="flex items-center justify-center flex-1 -mt-4">
                <AIOrb />
                </div>
                
                {/* Botão pequeno embaixo - Dinâmico baseado no status das integrações */}
                <div className="flex justify-center pb-2">
                  {areAllIntegrationsActive() ? (
                    <Button 
                      onClick={handleAIButtonClick}
                      size="sm" 
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30 hover:border-green-400/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      IA Ativa
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAIButtonClick}
                      size="sm" 
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-lg"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Começar
                  </Button>
                  )}
                </div>
              </div>
            </BlurFade>
          </LiquidGlassCard>

          <LiquidGlassCard className="lg:col-span-1">
            <BlurFade delay={0.55} inView>
              <div className="relative z-10 flex flex-col h-full p-3 gap-y-2">
                <PlanDetailsCard />
            </div>
            </BlurFade>
          </LiquidGlassCard>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
          <LiquidGlassCard className="max-h-fit h-auto min-h-0">
            <BlurFade delay={0.45} inView>
              <div className="relative z-10 flex flex-col p-3">
                <CardHeader className="pb-0.5 px-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">Conversões da IA</CardTitle>
                      <CardDescription className="max-w-lg text-balance leading-tight text-xs text-white/80 mt-0.5">
                        Desempenho de vendas geradas pela inteligência artificial.
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {(['hoje', 'semana', 'mes'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSalesFilter(filter)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-md transition-all",
                            salesFilter === filter
                              ? "bg-white/20 text-white font-medium"
                              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                          )}
                        >
                          {filter === 'hoje' ? 'Hoje' : filter === 'semana' ? 'Semana' : 'Mês'}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 px-0">
                  {/* Vendas em destaque com R$ */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-3">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-green-300">
                        R$ <NumberTicker value={aiConversions.totalSales} className="text-green-300" />
                      </span>
                      <span className="text-xs text-green-400 ml-1">
                        {salesFilter === 'hoje' ? 'hoje' : salesFilter === 'semana' ? 'esta semana' : 'este mês'}
                      </span>
                    </div>
                     <p className="text-xs text-white/60 mt-1">{aiConversions.totalOrders} pedidos • {formatCurrency(aiConversions.averageTicket)} ticket médio</p>
                  </div>

                  {/* Gráfico de vendas por hora */}
                  <div className="mt-4 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={aiConversions.hourlyData}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="hora" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#ffffff60' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="vendas" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          fill="url(#salesGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                </CardContent>
            </div>
            </BlurFade>
          </LiquidGlassCard>

          <LiquidGlassCard className="col-span-1 md:col-span-2 lg:col-span-1 max-h-fit h-auto min-h-0">
            <BlurFade delay={0.75} inView>
              <div className="relative z-10 flex flex-col p-3">
                <CardHeader className="pb-0.5 px-0">
                  <CardTitle className="text-lg font-semibold text-white">Integrações Ativas</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-tight text-xs text-white/80 mt-0.5">
                    Conecte suas plataformas para automatizar respostas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-0">
                <Link
                  href="/dashboard/integracoes?tab=whatsapp"
                    className="group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center">
                      <WhatsAppIcon className="mr-2 h-6 w-6 text-white/80" />
                      <span className="font-medium text-sm text-white leading-normal group-hover:underline">WhatsApp</span>
                  </div>
                  {isLoadingWhatsApp ? <Spinner variant="infinite" size={16} className="text-white" /> : <IntegrationStatusIcon connected={whatsAppConnectionStatus === 'Conectado'} />}
                </Link>
                <Link
                    href="/dashboard/integracoes?tab=shopify"
                      className="group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-white/10"
                >
                    <div className="flex items-center">
                          <ShopifyIcon className="mr-2 h-6 w-6 text-white/80" />
                          <span className="font-medium text-sm text-white leading-normal group-hover:underline">Shopify</span>
                    </div>
                    {isLoadingShopifyStatus ? <Spinner variant="infinite" size={16} className="text-white" /> : <IntegrationStatusIcon connected={shopifyStatus.connected} />}
                </Link>
                <Link
                    href="/dashboard/integracoes?tab=openai"
                      className="group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-white/10"
                >
                    <div className="flex items-center">
                          <OpenAiIcon className="mr-2 h-6 w-6 text-white/80" />
                          <span className="font-medium text-sm text-white leading-normal group-hover:underline">OpenAI</span>
                    </div>
                    {isLoadingOpenAIStatus ? <Spinner variant="infinite" size={16} className="text-white" /> : <IntegrationStatusIcon connected={openAIStatus.configured} />}
                </Link>
              </CardContent>
                 <CardFooter className="pt-0.5 px-0">
                  <Button asChild className="w-full h-8 px-3 text-xs bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/20 hover:border-white/30 rounded-lg">
                    <Link href="/dashboard/integracoes">
                          <LayoutGrid className="mr-1.5 h-4 w-4" /> Acessar Integrações
                    </Link>
                </Button>
              </CardFooter>
            </div>
            </BlurFade>
          </LiquidGlassCard>
        </div>
      </div>



      {isStatusModalOpen && (
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-white/90 flex items-center gap-2">
                <WhatsAppIcon className="h-5 w-5 text-green-400" />
                Status da Instância WhatsApp
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {isLoadingStatusCheck ? (
                <div className="flex justify-center items-center h-20">
                  <Spinner variant="infinite" size={20} className="text-white" />
                  <span className="ml-2 text-white/70">Verificando status...</span>
                </div>
              ) : instanceStatusDetails ? (
                <div className="space-y-4">
                  {/* Status Principal */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">Status da Conexão</h3>
                      {instanceStatusDetails?.status === 'Conectado' || instanceStatusDetails?.instance?.state === 'open' ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Conectado</span>
                        </div>
                      ) : instanceStatusDetails?.status === 'Erro' || instanceStatusDetails?.instance?.state === 'Erro' ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Erro</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Aguardando</span>
                        </div>
                      )}
                    </div>
                    
                    {instanceStatusDetails?.instance?.instanceName && (
                      <div className="text-xs text-white/60 mb-2">
                        <span className="font-medium">Instância:</span> {instanceStatusDetails.instance.instanceName}
                      </div>
                    )}
                    
                    {instanceStatusDetails?.instance?.state && (
                      <div className="text-xs text-white/60">
                        <span className="font-medium">Estado:</span> {instanceStatusDetails.instance.state}
                      </div>
                    )}
                  </div>

                  {/* Detalhes Técnicos */}
                  {(instanceStatusDetails?.instance || instanceStatusDetails?.message) && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Detalhes Técnicos
                      </h3>
                      
                      {instanceStatusDetails?.message && (
                        <div className="mb-3 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                          <div className="text-xs text-blue-300 font-medium mb-1">Mensagem do Sistema</div>
                          <div className="text-xs text-white/70">{instanceStatusDetails.message}</div>
                        </div>
                      )}
                      
                      {instanceStatusDetails?.instance?.last_status_reason && 
                       !instanceStatusDetails.instance.last_status_reason.includes('Evolution API Error') && (
                        <div className="mb-3 p-3 bg-orange-500/10 border border-orange-400/20 rounded-lg">
                          <div className="text-xs text-orange-300 font-medium mb-1">Última Razão de Status</div>
                          <div className="text-xs text-white/70">{instanceStatusDetails.instance.last_status_reason}</div>
                        </div>
                      )}
                      
                      {instanceStatusDetails?.instance?.qr_received_at && (
                        <div className="text-xs text-white/60 mb-2">
                          <span className="font-medium">QR Recebido em:</span> {new Date(instanceStatusDetails.instance.qr_received_at).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informações de Erro Simplificadas */}
                  {instanceStatusDetails?.error && !instanceStatusDetails.error.includes('Evolution API Error') && (
                    <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
                      <h3 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Erro de Conexão
                      </h3>
                      <div className="text-xs text-white/70">
                        Houve um problema na conexão do WhatsApp. Tente reconectar.
                      </div>
                    </div>
                  )}

                  {/* Erro genérico quando há problema interno */}
                  {(instanceStatusDetails?.error?.includes('Evolution API Error') || 
                    instanceStatusDetails?.instance?.last_status_reason?.includes('Evolution API Error')) && (
                    <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
                      <h3 className="text-red-300 font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Erro de Conexão
                      </h3>
                      <div className="text-xs text-white/70">
                        Não foi possível conectar ao WhatsApp. Verifique sua conexão e tente novamente.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white/70">Nenhum detalhe de status disponível.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setIsStatusModalOpen(false)} 
                variant="outline" 
                className="text-white/80 bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 rounded-lg"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

       {/* Setup Wizard - Popup simples */}
       {showSetupWizard && (
         <SetupWizard
           onComplete={handleSetupComplete}
           onClose={handleSetupClose}
         />
      )}

      {/* Plan Selection Modal */}
      <PlanSelectionModal />
    </div>
  );
}