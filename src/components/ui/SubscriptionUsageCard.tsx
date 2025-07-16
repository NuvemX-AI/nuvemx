"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSubscription, planConfigs } from '@/contexts/SubscriptionContext';
import { Zap, Crown, Sparkles, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ComponentV2 as EtherealShadowHeroContentWrapper } from "@/components/ui/etheral-shadow-v2";

export default function SubscriptionUsageCard() {
  const { subscription, usage, loading, error, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  const handleUpgrade = async (planType: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      setUpgradeLoading(`${planType}_${billingCycle}`);
      const checkoutUrl = await createCheckoutSession(planType, billingCycle);
      window.location.href = checkoutUrl;
    } catch (error) {
      toast.error('Erro ao iniciar upgrade. Tente novamente.');
      console.error('Erro no upgrade:', error);
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error('Erro ao abrir portal de gerenciamento. Tente novamente.');
      console.error('Erro no portal:', error);
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'core': return 'bg-gray-500';
      case 'neural': 
      case 'neural_annual': return 'bg-blue-500';
      case 'nimbus': 
      case 'nimbus_annual': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'core': return <Zap className="w-4 h-4" />;
      case 'neural': 
      case 'neural_annual': return <Sparkles className="w-4 h-4" />;
      case 'nimbus': 
      case 'nimbus_annual': return <Crown className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const formatPlanName = (planType: string) => {
    const config = planConfigs[planType as keyof typeof planConfigs];
    return config ? config.name : 'Plano Desconhecido';
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-transparent border-neutral-800">
        <EtherealShadowHeroContentWrapper className="absolute inset-0 z-0" sizing="stretch" />
        <CardContent className="relative z-10 p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden bg-transparent border-red-800">
        <EtherealShadowHeroContentWrapper className="absolute inset-0 z-0" sizing="stretch" />
        <CardContent className="relative z-10 p-6">
          <div className="text-center text-red-400">
            <p className="font-medium">Erro ao carregar dados da assinatura</p>
            <p className="text-sm mt-1 opacity-70">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const usagePercentage = usage ? (usage.total_actions / subscription.monthly_message_limit) * 100 : 0;
  const isNearLimit = usagePercentage >= 80;
  const isPlanCore = subscription.planType === 'core';

  return (
    <Card className="relative overflow-hidden bg-transparent border-neutral-800">
      <EtherealShadowHeroContentWrapper className="absolute inset-0 z-0" sizing="stretch" />
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Uso da Assinatura</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${getPlanBadgeColor(subscription.planType)} text-white`}>
              {getPlanIcon(subscription.planType)}
              <span className="ml-1">{formatPlanName(subscription.planType)}</span>
            </Badge>
            {subscription.planType !== 'core' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                className="border-neutral-700 hover:bg-neutral-800"
              >
                <Settings2 className="w-4 h-4 mr-1" />
                Gerenciar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Uso atual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Mensagens utilizadas</span>
            <span className="font-medium">
              {usage ? usage.total_actions.toLocaleString() : 0} / {subscription.monthly_message_limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${isNearLimit ? 'bg-orange-100' : 'bg-neutral-800'}`}
          />
          {isNearLimit && (
            <p className="text-xs text-orange-400">
              ⚠️ Você está próximo do limite do seu plano
            </p>
          )}
        </div>

        {/* Breakdown do uso */}
        {usage && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <div className="text-neutral-400">WhatsApp</div>
              <div className="font-medium text-lg">{usage.whatsapp_messages.toLocaleString()}</div>
            </div>
            <div className="bg-neutral-800/30 rounded-lg p-3">
              <div className="text-neutral-400">Playground</div>
              <div className="font-medium text-lg">{usage.ai_interactions.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Botões de upgrade para plano Core */}
        {isPlanCore && (
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <p className="text-sm text-neutral-400">
              Upgrade para desbloquear mais recursos
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Neural */}
              <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="font-medium">Neural</p>
                    <p className="text-xs text-neutral-400">5.000 mensagens/mês</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade('neural', 'monthly')}
                    disabled={upgradeLoading === 'neural_monthly'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {upgradeLoading === 'neural_monthly' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>R$ 100/mês</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpgrade('neural', 'yearly')}
                    disabled={upgradeLoading === 'neural_yearly'}
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    {upgradeLoading === 'neural_yearly' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>R$ 960/ano</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Nimbus */}
              <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-medium">Nimbus</p>
                    <p className="text-xs text-neutral-400">15.000 mensagens/mês</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade('nimbus', 'monthly')}
                    disabled={upgradeLoading === 'nimbus_monthly'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {upgradeLoading === 'nimbus_monthly' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>R$ 200/mês</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpgrade('nimbus', 'yearly')}
                    disabled={upgradeLoading === 'nimbus_yearly'}
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  >
                    {upgradeLoading === 'nimbus_yearly' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>R$ 1.920/ano</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações adicionais para planos pagos */}
        {!isPlanCore && subscription.current_period_end && (
          <div className="pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Próxima renovação:</span>
              <span className="font-medium">
                {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 