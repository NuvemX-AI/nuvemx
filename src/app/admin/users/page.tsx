'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTopNav } from '@/app/components/admin/AdminTopNav';
import { 
  Users, 
  Search, 
  Filter, 
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  Settings,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  CreditCard,
  Smartphone,
  Globe,
  Shield,
  X
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: 'core' | 'neural' | 'nimbus';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  totalSpent: number;
  usage: {
    current: number;
    limit: number;
  };
  avatar?: string;
  location?: string;
  integrations: {
    shopify: boolean;
    whatsapp: boolean;
    openai: boolean;
  };
  metrics: {
    totalMessages: number;
    totalTickets: number;
    satisfaction: number;
    lastActivity: string;
  };
  tickets: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const apiUsers = await response.json();
      
      // Transformar dados da API para o formato esperado pelo frontend
      const transformedUsers: UserData[] = apiUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        plan: user.plan as 'core' | 'neural' | 'nimbus',
        status: user.status === 'online' ? 'active' : user.status === 'offline' ? 'inactive' : 'active',
        lastLogin: user.lastSeen,
        createdAt: user.joinDate,
        totalSpent: user.totalSpent,
        usage: {
          current: user.messagesUsed,
          limit: user.messagesLimit
        },
        avatar: user.avatar,
        location: 'Brasil', // Padrão por enquanto
        integrations: user.integrations,
        metrics: {
          totalMessages: user.metrics.totalMessages,
          totalTickets: user.metrics.totalTickets,
          satisfaction: user.metrics.satisfaction,
          lastActivity: user.metrics.lastActivity || new Date().toISOString()
        },
        tickets: user.metrics.totalTickets
      }));

      setUsers(transformedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'inactive': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'suspended': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'core': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-[#ffffff]';
      case 'neural': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-[#ffffff]';
      case 'nimbus': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-[#ffffff]';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-[#ffffff]';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return (used / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const startChat = (user: UserData) => {
    console.log('Iniciando chat com:', user.name);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const formatDate = (dateString: string) => {
    if (dateString === 'Agora' || dateString.includes('min') || dateString.includes('horas')) {
      return dateString;
    }
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#171717]">
        <AdminTopNav />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-[#ffffff]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#171717]">
      <AdminTopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#ffffff]">Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie todos os usuários da plataforma</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff] placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff]"
          >
            <option value="all">Todos os Planos</option>
            <option value="core">Core</option>
            <option value="neural">Neural</option>
            <option value="nimbus">Nimbus</option>
              </select>
              
              <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff]"
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="suspended">Suspenso</option>
              </select>
            </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                              </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(user.status)}`}></div>
                            </div>
                            <div>
                      <h3 className="font-semibold text-gray-900 dark:text-[#ffffff]">{user.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                    className="dark:hover:bg-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plano</span>
                    <Badge className={`${getPlanColor(user.plan)} border-0`}>
                      {user.plan === 'core' ? 'Core' : user.plan === 'neural' ? 'Neural' : 'Nimbus'}
                    </Badge>
                          </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Badge className={`${getStatusBadgeColor(user.status)} border-0`}>
                      {user.status === 'active' ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                          </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Uso Mensal</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-[#ffffff]">
                      {user.usage.current.toLocaleString()}/{user.usage.limit.toLocaleString()}
                    </span>
                            </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                              <div 
                      className="bg-gray-600 dark:bg-[#ffffff] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(getUsagePercentage(user.usage.current, user.usage.limit), 100)}%` }}
                              ></div>
                            </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>Último acesso</span>
                      <span>{formatDate(user.lastLogin)}</span>
                    </div>
                          </div>
                  
                  {/* Integrations */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Integrações:</span>
                    <div className="flex items-center gap-1">
                            {user.integrations.shopify && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Shopify conectado" />
                            )}
                            {user.integrations.whatsapp && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="WhatsApp conectado" />
                            )}
                            {user.integrations.openai && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="OpenAI conectado" />
                            )}
                          </div>
                          </div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-[#ffffff]">Detalhes do Usuário</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                  {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#ffffff]">{selectedUser.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">ID: {selectedUser.id}</p>
                        </div>
                      </div>
                      
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-[#ffffff]">{selectedUser.usage.current.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Mensagens este mês</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-[#ffffff]">{selectedUser.metrics.totalTickets}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tickets de suporte</div>
                        </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-[#ffffff]">
                      {Math.round(((Date.now() - new Date(selectedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)))}
                        </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dias na plataforma</div>
                        </div>
                      </div>

                  {/* Subscription Info */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#ffffff] mb-3">Informações da Assinatura</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Plano atual</span>
                      <Badge className={`${getPlanColor(selectedUser.plan)} border-0`}>
                        {selectedUser.plan === 'core' ? 'Core' : selectedUser.plan === 'neural' ? 'Neural' : 'Nimbus'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <Badge className={`${getStatusBadgeColor(selectedUser.status)} border-0`}>
                        {selectedUser.status === 'active' ? 'Ativo' : selectedUser.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Criado em</span>
                      <span className="text-gray-900 dark:text-[#ffffff]">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Último acesso</span>
                      <span className="text-gray-900 dark:text-[#ffffff]">{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                  </div>
                      </div>
                      
                {/* Integrations */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-[#ffffff] mb-3">Integrações</h4>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shopify</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedUser.integrations.shopify ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-900 dark:text-[#ffffff]">
                          {selectedUser.integrations.shopify ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                    </div>
                      <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">WhatsApp</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedUser.integrations.whatsapp ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-900 dark:text-[#ffffff]">
                          {selectedUser.integrations.whatsapp ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                      </div>
                      <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">OpenAI</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedUser.integrations.openai ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-900 dark:text-[#ffffff]">
                          {selectedUser.integrations.openai ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                        </div>
                      </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button 
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 