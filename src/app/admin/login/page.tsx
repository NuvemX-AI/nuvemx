'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { LiquidGlassCard } from '@/app/components/ui/LiquidGlassCard';
import { BlurFade } from '@/app/components/magicui/blur-fade';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();

  // Verificar se já está logado como admin
  useEffect(() => {
    const verifyAdminToken = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Token válido, redirecionar para dashboard admin
          router.push('/admin/dashboard');
        } else {
          // Token inválido, remover do localStorage
          localStorage.removeItem('admin_token');
          setIsVerifying(false);
        }
      } catch (error) {
        console.error('Erro ao verificar token admin:', error);
        localStorage.removeItem('admin_token');
        setIsVerifying(false);
      }
    };

    verifyAdminToken();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        // Salvar token no localStorage
        localStorage.setItem('admin_token', data.token);
        
        toast.success('Login realizado com sucesso!');
        
        // Redirecionar para dashboard admin
        router.push('/admin/dashboard');
      } else {
        toast.error(data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login admin:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
          <span>Verificando acesso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <BlurFade delay={0.1} inView>
        <LiquidGlassCard className="w-full max-w-md p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Admin Login
                </h1>
                <p className="text-gray-300 text-sm">
                  NuvemX.AI - Área Administrativa
                </p>
              </div>

              <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 p-3 rounded-lg">
                <Lock className="w-4 h-4" />
                <span>Acesso restrito a administradores</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Usuário
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>

            {/* Info */}
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Apenas administradores autorizados podem acessar esta área
              </p>
            </div>
          </form>
        </LiquidGlassCard>
      </BlurFade>
    </div>
  );
} 