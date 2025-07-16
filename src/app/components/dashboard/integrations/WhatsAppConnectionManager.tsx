"use client";

import React, { useEffect } from 'react';
// import { useUser } from '@clerk/nextjs'; // user variable is unused
import { Button } from "@/app/components/ui/button";
import { Spinner } from "@/app/components/ui/spinner";
import {
  QrCode as QrCodeIcon,
  // AlertCircle, // Unused import
  TimerIcon,
  LogOut,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye,
} from 'lucide-react';
 // import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/app/components/ui/dialog"; // Para a Modal do QR Code // REMOVIDO

// Importar o contexto do WhatsApp
import { useWhatsApp } from "@/contexts/WhatsAppContext";

export default function WhatsAppConnectionManager() {
  // const { user } = useUser(); // Unused variable
  const {
    instanceName: whatsAppInstanceName,
    connectionStatus: whatsAppConnectionStatus,
    isQrModalOpen: isWhatsAppQrModalOpen,
    // qrCodeBase64: whatsAppQrCodeBase64, // Unused variable
    // pairingCode: whatsAppPairingCode, // Unused variable
    qrError: whatsAppQrError,
    isLoading: isLoadingWhatsApp,
    connectWhatsApp,
    disconnectWhatsApp,
    closeQrModal: closeWhatsAppQrModal,
  } = useWhatsApp();

  useEffect(() => {
    console.log("[WhatsAppConnectionManager] Montado. Status do Contexto:", whatsAppConnectionStatus, "Modal Aberto:", isWhatsAppQrModalOpen);
  }, [whatsAppConnectionStatus, isWhatsAppQrModalOpen]);

  // --- Lógica de exibição --- 
  let statusIcon, statusText, statusDescription, actionButton;

  switch (whatsAppConnectionStatus) {
    case "Conectado":
      statusIcon = <CheckCircle2 className="mr-3 h-6 w-6 text-green-400" />;
      statusText = "Conectado";
      statusDescription = "Seu WhatsApp está ativo e pronto para interagir.";
      actionButton = (
        <Button onClick={disconnectWhatsApp} disabled={isLoadingWhatsApp} variant="destructive" size="lg" className="w-full sm:w-auto bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30">
                          {isLoadingWhatsApp ? <Spinner variant="infinite" size={20} className="mr-2 text-white" /> : <LogOut className="mr-2 h-5 w-5" />}
          Desconectar WhatsApp
        </Button>
      );
      break;
    case "Aguardando Leitura":
      statusIcon = <TimerIcon className="mr-3 h-6 w-6 text-yellow-400 animate-pulse" />;
      statusText = "Aguardando Leitura do QR Code";
      statusDescription = isWhatsAppQrModalOpen 
        ? "O modal com o QR Code está aberto. Por favor, escaneie."
        : "O QR Code foi gerado. Clique para visualizar se o modal não estiver visível.";
      actionButton = (
        <Button onClick={isWhatsAppQrModalOpen ? closeWhatsAppQrModal : connectWhatsApp} disabled={isLoadingWhatsApp} size="lg" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-400/30 w-full sm:w-auto">
                          {isLoadingWhatsApp ? <Spinner variant="infinite" size={20} className="mr-2 text-white" /> : <QrCodeIcon className="mr-2 h-5 w-5" />}
          {isWhatsAppQrModalOpen ? "Fechar Modal QR" : "Ver QR Code"}
        </Button>
      );
      break;
    case "PendenteDeLeitura":
      statusIcon = <QrCodeIcon className="mr-3 h-6 w-6 text-yellow-400" />;
      statusText = "QR Gerado - Aguardando Scan";
      statusDescription = "O QR Code foi gerado. Clique abaixo para visualizá-lo e conectar.";
      actionButton = (
        <Button onClick={connectWhatsApp} disabled={isLoadingWhatsApp} size="lg" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-400/30 w-full sm:w-auto">
          {isLoadingWhatsApp ? <Spinner variant="infinite" size={20} className="mr-2 text-white" /> : <Eye className="mr-2 h-5 w-5" />}
          Ver QR Code
        </Button>
      );
      break;
    case "IniciandoConexao":
      statusIcon = <Spinner variant="infinite" size={20} className="mr-3 text-white" />;
      statusText = "Iniciando Conexão...";
      statusDescription = "Aguarde enquanto preparamos a conexão.";
      actionButton = (
        <Button disabled size="lg" className="bg-white/10 text-white/50 w-full sm:w-auto cursor-not-allowed border-white/20">
          <Spinner variant="infinite" size={20} className="mr-2 text-white" />
          Conectando...
        </Button>
      );
      break;
    case "Erro":
      statusIcon = <AlertTriangle className="mr-3 h-6 w-6 text-red-400" />;
      statusText = "Erro na Conexão";
      statusDescription = whatsAppQrError || "Falha na conexão. Verifique e tente novamente.";
      actionButton = (
        <Button onClick={connectWhatsApp} disabled={isLoadingWhatsApp} size="lg" className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30 w-full sm:w-auto">
          {isLoadingWhatsApp ? <Spinner variant="infinite" size={20} className="mr-2 text-white" /> : <Smartphone className="mr-2 h-5 w-5" />}
          Tentar Conectar Novamente
        </Button>
      );
      break;
    case "Desconectado":
    case "Desconhecido":
    default:
      statusIcon = <AlertTriangle className="mr-3 h-6 w-6 text-red-400" />;
      statusText = "Desconectado";
      statusDescription = "Conecte sua conta do WhatsApp para começar.";
      actionButton = (
        <Button onClick={connectWhatsApp} disabled={isLoadingWhatsApp} size="lg" className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30 w-full sm:w-auto">
          {isLoadingWhatsApp ? <Spinner variant="infinite" size={20} className="mr-2 text-white" /> : <Smartphone className="mr-2 h-5 w-5" />}
          Conectar WhatsApp Agora
        </Button>
      );
      break;
  }

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg p-6 w-full max-w-2xl mx-auto">
      <div className="mb-6 p-4 border border-white/20 rounded-md bg-white/10 backdrop-blur-sm">
        <div className="flex items-center">
          {statusIcon}
          <div>
            <p className="text-sm font-medium text-white">
              Status: <span className={`font-bold 
                ${whatsAppConnectionStatus === "Conectado" ? "text-green-400" :
                  (whatsAppConnectionStatus === "Aguardando Leitura" || whatsAppConnectionStatus === "PendenteDeLeitura") ? "text-yellow-400" :
                  (whatsAppConnectionStatus === "Erro" || whatsAppConnectionStatus === "Desconectado" || whatsAppConnectionStatus === "Desconhecido") ? "text-red-400" :
                  "text-white/80"}
              `}>
                {statusText}
              </span>
            </p>
            <p className="text-xs text-white/70">
              {statusDescription}
            </p>
          </div>
        </div>
          </div>
          
      {actionButton && (
        <div className="mb-6 text-center">
          {actionButton}
        </div>
      )}
      
      {/* REMOVIDO O MODAL DE QR CODE DUPLICADO DAQUI */}
      {/* O modal principal do QR é gerenciado globalmente pelo WhatsAppContext e aparecerá quando necessário */}

      <div className="mt-8 pt-6 border-t border-white/20">
        <h3 className="text-md font-semibold text-white mb-2 flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-400" />
          Informações Adicionais
        </h3>
        <ul className="list-disc list-inside text-xs text-white/70 space-y-1.5">
          <li>Mantenha seu telefone conectado à internet para o WhatsApp funcionar corretamente.</li>
          <li>Se você desconectar por aqui, a sessão ativa no seu aplicativo WhatsApp também será encerrada.</li>
          <li>Em caso de problemas persistentes, tente desconectar e conectar novamente.</li>
          {whatsAppInstanceName && (
            <li>ID da sua Instância: <span className="font-mono bg-white/20 border border-white/30 px-1.5 py-0.5 rounded text-xs select-all text-white">{whatsAppInstanceName}</span></li>
          )}
        </ul>
      </div>
    </div>
  );
} 