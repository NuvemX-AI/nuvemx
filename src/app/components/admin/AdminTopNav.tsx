'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  Shield, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/Badge';

interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

export function AdminTopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [notificationData, setNotificationData] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    
    // Buscar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && !(event.target as Element).closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.count);
        setNotificationData(data.notifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const navItems: AdminNavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3
    },
    {
      id: 'users',
      label: 'Usuários',
      href: '/admin/users',
      icon: Users
    },
    {
      id: 'tickets',
      label: 'Tickets',
      href: '/admin/tickets',
      icon: MessageSquare
    },
    {
      id: 'settings',
      label: 'Configurações',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-4 w-4" />;
    
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <nav className="bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/nuvemx.png"
                  alt="NuvemX Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-bold text-xl text-gray-900 dark:text-[#ffffff]">NuvemX.AI</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600 dark:text-[#ffffff]" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Admin</span>
              </div>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-[#ffffff]'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64 bg-white dark:bg-[#171717] text-gray-900 dark:text-[#ffffff] placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={mounted ? `Tema atual: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}` : 'Alternar tema'}
            >
              {getThemeIcon()}
            </button>

            {/* Notifications */}
            <div className="relative notifications-dropdown">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                    {notifications}
                  </Badge>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-[#ffffff]">Notificações</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notificationData.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notificationData.map((notification, index) => (
                        <div key={index} className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.priority === 'high' ? 'bg-red-500' : 
                              notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-[#ffffff]">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notificationData.length > 0 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#ffffff] transition-colors">
                        Marcar todas como lidas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#171717] border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-[#ffffff]'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            
            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={cycleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
              >
                {getThemeIcon()}
                Tema: {mounted ? (theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema') : 'Carregando...'}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 