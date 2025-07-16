'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LiquidGlassCard } from '@/app/components/ui/LiquidGlassCard';
import { NuvemxLogo } from '@/app/components/logos/NuvemxLogo';
import { createClient } from '@supabase/supabase-js';
import { 
  Send, 
  X,
  MessageCircle,
  Sparkles,
  ChevronDown,
  MoreHorizontal,
  MessageSquare,
  LogOut
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'agent';
  content: string;
  timestamp: string;
  metadata?: any;
}

// Declarar tipo para Clerk no window
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>;
      };
    };
  }
}

export function HelpdeskWidget() {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    type: 'ai',
    content: `👋 Olá! Sou Alex, seu assistente de suporte da NuvemX.AI.\n\nComo posso ajudar você hoje?`,
    timestamp: new Date().toISOString()
  }]);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [supportJoined, setSupportJoined] = useState(false);
  const [ticketClosed, setTicketClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Supabase client
  const supabaseUrl = 'https://zybexqvuiqcxckvgyywy.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YmV4cXZ1aXFjeGNrdmd5eXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1OTcxMjUsImV4cCI6MjA2MDE3MzEyNX0.QqfXvkt12mmyjv4xjzcgsUC1Pud0NKAwBj8kYG9x8MM';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.dropdown-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Função para iniciar nova conversa
  const startNewChat = async () => {
    console.log('Iniciando nova conversa...');
    setShowDropdown(false);
    
    // Se há um ticket ativo e admin ainda não entrou, finalizar conversa atual
    if (currentTicketId && !supportJoined) {
      await endCurrentChat();
      return;
    }
    
    // Reset do estado
    resetChat();
    
    // Limpar histórico do Redis
    if (userId) {
      try {
        const historyKey = `alex_history:${userId}`;
        await fetch('/api/helpdesk/clear-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
          },
          body: JSON.stringify({ historyKey })
        });
        console.log('Histórico Redis limpo com sucesso');
      } catch (error) {
        console.error('Erro ao limpar histórico Redis:', error);
      }
    }
    
    // Mensagem de confirmação
    const confirmMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      content: '🔄 Nova conversa iniciada! Como posso ajudar você?',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
  };

  // Função para finalizar conversa atual
  const endCurrentChat = async () => {
    console.log('Finalizando conversa atual...');
    setShowDropdown(false);
    
    if (currentTicketId && !supportJoined) {
      try {
        // Enviar mensagem de finalização para o banco
        await supabase
          .from('helpdesk_conversations')
          .insert({
            session_id: currentTicketId,
            clerk_user_id: userId,
            message_type: 'system',
            message: '👋 Conversa finalizada pelo usuário.',
            metadata: { 
              author: 'Sistema',
              chat_ended: true,
              ended_by: 'user'
            }
          });
        
        // Atualizar status do ticket para closed se ainda não há admin
        await supabase
          .from('helpdesk_tickets')
          .update({ 
            status: 'closed',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentTicketId);
          
        console.log('Conversa finalizada no banco de dados');
      } catch (error) {
        console.error('Erro ao finalizar conversa:', error);
      }
    }
    
    // Reset do estado
    resetChat();
    
    // Mensagem de confirmação
    const endMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      content: '👋 Conversa finalizada. Obrigado por usar nosso suporte!',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, endMessage]);
  };

  // Setup real-time subscription for new messages
  useEffect(() => {
    if (!userId || !currentTicketId) return;

    console.log('Setting up helpdesk realtime subscription for session:', currentTicketId);

    const channel = supabase
      .channel(`helpdesk-${userId}-${currentTicketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'helpdesk_conversations',
        filter: `session_id=eq.${currentTicketId}`
      }, (payload) => {
        console.log('Helpdesk message detected:', payload);
        
        const newMessage = payload.new;
        const message: Message = {
          id: newMessage.id.toString(),
          type: newMessage.message_type === 'agent' ? 'agent' : 
                newMessage.message_type === 'system' ? 'system' : 'user',
          content: newMessage.message,
          timestamp: newMessage.created_at,
          metadata: newMessage.metadata
        };
        
        console.log('Adding new message to helpdesk:', message);
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) {
            console.log('Message already exists in helpdesk, skipping');
            return prev;
          }
          return [...prev, message];
        });
        
        // Check if support has joined
        if (newMessage.message_type === 'system' && 
            newMessage.message.includes('Suporte Técnico entrou')) {
          setSupportJoined(true);
        }
        
        // Check if ticket was closed
        if (newMessage.message.includes('Ticket foi fechado') || 
            newMessage.message.includes('ticket foi fechado') ||
            newMessage.metadata?.is_ticket_closed === true) {
          console.log('Ticket closure detected, setting ticketClosed to true');
          setTicketClosed(true);
          // Auto reset after 3 seconds
          setTimeout(() => {
            console.log('Auto-resetting chat after ticket closure');
            resetChat();
          }, 3000);
        }
        
        // Show notification if widget is closed
        if (!isOpen) {
          setHasNewMessage(true);
        }
      })
      .subscribe((status) => {
        console.log('Helpdesk realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up helpdesk realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, currentTicketId, isOpen]);

  // Load existing messages when ticket is opened
  const loadTicketMessages = async (ticketId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('helpdesk_conversations')
        .select('*')
        .eq('clerk_user_id', userId)
        .eq('session_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      const formattedMessages: Message[] = data.map(msg => ({
        id: msg.id.toString(),
        type: msg.message_type === 'agent' ? 'agent' : 
              msg.message_type === 'system' ? 'system' : 'user',
        content: msg.message,
        timestamp: msg.created_at,
        metadata: msg.metadata
      }));

      setMessages(formattedMessages);
      
      // Check if support has joined
      const supportJoinedMsg = formattedMessages.find(msg => 
        msg.type === 'system' && msg.content.includes('Suporte Técnico entrou')
      );
      setSupportJoined(!!supportJoinedMsg);
      
      // Check if ticket is closed
      const ticketClosedMsg = formattedMessages.find(msg => 
        msg.type === 'system' && (
          msg.content.includes('Ticket foi fechado') || 
          msg.content.includes('ticket foi fechado') ||
          msg.metadata?.is_ticket_closed === true
        )
      );
      
      if (ticketClosedMsg) {
        console.log('Found closed ticket message, setting ticketClosed to true');
        setTicketClosed(true);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Sugestões rápidas
  const quickSuggestions = [
    "Como conectar Shopify?",
    "Problemas com WhatsApp",
    "Configurar OpenAI",
    "Upgrade de plano"
  ];

  // Inicializar sessão quando abrir - REMOVED
  // useEffect(() => {
  //   if (isOpen && userId && !currentTicketId) {
  //     startSupportSession();
  //   }
  // }, [isOpen, userId, currentTicketId]);

  // startSupportSession function - REMOVED

  const sendMessage = async (message: string) => {
    if (!message.trim() || !userId) return;
    
    setIsLoading(true);
    
    try {
      // Add user message to local state immediately for better UX
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
        content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
      
      // Call the real Alex API
      const response = await fetch('/api/helpdesk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        },
        body: JSON.stringify({
          message: message,
          sessionId: sessionId || null // Let backend handle session creation
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro na comunicação com o servidor');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
      // Add Alex's response
      const alexMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
        timestamp: new Date().toISOString()
        };

      setMessages(prev => [...prev, alexMessage]);
        
      // Check if Alex wants to escalate (create ticket)
      if (data.shouldEscalate && data.ticketTitle && data.ticketDescription) {
        await createTicketFromAI(data.ticketTitle, data.ticketDescription);
        }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
      setHasNewMessage(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setHasNewMessage(false);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    const messageToSend = inputMessage;
    setInputMessage('');
    await sendMessage(messageToSend);
  };

  const handleQuickReply = async (message: string) => {
    await sendMessage(message);
  };

  const resetChat = () => {
    console.log('Resetting chat to initial state');
    setCurrentTicketId(null);
    setSessionId(null);
    setTicketClosed(false);
    setSupportJoined(false);
    setInputMessage('');
    setIsLoading(false);
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: `👋 Olá! Sou Alex, seu assistente de suporte da NuvemX.AI.

Como posso ajudar você hoje?`,
      timestamp: new Date().toISOString()
    }]);
  };

  // Create ticket from AI decision
  const createTicketFromAI = async (title: string, description: string) => {
    try {
      // Create new session first
      const { data: sessionData, error: sessionError } = await supabase
        .from('helpdesk_sessions')
        .insert({
          clerk_user_id: userId,
          status: 'active',
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return;
      }
      
      const sessionId = sessionData.id;
      
      // Create new ticket with the session ID
      const ticketNumber = `TICKET-${Date.now()}`;
      
      const { data: ticketData, error: ticketError } = await supabase
        .from('helpdesk_tickets')
        .insert({
          clerk_user_id: userId,
          session_id: sessionId,
          ticket_number: ticketNumber,
          title: title,
          description: description,
          category: 'support',
          priority: 'medium',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        return;
      }
      
      // Set current ticket and session
      setCurrentTicketId(ticketData.id.toString());
      setSessionId(sessionId.toString());
      
      // Save conversation to database
      await supabase
        .from('helpdesk_conversations')
        .insert([
          {
            session_id: sessionId,
            clerk_user_id: userId,
            message_type: 'user',
            message: `Ticket #${ticketNumber} criado com sucesso! 🎫

Sua solicitação foi encaminhada para nossa equipe de suporte técnico. Em breve, um especialista entrará em contato para ajudá-lo.

Você pode continuar conversando aqui - quando o suporte entrar, vocês poderão conversar diretamente!`,
            metadata: {
              author: 'Alex AI',
              timestamp: new Date().toISOString(),
              ticket_created: true
            }
          }
        ]);
      
      console.log('Ticket created successfully:', ticketData);
      
      // Load messages to sync with database
      await loadTicketMessages(sessionId.toString());
      
      // Add system message about ticket creation
      setTimeout(() => {
        const ticketMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'system',
          content: `🎫 **Ticket #${ticketNumber} criado!**

Sua solicitação foi registrada e nossa equipe de suporte foi notificada. Continue conversando aqui - quando um especialista entrar, vocês poderão conversar diretamente!`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, ticketMessage]);
      }, 500);
      
    } catch (error) {
      console.error('Error creating ticket from AI:', error);
    }
  };

  // Não mostrar se não estiver logado
  if (!userId) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Widget expandido com LiquidGlassCard */}
      {isOpen && !isMinimized && (
        <div className="absolute bottom-16 right-0">
          <LiquidGlassCard className="w-[420px] h-[580px] flex flex-col overflow-hidden origin-bottom-right animate-in slide-in-from-bottom-2 slide-in-from-right-2 duration-300 border-white/30 bg-black/60 backdrop-blur-2xl">
            
            {/* Header futurista */}
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/10 to-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 border border-white/30 flex items-center justify-center p-2 backdrop-blur-sm">
                    <NuvemxLogo className="w-full h-full opacity-90" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-wide">NuvemX.AI</h3>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${
                        ticketClosed ? 'bg-red-400 shadow-red-400/50' : 'bg-emerald-400 shadow-emerald-400/50'
                      }`}></div>
                      <span className="font-medium">
                        {ticketClosed ? 'Ticket Fechado' : 
                         supportJoined ? 'Suporte Técnico Online' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Menu Dropdown */}
                <div className="relative dropdown-menu">
                <Button
                  variant="ghost"
                  size="icon"
                    onClick={() => setShowDropdown(!showDropdown)}
                  className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/20 backdrop-blur-sm"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 top-12 w-56 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-2">
                        <button
                          onClick={startNewChat}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Iniciar um novo bate-papo
                        </button>
                        
                        {currentTicketId && !supportJoined && (
                          <button
                            onClick={endCurrentChat}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium"
                          >
                            <LogOut className="h-4 w-4" />
                            Fim do bate-papo
                          </button>
                        )}
                        
                        <div className="border-t border-white/20 my-2"></div>
                        
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium"
                        >
                          <X className="h-4 w-4" />
                          Fechar widget
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Área de Mensagens futurista */}
            <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-black/20 to-black/40">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type !== 'user' && (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 border border-white/30 flex items-center justify-center flex-shrink-0 text-white shadow-lg backdrop-blur-sm">
                        {message.type === 'ai' ? (
                          <Sparkles className="h-5 w-5" />
                        ) : message.type === 'agent' ? (
                          <span className="text-lg">👨‍💻</span>
                        ) : (
                          <span className="text-lg">🎫</span>
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[320px] ${
                      message.type === 'user' ? 'order-1' : ''
                    }`}>
                      <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-xl backdrop-blur-sm border ${
                        message.type === 'user' 
                          ? 'ml-auto rounded-br-lg bg-gradient-to-br from-white/25 to-white/15 border-white/40 text-white'
                          : message.type === 'ai'
                          ? 'rounded-bl-lg bg-gradient-to-br from-black/40 to-black/60 border-white/20 text-white/90'
                          : message.type === 'agent'
                          ? 'rounded-bl-lg bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-400/40 text-blue-100'
                          : 'rounded-bl-lg bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-400/40 text-orange-100'
                      }`}>
                        <div className="whitespace-pre-wrap font-medium">
                          {message.content}
                        </div>
                        {message.type === 'agent' && (
                          <div className="text-xs text-blue-200 mt-1 font-semibold">
                            Suporte Técnico
                          </div>
                        )}
                      </div>
                      <div className={`text-xs text-white/50 mt-2 px-2 font-medium ${
                        message.type === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 border border-white/30 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="rounded-2xl rounded-bl-lg px-5 py-4 shadow-xl backdrop-blur-sm bg-gradient-to-br from-black/40 to-black/60 border border-white/20">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Sugestões rápidas futuristas */}
            {messages.length <= 2 && (
              <div className="px-6 py-4 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(suggestion)}
                      className="text-xs text-white/80 hover:text-white border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input de Mensagem futurista */}
            <div className="p-6 border-t border-white/20 bg-gradient-to-r from-white/5 to-white/10">
              {ticketClosed ? (
                <div className="text-center py-4">
                  <div className="text-white/60 text-sm font-medium mb-3">
                    🔒 Este ticket foi fechado
                  </div>
                  <div className="text-white/40 text-xs mb-4">
                    Ticket encerrado pelo suporte técnico
                  </div>
                  <Button
                    onClick={resetChat}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    💬 Iniciar Nova Conversa
                  </Button>
                </div>
              ) : (
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="w-full px-5 py-4 text-sm rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 resize-none border border-white/20 font-medium shadow-lg bg-black/40 backdrop-blur-sm transition-all"
                  />
                </div>
                <Button 
                    onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="w-14 h-14 rounded-2xl text-white border border-white/30 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-sm"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              )}
            </div>

            {/* Footer futurista */}
            <div className="px-6 py-4 border-t border-white/20 bg-gradient-to-r from-black/20 to-black/40">
              <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium tracking-wide">Powered by NuvemX.AI</span>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* Botão flutuante futurista */}
      <Button
        onClick={handleToggle}
        className="w-16 h-16 rounded-full text-white shadow-2xl border border-white/30 transition-all duration-300 hover:scale-110 relative group bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl hover:from-black/70 hover:to-black/90"
      >
        {isOpen ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"></div>
          </div>
        )}
        
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        
        {/* Efeito de ondas futurista quando há nova mensagem */}
        {hasNewMessage && !isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}
      </Button>

      {/* Widget minimizado futurista */}
      {isMinimized && (
        <div className="absolute bottom-16 right-0">
          <Button
            onClick={handleRestore}
            className="w-16 h-16 rounded-full text-white shadow-2xl border border-white/30 transition-all duration-300 hover:scale-110 relative group bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl hover:from-black/70 hover:to-black/90"
          >
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"></div>
            </div>
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 