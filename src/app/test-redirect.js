// Script de teste para verificar redirecionamento de planos
// Cole este código no console do navegador para testar

window.testPlanRedirect = {
  // Simular seleção de plano
  selectPlan: (planId = 'neural', billingCycle = 'monthly') => {
    const selectedPlan = {
      planId,
      billingCycle,
      timestamp: Date.now()
    };
    
    console.log('🔄 Simulando seleção de plano:', selectedPlan);
    
    // Salvar em ambos os storages
    const planJson = JSON.stringify(selectedPlan);
    sessionStorage.setItem('selectedPlan', planJson);
    localStorage.setItem('selectedPlan', planJson);
    
    console.log('✅ Plano salvo nos storages');
    console.log('📦 SessionStorage:', sessionStorage.getItem('selectedPlan'));
    console.log('📦 LocalStorage:', localStorage.getItem('selectedPlan'));
  },

  // Verificar storages
  checkStorages: () => {
    console.log('🔍 Verificando storages...');
    console.log('📦 SessionStorage:', sessionStorage.getItem('selectedPlan'));
    console.log('📦 LocalStorage:', localStorage.getItem('selectedPlan'));
  },

  // Limpar storages
  clearStorages: () => {
    sessionStorage.removeItem('selectedPlan');
    localStorage.removeItem('selectedPlan');
    console.log('🗑️ Storages limpos');
  },

  // Simular evento de auto-checkout
  triggerAutoCheckout: (planId = 'neural', billingCycle = 'monthly') => {
    console.log('🚀 Disparando evento autoCheckout...');
    const event = new CustomEvent('autoCheckout', {
      detail: { planId, billingCycle }
    });
    window.dispatchEvent(event);
  },

  // Verificar se hooks estão sendo executados
  checkHooks: () => {
    console.log('🔧 Para verificar se os hooks estão funcionando:');
    console.log('1. Abra as DevTools');
    console.log('2. Vá para a aba Console');
    console.log('3. Procure por mensagens que começam com [usePlanRedirect] ou [useAutoCheckout]');
    console.log('4. Se não vir essas mensagens, os hooks não estão sendo executados');
  }
};

console.log('🧪 Script de teste carregado!');
console.log('📖 Comandos disponíveis:');
console.log('- testPlanRedirect.selectPlan() - Simular seleção de plano');
console.log('- testPlanRedirect.checkStorages() - Verificar storages');
console.log('- testPlanRedirect.clearStorages() - Limpar storages');
console.log('- testPlanRedirect.triggerAutoCheckout() - Disparar auto-checkout');
console.log('- testPlanRedirect.checkHooks() - Verificar hooks'); 