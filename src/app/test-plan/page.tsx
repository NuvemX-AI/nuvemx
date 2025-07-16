"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function TestPlanPage() {
  const { userId, isLoaded } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<string | null>(null);

  useEffect(() => {
    // Verificar localStorage a cada segundo
    const interval = setInterval(() => {
      const data = localStorage.getItem('selectedPlan');
      setLocalStorageData(data);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const simulateSelectPlan = () => {
    const selectedPlan = {
      planId: 'neural',
      billingCycle: 'monthly',
      timestamp: Date.now()
    };
    
    console.log('Salvando plano de teste:', selectedPlan);
    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
  };

  const clearPlan = () => {
    localStorage.removeItem('selectedPlan');
    console.log('Plano removido do localStorage');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Redirecionamento de Planos</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Status de Autenticação</h2>
          <p>IsLoaded: {isLoaded ? 'true' : 'false'}</p>
          <p>UserId: {userId || 'null'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">LocalStorage</h2>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
            {localStorageData || 'null'}
          </p>
        </div>

        <div className="space-x-4">
          <button 
            onClick={simulateSelectPlan}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Simular Seleção de Plano
          </button>
          
          <button 
            onClick={clearPlan}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Limpar Plano
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Instruções</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Se não estiver logado, faça login</li>
            <li>Clique em &quot;Simular Seleção de Plano&quot;</li>
            <li>Faça logout</li>
            <li>Faça login novamente</li>
            <li>Observe se o redirecionamento acontece</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 