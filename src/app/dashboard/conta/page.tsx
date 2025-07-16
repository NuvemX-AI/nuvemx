'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Settings, ExternalLink } from 'lucide-react';
import { LiquidGlassCard } from '@/app/components/ui/LiquidGlassCard';
import { ComponentV2 as EtherealShadowHeroContentWrapper } from '@/components/ui/etheral-shadow-v2';
import { ShimmerButton } from '@/components/ui/shimmer-button';

interface Invoice {
  id: string;
  number: string;
  created: number;
  amount_paid: number;
  currency: string;
  status: string;
  hosted_invoice_url?: string;
}

export default function ContaPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/stripe/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        console.error('Erro ao carregar faturas:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (loadingPortal) return;
    
    setLoadingPortal(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.open(data.url, '_blank');
        } else {
          console.error('URL do portal não encontrada na resposta');
        }
      } else {
        console.error('Erro ao criar sessão do portal:', response.status);
        const errorText = await response.text();
        console.error('Resposta do erro:', errorText);
      }
    } catch (error) {
      console.error('Erro ao abrir portal de gerenciamento:', error);
    } finally {
      setLoadingPortal(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase() === 'USD' ? 'BRL' : currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      paid: { label: 'Pago', color: 'bg-green-500 text-white' },
      open: { label: 'Pendente', color: 'bg-yellow-500 text-black' },
      draft: { label: 'Rascunho', color: 'bg-gray-500 text-white' },
      void: { label: 'Cancelado', color: 'bg-red-500 text-white' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500 text-white' };
    
    return (
      <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Fundo escuro que se estende por toda a página */}
      <div className="fixed inset-0 bg-black/20 z-0"></div>
      
      {/* Fundo etéreo que se estende até atrás da navbar */}
      <div className="fixed inset-0 z-0">
        <EtherealShadowHeroContentWrapper sizing="stretch" className="opacity-30" />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto">
        {/* Card único com tudo dentro */}
        <LiquidGlassCard className="p-8">
          {/* Título e descrição dentro do card */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">Conta</h1>
              <p className="text-gray-200 mt-3 text-xl">Gerencie sua assinatura e histórico de cobrança</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} • Próxima fatura
            </h3>
          </div>
          
          <div className="text-5xl font-black text-white drop-shadow-lg mb-8">R$ 0,00</div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-white font-bold text-xl">Histórico de cobrança</span>
              <ShimmerButton
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="inline-flex items-center gap-2 px-6 py-3 font-bold"
                shimmerColor="#10B981"
                background="rgba(16, 185, 129, 0.1)"
                borderRadius="12px"
              >
                <Settings className="w-4 h-4" />
                {loadingPortal ? 'Carregando...' : 'Gerenciar assinatura'}
              </ShimmerButton>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-white text-lg">Carregando faturas...</div>
              </div>
            ) : invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/30">
                      <th className="text-left py-4 px-2 text-white font-bold text-lg">Data</th>
                      <th className="text-left py-4 px-2 text-white font-bold text-lg">Status</th>
                      <th className="text-right py-4 px-2 text-white font-bold text-lg">Quantia</th>
                      <th className="text-center py-4 px-2 text-white font-bold text-lg">Fatura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-white/20 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-2 text-white font-medium">
                          {formatDate(invoice.created)}
                        </td>
                        <td className="py-4 px-2">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-4 px-2 text-right text-white font-bold">
                          {formatCurrency(invoice.amount_paid, invoice.currency)}
                        </td>
                        <td className="py-4 px-2 text-center">
                          {invoice.hosted_invoice_url && (
                            <ShimmerButton
                              onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                              className="inline-flex items-center gap-2 px-3 py-1 text-sm"
                              shimmerColor="#3B82F6"
                              background="rgba(59, 130, 246, 0.1)"
                              borderRadius="8px"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Visualizar
                            </ShimmerButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-300 text-lg">Nenhum resultado</div>
              </div>
            )}
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
} 