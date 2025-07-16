'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTopNav } from '@/app/components/admin/AdminTopNav';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  MoreHorizontal,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Paperclip,
  Image,
  Smile,
  Archive,
  Star,
  Flag,
  Eye,
  Edit,
  Trash2,
  Reply,
  Forward,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { createClient } from '@supabase/supabase-js';

interface Ticket {
  id: string;
  clerk_user_id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    plan: string;
  };
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: string;
  updated: string;
  assignedTo?: string;
  tags: string[];
  messages: TicketMessage[];
  metadata: {
    source: 'whatsapp' | 'email' | 'chat' | 'phone';
    category: string;
    satisfaction?: number;
    session_id?: string; // Added for join conversation
  };
}

interface TicketMessage {
  id: string;
  type: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
  author: string;
  attachments?: string[];
  read: boolean;
  metadata?: {
    author?: string;
    read?: boolean;
    is_support_join?: boolean;
  };
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [joiningConversation, setJoiningConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabaseUrl = 'https://zybexqvuiqcxckvgyywy.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YmV4cXZ1aXFjeGNrdmd5eXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1OTcxMjUsImV4cCI6MjA2MDE3MzEyNX0.QqfXvkt12mmyjv4xjzcgsUC1Pud0NKAwBj8kYG9x8MM';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchTickets();
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const loadTicketMessages = useCallback(async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setLoadingMessages(true);
    
    try {
      const { data: conversationsData, error } = await supabase
        .from('helpdesk_conversations')
        .select('*')
        .eq('session_id', ticket.metadata.session_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', ticket.clerk_user_id)
        .single();

      const formattedMessages: TicketMessage[] = (conversationsData || []).map((m: any) => ({
        id: m.id,
        type: m.message_type === 'user' ? 'customer' as const : m.message_type === 'agent' ? 'agent' as const : 'system' as const,
        content: m.message,
        timestamp: m.created_at,
        author: m.metadata?.author || (m.message_type === 'user' ? (profile?.full_name || 'Customer') : m.message_type === 'agent' ? 'Suporte Técnico' : 'Sistema'),
        attachments: m.metadata?.attachments || [],
        read: m.metadata?.read ?? true,
        metadata: m.metadata || {}
      }));

      console.log(`Loaded ${formattedMessages.length} messages for ticket ${ticketId}`);

      // Update the selected ticket with fresh messages
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: formattedMessages
      } : null);

    } catch (error) {
      console.error('Error loading ticket messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [tickets]);

  // Reload messages when ticket is selected
  useEffect(() => {
    if (selectedTicket && selectedTicket.messages.length === 0) {
      loadTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket?.id, loadTicketMessages]);

  useEffect(() => {
    if (!selectedTicket) return;
    
    console.log('Setting up realtime subscription for selectedTicket:', selectedTicket.id);
    console.log('Session ID:', selectedTicket.metadata.session_id);
    
    const channel = supabase
      .channel(`admin-tickets-${selectedTicket.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'helpdesk_conversations',
        filter: `session_id=eq.${selectedTicket.metadata.session_id}`
      }, (payload) => {
        console.log('New message detected for session:', selectedTicket.metadata.session_id);
        console.log('Message payload:', payload);
        
        const newMessage = payload.new;
        const newMsg: TicketMessage = {
          id: newMessage.id,
          type: newMessage.message_type === 'user' ? 'customer' : 
                newMessage.message_type === 'agent' ? 'agent' : 'system',
          content: newMessage.message,
          timestamp: newMessage.created_at,
          author: newMessage.metadata?.author || 
                  (newMessage.message_type === 'agent' ? 'Suporte Técnico' : 
                   newMessage.message_type === 'user' ? 'Cliente' : 'Sistema'),
          attachments: newMessage.metadata?.attachments || [],
          read: newMessage.metadata?.read ?? true,
          metadata: newMessage.metadata || {}
        };
        
        console.log('Adding new message to admin chat:', newMsg);
        setSelectedTicket(prev => {
          if (!prev) return null;
          // Check if message already exists
          const exists = prev.messages.some(msg => msg.id === newMsg.id);
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          return { ...prev, messages: [...prev.messages, newMsg] };
        });
      })
      .subscribe((status) => {
        console.log('Admin realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up admin realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedTicket?.id, selectedTicket?.metadata?.session_id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get tickets first
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('helpdesk_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        setLoading(false);
        return;
      }

      // Get conversations for tickets
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('helpdesk_conversations')
        .select('*');

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
      }

      // Get profiles for all users (with error handling)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, plan_id');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles data
      }

      // Create maps for easy lookup
      const conversationsMap = (conversationsData || []).reduce((acc: any, conv: any) => {
        if (!acc[conv.session_id]) {
          acc[conv.session_id] = [];
        }
        acc[conv.session_id].push(conv);
        return acc;
      }, {});

      const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
      
      const formattedTickets = ticketsData.map((t: any) => {
        const profile = profilesMap[t.clerk_user_id];
        const ticketMessages = conversationsMap[t.session_id] || [];
        
        // Usar nome do metadata se profile não existir
        let customerName = 'Unknown Customer';
        let customerEmail = 'N/A';
        
        if (profile?.full_name) {
          customerName = profile.full_name;
          customerEmail = profile.email || 'N/A';
        } else if (t.metadata?.user_name) {
          customerName = t.metadata.user_name;
          customerEmail = t.metadata.user_email || 'N/A';
        }
        
        return {
          id: t.id,
          clerk_user_id: t.clerk_user_id,
        customer: {
            name: customerName,
            email: customerEmail,
            phone: 'N/A',
            avatar: profile?.avatar_url || '',
            plan: profile?.plan_id || 'basic'
        },
          subject: t.title,
          status: t.status,
          priority: t.priority,
          created: t.created_at,
          updated: t.updated_at,
          assignedTo: t.assigned_to ? 'Support Agent' : undefined,
          tags: t.tags || [],
          messages: ticketMessages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((m: any) => ({
            id: m.id,
            type: m.message_type === 'user' ? 'customer' as const : m.message_type === 'agent' ? 'agent' as const : 'system' as const,
            content: m.message,
            timestamp: m.created_at,
            author: m.metadata?.author || (m.message_type === 'user' ? (profile?.full_name || 'Customer') : m.message_type === 'agent' ? 'Suporte Técnico' : 'Sistema'),
            attachments: m.metadata?.attachments || [],
            read: m.metadata?.read ?? true,
            metadata: m.metadata || {}
          })),
        metadata: {
            source: 'chat' as const,
            category: t.category || 'support',
            session_id: t.session_id
          }
        };
      });
      
      setTickets(formattedTickets);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchTickets:', error);
    setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const tempMessage: TicketMessage = {
      id: `temp-${Date.now()}`,
      type: 'agent',
      content: newMessage,
      timestamp: new Date().toISOString(),
      author: 'Suporte Técnico',
      attachments: [],
      read: true,
      metadata: { 
        author: 'Suporte Técnico',
      read: true
      }
    };

    // Add message immediately to UI for better UX
    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempMessage]
    } : null);

    // Clear input immediately
    const messageToSend = newMessage;
    setNewMessage('');
    
    try {
      // Send message to database
      const { error } = await supabase
        .from('helpdesk_conversations')
        .insert({
          session_id: selectedTicket.metadata.session_id,
          clerk_user_id: selectedTicket.clerk_user_id,
          message_type: 'agent',
          message: messageToSend,
          metadata: {
            author: 'Suporte Técnico',
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Error sending message:', error);
        // Remove temp message on error
        setSelectedTicket(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(m => m.id !== tempMessage.id)
        } : null);
        setNewMessage(messageToSend); // Restore message on error
        return;
      }

      // Remove temp message since realtime will add the real one
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: prev.messages.filter(m => m.id !== tempMessage.id)
      } : null);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: prev.messages.filter(m => m.id !== tempMessage.id)
      } : null);
      setNewMessage(messageToSend); // Restore message on error
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    const { error } = await supabase
      .from('helpdesk_tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updated: new Date().toISOString() }
        : ticket
    ));
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const joinConversation = async (ticketId: string) => {
    if (!selectedTicket) return;
    
    setJoiningConversation(true);
    
    try {
      // Mark support as joined in the ticket
      const { error: updateError } = await supabase
        .from('helpdesk_tickets')
        .update({ 
          assigned_to: 'support_agent',
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('Error joining conversation:', updateError);
        return;
      }

      // Send notification message to user's helpdesk
      const { error: messageError } = await supabase
        .from('helpdesk_conversations')
        .insert({
          session_id: selectedTicket.metadata.session_id,
          clerk_user_id: selectedTicket.clerk_user_id,
          message_type: 'system',
          message: '🎧 Suporte Técnico entrou na conversa. Como posso ajudá-lo?',
          metadata: { 
            author: 'Sistema',
            read: false,
            is_support_join: true
          }
        });

      if (messageError) {
        console.error('Error sending join notification:', messageError);
      }

      // Update local state
      setSelectedTicket(prev => prev ? {
        ...prev,
        assignedTo: 'Support Agent',
        updated: new Date().toISOString()
      } : null);

      // Refresh tickets to update the list
      fetchTickets();
      
    } catch (error) {
      console.error('Error in joinConversation:', error);
    } finally {
      setJoiningConversation(false);
    }
  };

  const closeTicket = async (ticketId: string) => {
    if (!selectedTicket) return;
    
    setLoading(true);
    
    try {
      // Update ticket status to closed
      const { error: updateError } = await supabase
        .from('helpdesk_tickets')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('Error closing ticket:', updateError);
        return;
      }

      // Send notification message to user's helpdesk
      const { error: messageError } = await supabase
        .from('helpdesk_conversations')
        .insert({
          session_id: selectedTicket.metadata.session_id,
          clerk_user_id: selectedTicket.clerk_user_id,
          message_type: 'system',
          message: '✅ Ticket foi fechado pelo suporte técnico. Obrigado por entrar em contato!',
          metadata: { 
            author: 'Sistema',
            read: false,
            is_ticket_closed: true
          }
        });

      if (messageError) {
        console.error('Error sending close notification:', messageError);
      }

      // Update local state
      setSelectedTicket(prev => prev ? {
        ...prev,
        status: 'closed',
        updated: new Date().toISOString()
      } : null);

      // Refresh tickets to update the list
      fetchTickets();
      
    } catch (error) {
      console.error('Error in closeTicket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return '📱';
      case 'email': return '📧';
      case 'chat': return '💬';
      case 'phone': return '📞';
      default: return '❓';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Tickets List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 pr-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#ffffff] mb-2">Tickets</h1>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff] placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff]"
                >
                  <option value="all">Todos Status</option>
                  <option value="open">Abertos</option>
                  <option value="pending">Pendentes</option>
                  <option value="resolved">Resolvidos</option>
                </select>
                
                <select 
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff]"
                >
                  <option value="all">Todas Prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
            
            {/* Tickets List */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-20rem)]">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-500'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-[#ffffff] text-sm">{ticket.customer.name}</h3>
                        <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                          <span className="text-xs text-gray-500 dark:text-gray-500 capitalize">{ticket.priority}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(ticket.status)} border-0 text-xs`}>
                      {ticket.status === 'open' ? 'Aberto' : 
                       ticket.status === 'pending' ? 'Pendente' : 
                       ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 dark:text-[#ffffff] text-sm mb-1">{ticket.subject}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{ticket.messages[ticket.messages.length - 1]?.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>{formatDate(ticket.created)}</span>
                    <span>{ticket.messages?.length || 0} mensagens</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-[#ffffff]">{selectedTicket.customer.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(selectedTicket.status)} border-0`}>
                        {selectedTicket.status === 'open' ? 'Aberto' : 
                         selectedTicket.status === 'pending' ? 'Pendente' : 
                         selectedTicket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                      </Badge>
                      
                      {/* Join Conversation Button */}
                      {selectedTicket.status === 'open' && !selectedTicket.assignedTo && (
                        <Button
                          onClick={() => joinConversation(selectedTicket.id)}
                          disabled={joiningConversation}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
                        >
                          {joiningConversation ? 'Entrando...' : 'Entrar na Conversa'}
                        </Button>
                      )}
                      
                      {/* Close Ticket Button */}
                      {selectedTicket.status === 'open' && (
                        <Button
                          onClick={() => closeTicket(selectedTicket.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                        >
                          {loading ? 'Fechando...' : 'Fechar Ticket'}
                        </Button>
                      )}
                      
                      {/* Test Realtime Button */}
                      <Button 
                        onClick={() => {
                          console.log('Testing realtime with ticket:', selectedTicket);
                          console.log('Session ID:', selectedTicket.metadata.session_id);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                      >
                        Test Realtime
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="dark:hover:bg-gray-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#171717]">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-[#ffffff]"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando mensagens...</span>
                    </div>
                  ) : selectedTicket.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Nenhuma mensagem ainda</p>
                      </div>
                    </div>
                  ) : (
                    selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id}
                        className={`flex ${message.type === 'customer' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className="max-w-[70%]">
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === 'customer'
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff] border border-gray-200 dark:border-gray-700'
                          : message.type === 'system'
                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                                : 'bg-gray-600 dark:bg-[#ffffff] text-white dark:text-[#171717]'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.type !== 'customer' && (
                              <p className="text-xs mt-1 opacity-75">{message.author}</p>
                        )}
                          </div>
                          <div className="mt-1 px-1">
                            <span className={`text-xs ${
                              message.type === 'customer' 
                                ? 'text-gray-500 dark:text-gray-500' 
                                : 'text-gray-500 dark:text-gray-500'
                            }`}>
                          {formatDate(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                  <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua resposta..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#ffffff] placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gray-600 hover:bg-gray-700 dark:bg-[#ffffff] dark:hover:bg-gray-200 dark:text-[#171717] disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#171717]">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#ffffff] mb-2">Nenhum ticket selecionado</h3>
                  <p className="text-gray-600 dark:text-gray-400">Selecione um ticket da lista para ver a conversa</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 