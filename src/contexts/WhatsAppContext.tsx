"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

// --- Constantes ---
const LS_PREFIX = "nuvemx_whatsapp_";
const LS_INSTANCE_NAME = `${LS_PREFIX}instanceName`;
const LS_CONNECTION_STATUS = `${LS_PREFIX}connectionStatus`; // Desconectado, Aguardando Leitura, Conectado
const LS_QR_BASE64 = `${LS_PREFIX}qrBase64`;
const LS_QR_PAIRING_CODE = `${LS_PREFIX}qrPairingCode`;
const LS_QR_EXPIRATION_TIMESTAMP = `${LS_PREFIX}qrExpirationTimestamp`;

const QR_CODE_TIMEOUT = 60 * 1000; // 1 minuto para o QR Code expirar
const POLLING_INTERVAL = 30000; // Aumentado para 30 segundos (menos agressivo)
const BACKGROUND_POLLING_INTERVAL = 120000; // Aumentado para 2 minutos (menos agressivo)

// Flag para desabilitar polling em desenvolvimento se necessário
const DISABLE_POLLING = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_POLLING;

// --- Tipos ---
export type WhatsAppStatus = "Desconectado" | "Aguardando Leitura" | "Conectado" | "Erro" | "IniciandoConexao" | "PendenteDeLeitura" | "Desconhecido" | "QRCodeReady";

interface WhatsAppContextType {
  instanceName: string | null;
  connectionStatus: WhatsAppStatus;
  isQrModalOpen: boolean;
  qrCodeBase64: string | null;
  pairingCode: string | null;
  qrError: string | null;
  isLoading: boolean;
  connectWhatsApp: () => Promise<void>;
  disconnectWhatsApp: () => Promise<void>;
  checkCurrentWhatsAppStatus: (showLoading?: boolean) => Promise<void>;
  closeQrModal: () => void;
  setQrErrorManually: (errorMessage: string | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

// --- Helper Functions ---
const generateInstanceNameForUser = (userId: string): string | null => {
  if (!userId) return null;
  return `nuvemx-whatsapp-${userId}`;
};

// --- Provedor do Contexto ---
export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const currentUserId = user?.id;

  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppStatus>("Desconhecido");
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const qrTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollingIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const connectionStatusRef = useRef<WhatsAppStatus>(connectionStatus);
  const isConnectingRef = useRef<boolean>(false);
  const instanceNameRef = useRef<string | null>(null);
  const isCleaningUpRef = useRef<boolean>(false);

  // Novo useEffect para logar mudanças de estado críticas
  useEffect(() => {
    console.log(`[AppContext DEBUG] Estado mudou: isQrModalOpen: ${isQrModalOpen}, connectionStatus: ${connectionStatus}, isLoading: ${isLoading}`);
    connectionStatusRef.current = connectionStatus;
  }, [isQrModalOpen, connectionStatus, isLoading]);

  // --- Funções de Limpeza ---
  const clearLocalStorageQrData = useCallback(() => {
    localStorage.removeItem(LS_QR_BASE64);
    localStorage.removeItem(LS_QR_PAIRING_CODE);
    localStorage.removeItem(LS_QR_EXPIRATION_TIMESTAMP);
  }, []);

  const resetQrStateAndTimeout = useCallback(() => {
    if (qrTimeoutIdRef.current) {
      clearTimeout(qrTimeoutIdRef.current);
      qrTimeoutIdRef.current = null;
    }
    setQrCodeBase64(null);
    setPairingCode(null);
    setIsQrModalOpen(false);
    clearLocalStorageQrData();
  }, [clearLocalStorageQrData]);

  const stopStatusPolling = useCallback(() => {
    if (statusPollingIntervalIdRef.current) {
      clearInterval(statusPollingIntervalIdRef.current);
      statusPollingIntervalIdRef.current = null;
      console.log("[AppContext] Polling (QR ou Background) PARADO.");
    }
  }, []);

  const performInstanceCleanup = useCallback(async (instanceNameToCleanup: string, context: string) => {
    console.log(`[AppContext] ${context}. Tentando excluir instância: ${instanceNameToCleanup}`);
    if (!instanceNameToCleanup) {
      console.warn(`[AppContext] ${context}. Cleanup abortado: instanceName inválido.`);
      return;
    }
    if (isCleaningUpRef.current) {
      console.log(`[AppContext performInstanceCleanup] Cleanup para ${instanceNameToCleanup} JÁ EM ANDAMENTO (contexto: ${context}). Abortando esta chamada.`);
      return;
    }
    isCleaningUpRef.current = true;
    try {
      const cleanupResponse = await fetch(`/api/whatsapp/instance/delete/${instanceNameToCleanup}`, {
        method: 'DELETE',
      });
      const responseStatus = cleanupResponse.status; 
      let responseData;
      try {
        responseData = await cleanupResponse.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) { // _e não usado, erro de no-unused-vars silenciado
        const text = await cleanupResponse.text().catch(() => "Corpo da resposta não pôde ser lido.");
        responseData = { message: `Resposta do backend não é JSON (Status: ${responseStatus}). Corpo: ${text.substring(0, 200)}` };
        console.warn(`[AppContext performInstanceCleanup] Resposta do backend não é JSON. Status: ${responseStatus}. Texto: ${text.substring(0,200)}`);
      }
      if (!cleanupResponse.ok) {
        let errorMsg = `Falha ao excluir instância ${instanceNameToCleanup} (${context}). Status: ${responseStatus}`;
        errorMsg = responseData.message || responseData.error || errorMsg;
        console.warn(errorMsg, responseData.details ? `Detalhes: ${JSON.stringify(responseData.details)}`: '');
      }
    } catch (error) {
      console.error(`[AppContext] Erro de rede durante cleanup (${context}) para ${instanceNameToCleanup}:`, error);
    } finally {
      isCleaningUpRef.current = false;
    }
  }, []);

  // FUNÇÃO DE POLLING DE STATUS DE FUNDO (RENOMEADA)
  const startBackgroundStatusPolling = useCallback((instanceToPoll: string) => {
    // Verificar se polling está desabilitado
    if (DISABLE_POLLING) {
      console.log(`[AppContext BG Polling] Polling desabilitado por configuração`);
      return;
    }

    // Verificar se há usuário logado antes de iniciar polling
    if (!currentUserId || !instanceToPoll) {
      console.log(`[AppContext BG Polling] Abortando polling: usuário não logado ou instância inválida`);
      return;
    }

    stopStatusPolling(); 
    console.log(`[AppContext BG Polling] INICIADO para ${instanceToPoll} (Intervalo: ${BACKGROUND_POLLING_INTERVAL}ms).`);

    // Define o intervalo e armazena o ID
    const intervalId = setInterval(async () => {
      // Verificar se ainda há usuário logado
      if (!currentUserId) {
        console.log(`[AppContext BG Polling] Usuário não está mais logado. Parando BG Polling.`);
        clearInterval(intervalId);
        return;
      }

      // Verifica se ainda deve rodar (ex: se o usuário deslogou ou desconectou)
      if (connectionStatusRef.current !== "Conectado" || instanceNameRef.current !== instanceToPoll) {
        console.log(`[AppContext BG Polling] Condições mudaram (status: ${connectionStatusRef.current}, instance: ${instanceNameRef.current}). Parando BG Polling para ${instanceToPoll}.`);
        clearInterval(intervalId); // Limpa este intervalo específico
        return;
      }

      console.log(`[AppContext BG Polling] Verificando status para ${instanceToPoll}`);
      try {
        const response = await fetch(`/api/whatsapp/instance/status/${instanceToPoll}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Erro desconhecido ao buscar status (fundo)." }));
          console.warn(`[AppContext BG Polling] Erro ${response.status} ao buscar status para ${instanceToPoll}. Detalhes:`, errorData);
          if (response.status === 404 || response.status === 403) {
            console.log("[AppContext BG Polling] Instância não encontrada ou acesso negado. Parando polling e desconectando.");
            stopStatusPolling();
            setConnectionStatus("Desconectado");
            setInstanceName(null);
            resetQrStateAndTimeout();
            localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
            localStorage.removeItem(LS_INSTANCE_NAME);
          }
          return;
        }
        const data = await response.json();
        console.log(`[AppContext BG Polling] Resposta da API /status para ${instanceToPoll}:`, JSON.stringify(data, null, 2));
        if (data.instance?.state === "open" || data.status === "Conectado") {
          // Se já está conectado, apenas confirma, não faz nada.
          // Se estava desconectado e voltou, atualiza.
          if (connectionStatus !== "Conectado") {
            console.log(`[AppContext BG Polling] Instância ${instanceToPoll} RECONECTADA.`);
            setConnectionStatus("Conectado");
            localStorage.setItem(LS_CONNECTION_STATUS, "Conectado");
            // Se reconectar, não precisa mais do QR modal ou erros relacionados
          resetQrStateAndTimeout();
          setIsQrModalOpen(false);
          setQrError(null);
          }
        } else {
          // Se a API diz que não está 'open', e o status local era 'Conectado'
          if (connectionStatus === "Conectado") {
            console.warn(`[AppContext BG Polling] Instância ${instanceToPoll} DESCONECTOU (API reporta: ${data.instance?.state || data.status}).`);
            setConnectionStatus("Desconectado");
            localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
            // Poderia abrir o modal com uma mensagem, ou apenas atualizar o status.
            // Por enquanto, apenas atualiza o status. O usuário terá que reconectar manually.
          } else {
             console.log(`[AppContext BG Polling] Status para ${instanceToPoll}: ${data.instance?.state || data.status}. Status local: ${connectionStatus}`);
          }
        }
      } catch (error) {
        console.error(`[AppContext BG Polling] Erro na requisição de status (fundo) para ${instanceToPoll}:`, error);
        // Em caso de erro de rede, parar o polling para evitar spam
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.log(`[AppContext BG Polling] Erro de rede detectado. Parando polling para evitar spam.`);
          clearInterval(intervalId);
        }
      }
    }, BACKGROUND_POLLING_INTERVAL);
  }, [stopStatusPolling, resetQrStateAndTimeout, connectionStatus, currentUserId]);

  // NOVA FUNÇÃO PARA POLLING ESPECÍFICO DO QR CODE E STATUS INICIAL
  const startQrPolling = useCallback((instanceToPoll: string) => {
    // Verificar se há usuário logado antes de iniciar polling
    if (!currentUserId || !instanceToPoll) {
      console.log(`[AppContext QR Polling] Abortando polling: usuário não logado ou instância inválida`);
      return;
    }

    stopStatusPolling();
    console.log(`[AppContext QR Polling] INICIADO para ${instanceToPoll} (Intervalo: ${POLLING_INTERVAL}ms).`);

    let pollCounter = 0; // Contador para o número de polls
    const maxPolls = (QR_CODE_TIMEOUT / POLLING_INTERVAL) + 5; // Um pouco mais que o tempo do QR

    statusPollingIntervalIdRef.current = setInterval(async () => {
      // Verificar se ainda há usuário logado
      if (!currentUserId) {
        console.log(`[AppContext QR Polling] Usuário não está mais logado. Parando QR Polling.`);
        stopStatusPolling();
        return;
      }

      pollCounter++;
      console.log(`[AppContext QR Polling] Verificando QR/status para ${instanceToPoll} (Tentativa: ${pollCounter})`);

      if (connectionStatusRef.current === ("Conectado" as WhatsAppStatus)) {
        console.log("[AppContext QR Polling] Status já é 'Conectado'. Parando polling do QR.");
        stopStatusPolling();
        return;
      }

      if (pollCounter > maxPolls) { // Condição simplificada
        console.warn(`[AppContext QR Polling] Máximo de tentativas de polling (maxPolls) atingido para ${instanceToPoll}. Status atual (ref): ${connectionStatusRef.current}`);
        stopStatusPolling();
        if (connectionStatusRef.current !== "Erro" && connectionStatusRef.current !== "Conectado") { // Só define erro se não for um erro já definido por outra lógica
          console.log("[AppContext QR Polling] maxPolls: Condição para definir erro de timeout ATENDIDA.");
          setQrError("Tempo esgotado aguardando atualização do QR Code ou conexão. Tente novamente.");
          setConnectionStatus("Erro");
          setIsQrModalOpen(true);
          localStorage.setItem(LS_CONNECTION_STATUS, "Erro");

          // Adicionado: Limpar a instância no backend
          const instanceToCleanup = instanceNameRef.current;
          if (instanceToCleanup && instanceToCleanup === instanceToPoll) {
            performInstanceCleanup(instanceToCleanup, "startQrPolling (maxPolls atingido)");
          }
        }
        return;
      }

      try {
        const response = await fetch(`/api/whatsapp/instance/qr-status/${instanceToPoll}`);
        const data = await response.json();
        console.log(`[AppContext QR Polling] Resposta da API /qr-status para ${instanceToPoll}:`, JSON.stringify(data, null, 2));

        if (!response.ok) {
          console.warn(`[AppContext QR Polling] Erro ${response.status} ao buscar QR/status para ${instanceToPoll}. Detalhes:`, data);
          if (response.status === 404 || response.status === 403) {
            stopStatusPolling();
            setQrError(data.message || "Instância não encontrada ou acesso negado.");
            setConnectionStatus("Erro");
            setIsQrModalOpen(true);
            localStorage.setItem(LS_CONNECTION_STATUS, "Erro");
            // Não limpar instanceName aqui, o usuário pode tentar de novo
          }
          return;
        }

        if (data.success) {
          setInstanceName(instanceToPoll); // Confirma o nome da instância
          localStorage.setItem(LS_INSTANCE_NAME, instanceToPoll); // Salva no LS
          
          if (data.status === 'open' || data.status === 'Conectado') {
            console.log(`[AppContext QR Polling] Instância ${instanceToPoll} CONECTADA.`);
            if (qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current); // Limpa o timeout geral de conexão
            qrTimeoutIdRef.current = null;
            stopStatusPolling();
            resetQrStateAndTimeout();
            setConnectionStatus("Conectado");
            setIsQrModalOpen(false);
            setQrError(null);
            localStorage.setItem(LS_CONNECTION_STATUS, "Conectado");
            startBackgroundStatusPolling(instanceToPoll);
          } else if (data.qrCodeBase64 || data.pairingCode) {
            const qrChanged = qrCodeBase64 !== data.qrCodeBase64 || pairingCode !== data.pairingCode;
            if (qrChanged) {
              console.log(`[AppContext QR Polling] QR Code ou Pairing Code ATUALIZADO para ${instanceToPoll}.`);
            setQrCodeBase64(data.qrCodeBase64);
            setPairingCode(data.pairingCode);
              if (data.qrCodeBase64) localStorage.setItem(LS_QR_BASE64, data.qrCodeBase64);
              if (data.pairingCode) localStorage.setItem(LS_QR_PAIRING_CODE, data.pairingCode);
              // Reiniciar o timer de expiração do QR se ele mudou
              localStorage.setItem(LS_QR_EXPIRATION_TIMESTAMP, String(Date.now() + QR_CODE_TIMEOUT));
              console.log("[AppContext QR Polling] Timestamp de expiração do QR atualizado no LS.");
            } else {
              console.log(`[AppContext QR Polling] QR/Pairing Code para ${instanceToPoll} recebido, mas é o mesmo. Modal QR deve estar aberto.`);
            }
            setConnectionStatus("QRCodeReady");
            setIsQrModalOpen(true);
            setQrError(null);
            localStorage.setItem(LS_CONNECTION_STATUS, "QRCodeReady");

          } else if (data.status === 'AguardandoLeitura' || data.status === 'PendenteDeLeitura' || data.status === 'connecting' || data.status === 'QRCodeReady') {
             console.log(`[AppContext QR Polling] Instância ${instanceToPoll} ainda está ${data.status}. Modal QR deve estar aberto.`);
             const newPollStatus = data.status as WhatsAppStatus;
             setConnectionStatus(newPollStatus);
             localStorage.setItem(LS_CONNECTION_STATUS, newPollStatus);
             setIsQrModalOpen(true);
          } else {
            console.log(`[AppContext QR Polling] Status para ${instanceToPoll}: ${data.status}. Nenhuma ação específica de QR.`);
             // Poderia definir um status mais específico se necessário, como "AguardandoQRCode"
            // Se o status for "Desconectado" ou "Erro" vindo do backend, refletir isso.
            if (data.status === "Desconectado" || data.status === "Erro") {
                console.warn(`[AppContext QR Polling] Backend reportou ${data.status} para ${instanceToPoll}. Última razão: ${data.lastStatusReason}`);
                setConnectionStatus(data.status as WhatsAppStatus);
                localStorage.setItem(LS_CONNECTION_STATUS, data.status);
                setQrError(data.lastStatusReason || `A instância foi para o estado '${data.status}'.`);
                setIsQrModalOpen(true); // Mantém modal aberto para mostrar erro
                stopStatusPolling(); // Para polling se deu erro definitivo
                performInstanceCleanup(instanceToPoll, "startQrPolling (backend reportou erro)"); // Limpar se erro definitivo do backend
            }
          }
        } else {
           console.warn(`[AppContext QR Polling] Resposta da API /qr-status não teve sucesso: true. Mensagem: ${data.message}`);
           setQrError(data.message || "Falha ao obter status do QR.");
           // Não mudar status global aqui, a menos que seja um erro definitivo
        }
      } catch (error) {
        console.error(`[AppContext QR Polling] Erro de rede ao buscar QR/status para ${instanceToPoll}:`, error);
        // Em caso de erro de rede, parar o polling para evitar spam
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.log(`[AppContext QR Polling] Erro de rede detectado. Parando polling para evitar spam.`);
          stopStatusPolling();
        }
      }
    }, POLLING_INTERVAL);
  }, [stopStatusPolling, performInstanceCleanup, qrCodeBase64, pairingCode, resetQrStateAndTimeout, startBackgroundStatusPolling, currentUserId]);

  // Declarar handleQrTimeout ANTES de restoreQrSessionIfValid
  const handleQrTimeout = useCallback(() => {
    console.log(`[AppContext] handleQrTimeout CHAMADO. Status atual (ref): ${connectionStatusRef.current}`);
    if (qrTimeoutIdRef.current) {
      console.log("[AppContext] handleQrTimeout: Limpando qrTimeoutIdRef.current.");
      clearTimeout(qrTimeoutIdRef.current);
    }
    qrTimeoutIdRef.current = null;

    // Só define erro se AINDA não estiver conectado
    if (connectionStatusRef.current !== "Conectado" && connectionStatusRef.current !== "Erro") {
        console.log("[AppContext] handleQrTimeout: Condição para definir erro de timeout ATENDIDA.");
        setQrError("Tempo para leitura do QR Code esgotado. Tente novamente.");
        setConnectionStatus("Erro");
        setIsQrModalOpen(true);
        localStorage.setItem(LS_CONNECTION_STATUS, "Erro");
        stopStatusPolling(); // Para qualquer polling
        
        // Tenta limpar a instância no backend se houve uma tentativa de criação
        const currentInstanceToCleanup = instanceNameRef.current; // Usa ref para consistência
        if (currentInstanceToCleanup && (connectionStatusRef.current === "IniciandoConexao" || connectionStatusRef.current === "QRCodeReady" || connectionStatusRef.current === "Aguardando Leitura" || connectionStatusRef.current === "PendenteDeLeitura")) {
            performInstanceCleanup(currentInstanceToCleanup, "handleQrTimeout");
        }
    }
    setIsLoading(false);
    isConnectingRef.current = false;
  }, [stopStatusPolling, performInstanceCleanup]);

  const restoreQrSessionIfValid = useCallback(() => {
    const lsInstanceName = localStorage.getItem(LS_INSTANCE_NAME);
    const lsQrBase64 = localStorage.getItem(LS_QR_BASE64);
    const lsPairingCode = localStorage.getItem(LS_QR_PAIRING_CODE);
    const lsQrExpirationTimestamp = localStorage.getItem(LS_QR_EXPIRATION_TIMESTAMP);
    const lsStatus = localStorage.getItem(LS_CONNECTION_STATUS) as WhatsAppStatus | null;

    if (lsInstanceName && (lsQrBase64 || lsPairingCode || lsStatus === "Aguardando Leitura" || lsStatus === "PendenteDeLeitura" || lsStatus === "QRCodeReady") && lsQrExpirationTimestamp) {
      const expirationTime = parseInt(lsQrExpirationTimestamp, 10);
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime;

      if (timeLeft > 0 && timeLeft <= QR_CODE_TIMEOUT) { // Garante que timeLeft é positivo e não maior que a duração original
        console.log(`[AppContext] Restaurando sessão de QR ativa para ${lsInstanceName}. Tempo restante: ${Math.round(timeLeft/1000)}s. Status LS: ${lsStatus}`);
        setInstanceName(lsInstanceName);
        instanceNameRef.current = lsInstanceName;
        setQrCodeBase64(lsQrBase64);
        setPairingCode(lsPairingCode);
        
        const statusToRestore = (lsStatus === "Aguardando Leitura" || lsStatus === "PendenteDeLeitura" || lsStatus === "QRCodeReady") 
                                ? lsStatus 
                                : (lsQrBase64 || lsPairingCode ? "QRCodeReady" : "Aguardando Leitura");
        setConnectionStatus(statusToRestore);
        connectionStatusRef.current = statusToRestore;
        setIsQrModalOpen(true);
        setQrError(null);
        localStorage.setItem(LS_CONNECTION_STATUS, statusToRestore); 

        startQrPolling(lsInstanceName);

        if (qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current);
        qrTimeoutIdRef.current = setTimeout(() => {
          const currentInternalStatus = connectionStatusRef.current;
          const currentInternalInstance = instanceNameRef.current;
          console.warn(`[AppContext] Timeout do QR Code (restaurado via LS) atingido para ${currentInternalInstance}. Status era ${currentInternalStatus}`);
          // Apenas atualiza o estado se o QR realmente expirou e não foi conectado ou erro por outro motivo
          if (currentInternalInstance === lsInstanceName && currentInternalStatus !== "Conectado" && currentInternalStatus !== "Erro") { 
            handleQrTimeout(); // Chama a função centralizada de timeout do QR
          }
          // Não precisa parar o polling aqui, handleQrTimeout ou startQrPolling (se conectado) fará isso.
        }, timeLeft);
        return true;
      }
    }
    // Se chegou aqui, a sessão não é válida ou não existe
    console.log("[AppContext] Nenhuma sessão de QR válida para restaurar ou dados insuficientes no LS.");
    clearLocalStorageQrData(); // Limpa quaisquer dados de QR fragmentados
    return false;
  }, [startQrPolling, clearLocalStorageQrData, handleQrTimeout]);

  const connectWhatsApp = useCallback(async () => {
    if (!currentUserId) {
      console.error("[AppContext] Tentativa de conectar WhatsApp sem ID de usuário.");
      setQrError("Usuário não autenticado. Por favor, faça login novamente.");
      setIsQrModalOpen(true);
      return;
    }

    const generatedName = generateInstanceNameForUser(currentUserId);
    if (!generatedName) {
      console.error("[AppContext] Não foi possível gerar o nome da instância.");
      setQrError("Não foi possível determinar o nome da instância para o usuário.");
      setIsQrModalOpen(true);
      return;
    }

    isConnectingRef.current = true;
    console.log(`[AppContext] Iniciando conexão para instância: ${generatedName}. isConnectingRef: ${isConnectingRef.current}`);
    setIsLoading(true);
    setQrError(null);
    setConnectionStatus("IniciandoConexao"); 
    setIsQrModalOpen(true); 

    resetQrStateAndTimeout();

    if (qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current);
    qrTimeoutIdRef.current = setTimeout(() => {
      const currentInternalStatus = connectionStatusRef.current;
      if (currentInternalStatus !== "Conectado") {
        console.warn(`[AppContext] Timeout GERAL da tentativa de conexão atingido para ${generatedName} (status era ${currentInternalStatus}).`);
        setQrError("A tentativa de conexão demorou demais. Verifique sua conexão ou se há algum problema com o serviço e tente novamente.");
      setConnectionStatus("Erro");
      setIsQrModalOpen(true); 
        stopStatusPolling();
        setIsLoading(false);
        isConnectingRef.current = false;
      }
    }, QR_CODE_TIMEOUT + 5000);

    try {
      console.log(`[AppContext] Tentando criar instância. Nome gerado para requisição: ${generatedName}`);
      const response = await fetch('/api/whatsapp/instance/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedInstanceName: generatedName }),
      });

      const data = await response.json();
      console.log("[AppContext] Resposta da API /create:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        if(qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current);
        qrTimeoutIdRef.current = null;
        setQrError(data.message || `Falha ao criar/conectar instância: ${response.statusText}`);
        setConnectionStatus("Erro");
        setIsQrModalOpen(true);
        stopStatusPolling();
        return;
      }

      if (data.success === false) {
        if(qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current);
        qrTimeoutIdRef.current = null;
        setQrError(data.message || "Falha na lógica da API ao criar instância.");
        setConnectionStatus("Erro");
        setIsQrModalOpen(true);
        stopStatusPolling();
        return;
      }

      setInstanceName(generatedName);
      localStorage.setItem(LS_INSTANCE_NAME, generatedName);

      if (data.success !== false && data.instance && (data.instance.status === 'open' || data.instance.status === 'connected')) {
          console.log(`[AppContext] Instância ${generatedName} conectada imediatamente pela API /create.`);
        if(qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current);
          qrTimeoutIdRef.current = null;
        resetQrStateAndTimeout();
          setConnectionStatus("Conectado");
          setIsQrModalOpen(false);
          setQrError(null);
          localStorage.setItem(LS_CONNECTION_STATUS, "Conectado");
        stopStatusPolling(); 
        startBackgroundStatusPolling(generatedName);
      } else if (data.success !== false && data.qrcode && (data.qrcode.base64 || data.qrcode.code)) {
        console.log(`[AppContext] API /create retornou QR/Pairing Code para ${generatedName}. Exibindo QR e iniciando QR polling.`);
          setQrCodeBase64(data.qrcode.base64);
          setPairingCode(data.qrcode.code);
          setConnectionStatus("QRCodeReady");
        setIsQrModalOpen(true);
          localStorage.setItem(LS_CONNECTION_STATUS, "QRCodeReady");
          if(data.qrcode.base64) localStorage.setItem(LS_QR_BASE64, data.qrcode.base64);
          if(data.qrcode.code) localStorage.setItem(LS_QR_PAIRING_CODE, data.qrcode.code);
        localStorage.setItem(LS_QR_EXPIRATION_TIMESTAMP, String(Date.now() + QR_CODE_TIMEOUT));
          startQrPolling(generatedName);
      } else if (data.success !== false && (data.status === 'AguardandoLeitura' || data.status === 'PendenteDeLeitura' || data.instance?.status === 'pending' || data.instance?.status === 'connecting' || data.instance?.status === 'QRCodeReady')) {
        console.log(`[AppContext] API /create indica que ${generatedName} está ${data.status || data.instance?.status} (SEM QR IMEDIATO ou já QRCodeReady). Iniciando QR polling.`);
        const newStatus = data.status === 'PendenteDeLeitura' ? "PendenteDeLeitura" : (data.instance?.status === 'QRCodeReady' ? "QRCodeReady" : "Aguardando Leitura");
        setConnectionStatus(newStatus);
        setIsQrModalOpen(true);
        localStorage.setItem(LS_CONNECTION_STATUS, newStatus);
          startQrPolling(generatedName);
        } else {
        console.warn(`[AppContext] Resposta da API /create para ${generatedName} não clara ou falhou (data.success: ${data.success}, status: ${data.status}, instance.status: ${data.instance?.status}). Mensagem: ${data.message}. Iniciando QR polling como fallback.`);
        setConnectionStatus("Aguardando Leitura");
        setIsQrModalOpen(true);
        localStorage.setItem(LS_CONNECTION_STATUS, "Aguardando Leitura");
        startQrPolling(generatedName);
      }
    } catch (error) {
      console.error(`[AppContext] Erro de rede ou outro erro em connectWhatsApp para ${generatedName}:`, error);
      if(qrTimeoutIdRef.current) clearTimeout(qrTimeoutIdRef.current);
      qrTimeoutIdRef.current = null;
      setQrError("Erro de rede ao tentar conectar. Verifique sua conexão e tente novamente.");
      setConnectionStatus("Erro");
      setIsQrModalOpen(true);
      stopStatusPolling();
    } finally {
      setIsLoading(false);
      isConnectingRef.current = false;
      console.log(`[AppContext] Fim de connectWhatsApp. isConnectingRef: ${isConnectingRef.current}`);
    }
  }, [currentUserId, resetQrStateAndTimeout, startQrPolling, startBackgroundStatusPolling, stopStatusPolling]);

  const disconnectWhatsApp = useCallback(async () => {
    const instanceToDisconnect = instanceNameRef.current; // Usa a ref para o valor mais atual
    console.log("[AppContext] disconnectWhatsApp chamado para instância:", instanceToDisconnect);
    setIsLoading(true);
    stopStatusPolling();
    if (qrTimeoutIdRef.current) {
        clearTimeout(qrTimeoutIdRef.current);
        qrTimeoutIdRef.current = null;
    }

    resetQrStateAndTimeout(); // Limpa QR, pairing code, modal, e dados do QR no LS
    setConnectionStatus("Desconectado");
    setInstanceName(null); // Limpa o nome da instância do estado
    instanceNameRef.current = null; // E da ref

    localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
    localStorage.removeItem(LS_INSTANCE_NAME);
    // clearLocalStorageQrData() já é chamado por resetQrStateAndTimeout

    if (instanceToDisconnect) {
      await performInstanceCleanup(instanceToDisconnect, "disconnectWhatsApp (solicitado pelo usuário)");
    } else {
      console.warn("[AppContext] Tentativa de desconectar sem instanceName (instanceNameRef.current era nulo).");
    }
    setIsLoading(false);
    console.log("[AppContext] disconnectWhatsApp finalizado. Estado resetado, instância (se existia) instruída para deletar.");
  }, [stopStatusPolling, performInstanceCleanup, resetQrStateAndTimeout]);

  const setQrErrorManually = useCallback((errorMessage: string | null) => {
    setQrError(errorMessage);
    if (errorMessage && !isQrModalOpen) {
      setIsQrModalOpen(true);
    }
  }, [isQrModalOpen]);

  const checkCurrentWhatsAppStatus = useCallback(async (showLoading = true) => {
    if (isConnectingRef.current) {
      console.log("[AppContext] checkCurrentStatus: Abortado pois uma conexão está em andamento (isConnectingRef=true).");
      return;
    }
    if (!currentUserId) {
      console.log("[AppContext] checkCurrentStatus: Sem usuário, definindo como Desconectado.");
      setConnectionStatus("Desconectado");
      setInstanceName(null);
      localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
      localStorage.removeItem(LS_INSTANCE_NAME);
      resetQrStateAndTimeout();
      stopStatusPolling();
      return;
    }

    const currentInstanceName = instanceName || generateInstanceNameForUser(currentUserId);
    if (!currentInstanceName) {
      console.log("[AppContext] checkCurrentStatus: Não foi possível determinar instanceName. Definindo Desconectado.");
      setConnectionStatus("Desconectado");
      localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
      return;
    }
    
    if (showLoading) setIsLoading(true);
    console.log(`[AppContext] checkCurrentStatus chamado para ${currentInstanceName}`);

    try {
      const response = await fetch(`/api/whatsapp/instance/status/${currentInstanceName}`);
      const data = await response.json(); // Tenta parsear JSON independentemente do status de OK
      console.log(`[AppContext] checkCurrentStatus - Resposta da API /status/${currentInstanceName}: Status ${response.status}, Dados:`, JSON.stringify(data, null, 2));

      if (response.ok) {
        const apiStatus = data.instance?.state || data.status;
        if (apiStatus === "open" || apiStatus === "Conectado") {
          console.log(`[AppContext] checkCurrentStatus: Instância ${currentInstanceName} está Conectada.`);
          setConnectionStatus("Conectado");
          setInstanceName(currentInstanceName);
          localStorage.setItem(LS_CONNECTION_STATUS, "Conectado");
          localStorage.setItem(LS_INSTANCE_NAME, currentInstanceName);
          resetQrStateAndTimeout(); // Limpa QR e modal se estava aberto
          stopStatusPolling(); // Para qualquer polling anterior
          startBackgroundStatusPolling(currentInstanceName); // Inicia polling de fundo
        } else if (["connecting", "AguardandoLeitura", "PendenteDeLeitura", "QRCodeReady"].includes(apiStatus)) {
          console.log(`[AppContext] checkCurrentStatus: Instância ${currentInstanceName} está em estado intermediário: ${apiStatus}.`);
          setConnectionStatus(apiStatus as WhatsAppStatus);
          setInstanceName(currentInstanceName);
          localStorage.setItem(LS_CONNECTION_STATUS, apiStatus);
          localStorage.setItem(LS_INSTANCE_NAME, currentInstanceName);
          // Não inicia polling de QR aqui, pois esta função é mais para verificação geral.
          // A lógica de `connectWhatsApp` ou `restoreQrSessionIfValid` deve iniciar o `startQrPolling`.
          // Se o modal de QR estava aberto e o status é relacionado a QR, pode mantê-lo ou reabri-lo.
          if (apiStatus === "QRCodeReady" || apiStatus === "AguardandoLeitura" || apiStatus === "PendenteDeLeitura") {
            if(data.instance?.qr_code_base64 || data.instance?.qr_pairing_code){
              setQrCodeBase64(data.instance.qr_code_base64);
              setPairingCode(data.instance.qr_pairing_code);
              localStorage.setItem(LS_QR_BASE64, data.instance.qr_code_base64 || "");
              localStorage.setItem(LS_QR_PAIRING_CODE, data.instance.qr_pairing_code || "");
              localStorage.setItem(LS_QR_EXPIRATION_TIMESTAMP, String(Date.now() + QR_CODE_TIMEOUT));
            }
            setIsQrModalOpen(true);
          }
        } else {
          // Estado não esperado ou 'Desconectado' vindo da API
          console.warn(`[AppContext] checkCurrentStatus: Instância ${currentInstanceName} em estado não conectado ou inesperado: ${apiStatus}.`);
          setConnectionStatus("Desconectado");
          localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
          // Não limpar instanceName aqui, pois o usuário pode tentar reconectar.
          // resetQrStateAndTimeout(); // Poderia ser chamado se quiséssemos limpar o QR nesse caso.
        }
      } else {
        // Erros da API (não OK)
        console.warn(`[AppContext] checkCurrentStatus: Erro ${response.status} ao buscar status para ${currentInstanceName}. Mensagem: ${data.message || 'Erro desconhecido'}`);
        if (response.status === 404 || response.status === 403) {
          console.log(`[AppContext] checkCurrentStatus: Instância ${currentInstanceName} não encontrada ou acesso negado. Resetando.`);
          setConnectionStatus("Desconectado");
          setInstanceName(null);
          localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
          localStorage.removeItem(LS_INSTANCE_NAME);
          resetQrStateAndTimeout();
          stopStatusPolling();
        } else if (response.status === 504) {
          console.warn(`[AppContext] checkCurrentStatus: Gateway Timeout (504) para ${currentInstanceName}. Mantendo status atual ou definindo como Erro Temporário se necessário.`);
          // Não mudar para Desconectado imediatamente. Deixar o polling tentar novamente ou o usuário agir.
          // Poderia-se introduzir um status "ErroTemporario" se desejado.
          // Por agora, não alteramos o status, permitindo que o polling existente continue (se houver) ou que o usuário tente novamente.
          setQrError(data.message || "O servidor demorou muito para responder. Tente novamente em alguns instantes.");
          // Se o modal de QR estava aberto, mantenha-o para mostrar o erro.
          if (isQrModalOpen) setQrErrorManually(data.message || "O servidor demorou muito para responder. Tente novamente em alguns instantes.");
        } else {
          // Outros erros de API
          setConnectionStatus("Erro"); // Um erro mais genérico
          localStorage.setItem(LS_CONNECTION_STATUS, "Erro");
          setQrError(data.message || `Erro ${response.status} ao verificar status.`);
          if (!isQrModalOpen) setIsQrModalOpen(true); // Abre o modal para mostrar o erro
        }
      }
    } catch (error) {
      console.error(`[AppContext] checkCurrentStatus: Exceção de rede ou parse para ${currentInstanceName}:`, error);
      setConnectionStatus("Erro");
      localStorage.setItem(LS_CONNECTION_STATUS, "Erro");
      setQrError("Erro de comunicação ao verificar status. Verifique sua conexão.");
      if (!isQrModalOpen) setIsQrModalOpen(true);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [currentUserId, instanceName, resetQrStateAndTimeout, stopStatusPolling, startBackgroundStatusPolling, isQrModalOpen, setQrErrorManually]);

  const closeQrModal = useCallback(() => {
    console.log("[AppContext] closeQrModal chamado. Status atual:", connectionStatus);
    if (connectionStatus === "Aguardando Leitura") {
      console.log("[AppContext] Modal QR fechado pelo usuário enquanto aguardava leitura. Mudando status para PendenteDeLeitura.");
      setConnectionStatus("PendenteDeLeitura");
      localStorage.setItem(LS_CONNECTION_STATUS, "PendenteDeLeitura");
      setIsQrModalOpen(false);
    } else if (connectionStatus === "Erro" || connectionStatus === "Conectado"){
      setIsQrModalOpen(false);
    } else {
      setIsQrModalOpen(false);
    }
  }, [connectionStatus]);

  useEffect(() => {
    console.log("[AppContext useEffect Inicial/UserChange] User:", currentUserId, `isConnectingRef: ${isConnectingRef.current}`);
    if (currentUserId) {
      const storedInstanceName = localStorage.getItem(LS_INSTANCE_NAME);
      const expectedInstanceName = generateInstanceNameForUser(currentUserId!);
      const initialStatus = localStorage.getItem(LS_CONNECTION_STATUS) as WhatsAppStatus | null;

      stopStatusPolling();

      if (storedInstanceName && storedInstanceName === expectedInstanceName) {
        setInstanceName(storedInstanceName);
        instanceNameRef.current = storedInstanceName; 
        console.log(`[AppContext useEffect] Instância ${storedInstanceName} encontrada no LS para usuário ${currentUserId}. Status LS: ${initialStatus}`);

        if (initialStatus === "Conectado") {
          setConnectionStatus("Conectado");
          connectionStatusRef.current = "Conectado";
          console.log("[AppContext useEffect] Status Conectado. Limpando QR e iniciando BG polling.");
          resetQrStateAndTimeout(); 
          startBackgroundStatusPolling(expectedInstanceName);
        } else if (initialStatus === "Aguardando Leitura" || initialStatus === "PendenteDeLeitura" || initialStatus === "QRCodeReady" || initialStatus === "Erro") {
          // Tenta restaurar a sessão do QR se o timestamp for válido, mesmo se o status for Erro (pode ter sido um erro de QR expirado)
          if (restoreQrSessionIfValid()) {
            console.log("[AppContext useEffect] Sessão QR restaurada ou tentativa de restauração em andamento.");
          } else {
            // Se não restaurou (QR expirado ou dados inválidos), e o status era relacionado a QR ou Erro, reseta para Desconectado.
            console.log("[AppContext useEffect] Sessão QR no LS inválida/expirada. Resetando para Desconectado.");
            setConnectionStatus("Desconectado");
            connectionStatusRef.current = "Desconectado";
            localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
            clearLocalStorageQrData(); 
          }
        } else { // Status no LS é Desconhecido ou nulo, ou outro não previsto
          console.log(`[AppContext useEffect] Status LS é ${initialStatus || 'nulo/desconhecido'}. Definindo como Desconectado e limpando QR.`);
          setConnectionStatus("Desconectado");
          connectionStatusRef.current = "Desconectado";
          localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
          clearLocalStorageQrData(); 
        }
      } else { // Nenhuma instância no LS ou não corresponde ao usuário
        console.log(`[AppContext useEffect] Nenhuma instância no LS ou não corresponde ao usuário ${currentUserId}. Limpando tudo.`);
        setConnectionStatus("Desconectado");
        connectionStatusRef.current = "Desconectado";
        setInstanceName(null);
        instanceNameRef.current = null;
        localStorage.setItem(LS_CONNECTION_STATUS, "Desconectado");
        localStorage.removeItem(LS_INSTANCE_NAME);
        clearLocalStorageQrData();
        resetQrStateAndTimeout(); // Garante que timers também sejam limpos
      }
    }
  }, [currentUserId, clearLocalStorageQrData, restoreQrSessionIfValid, startBackgroundStatusPolling, stopStatusPolling, resetQrStateAndTimeout]);

  useEffect(() => {
    instanceNameRef.current = instanceName;
  }, [instanceName]);

  // --- Efeitos ---
  // Limpar pollings quando usuário não está logado
  useEffect(() => {
    if (!currentUserId) {
      console.log('[AppContext] Usuário não logado, parando todos os pollings e limpando estado');
      stopStatusPolling();
      resetQrStateAndTimeout();
      setConnectionStatus("Desconhecido");
      setInstanceName(null);
      setIsLoading(false);
      setQrError(null);
    }
  }, [currentUserId, stopStatusPolling, resetQrStateAndTimeout]);

  // Carregar estado do localStorage quando o usuário estiver logado

  const contextValue: WhatsAppContextType = {
    instanceName,
    connectionStatus,
    isQrModalOpen,
    qrCodeBase64,
    pairingCode,
    qrError,
    isLoading,
    connectWhatsApp,
    disconnectWhatsApp,
    checkCurrentWhatsAppStatus,
    closeQrModal,
    setQrErrorManually,
  };

  return <WhatsAppContext.Provider value={contextValue}>{children}</WhatsAppContext.Provider>;
};

// --- Hook Customizado ---
export const useWhatsApp = (): WhatsAppContextType => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}; 