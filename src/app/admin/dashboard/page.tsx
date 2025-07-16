'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTopNav } from '@/app/components/admin/AdminTopNav';
import { 
  Users, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Eye,
  MessageCircle,
  User,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Send,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  activeTickets: number;
  resolvedTickets: number;
  onlineUsers: number;
  responseTime: string;
  resolutionRate: number;
  customerSatisfaction: string;
}

interface Ticket {
  id: string;
  customer: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created: string;
  lastMessage: string;
  avatar?: string;
}

interface OnlineUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: string;
  avatar?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeTickets: 0,
    resolvedTickets: 0,
    onlineUsers: 0,
    responseTime: '0min',
    resolutionRate: 0,
    customerSatisfaction: '0.0'
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchDashboardData();
    fetchTickets();
    fetchOnlineUsers();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        console.error('Erro ao buscar tickets');
        // Verificar se é erro de token expirado
        if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.expired) {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
            return;
          }
        }
        // Fallback para dados mockados em caso de erro
        setTickets([]);
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      setTickets([]);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/online-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data);
      } else {
        console.error('Erro ao buscar usuários online');
        // Verificar se é erro de token expirado
        if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.expired) {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
            return;
          }
        }
        setOnlineUsers([]);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários online:', error);
      setOnlineUsers([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = ticketFilter === 'all' || ticket.status === ticketFilter;
    return matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#171717]">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#ffffff]">Dashboard Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Panorama completo do sistema NuvemX.AI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuários</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-[#ffffff]">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Users className="h-6 w-6 text-gray-600 dark:text-[#ffffff]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-[#ffffff]">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <DollarSign className="h-6 w-6 text-gray-600 dark:text-[#ffffff]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tickets Ativos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-[#ffffff]">{stats.activeTickets}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <MessageCircle className="h-6 w-6 text-gray-600 dark:text-[#ffffff]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuários Online</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-[#ffffff]">{stats.onlineUsers}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Activity className="h-6 w-6 text-gray-600 dark:text-[#ffffff]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets de Suporte */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-[#ffffff]">Tickets de Suporte</CardTitle>
                  <div className="flex items-center gap-2">
                    <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff]">
                      <option value="all">Todos</option>
                      <option value="open">Abertos</option>
                      <option value="pending">Pendentes</option>
                      <option value="resolved">Resolvidos</option>
                    </select>
                    <Button size="sm" className="bg-gray-600 hover:bg-gray-700 dark:bg-[#ffffff] dark:hover:bg-gray-200 dark:text-[#171717]">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Novo Ticket
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-[#ffffff]">{ticket.customer}</h4>
                              <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-[#ffffff] mb-1">{ticket.subject}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.lastMessage}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                              <span>{formatDate(ticket.created)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(ticket.status)} border-0 text-xs`}>
                            {ticket.status === 'open' ? 'Aberto' : ticket.status === 'pending' ? 'Pendente' : 'Resolvido'}
                          </Badge>
                          <Button variant="ghost" size="sm" className="dark:hover:bg-gray-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="dark:hover:bg-gray-700">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usuários Online */}
            <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-[#ffffff] flex items-center justify-between">
                  Usuários Online
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                    {stats.onlineUsers}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {onlineUsers.filter(user => user.status === 'online').map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-[#ffffff]">{user.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="dark:hover:bg-gray-700">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="dark:hover:bg-gray-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {onlineUsers.filter(user => user.status === 'online').length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum usuário online no momento</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card className="bg-white dark:bg-gray-900 shadow-sm border-0 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-[#ffffff]">Estatísticas Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio de Resposta</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-[#ffffff]">{stats.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Resolução</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats.resolutionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Satisfação do Cliente</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-[#ffffff]">{stats.customerSatisfaction}/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 