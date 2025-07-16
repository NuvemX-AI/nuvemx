"use client";

import React from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { useWhatsApp } from "@/contexts/WhatsAppContext"; // Importar o contexto
import type { WhatsAppStatus } from "@/contexts/WhatsAppContext"; // IMPORTAR O TIPO

export default function GlobalQrModal() {
  const { 
    isQrModalOpen, 
    qrCodeBase64, 
    qrError, 
    closeQrModal, 
    connectionStatus,
    pairingCode // Adicionado para exibir se disponível
  } = useWhatsApp();

  if (!isQrModalOpen) {
    return null; // Não renderizar nada se o modal não deve estar aberto
  }

  return (
    <Dialog open={isQrModalOpen} onOpenChange={(isOpen) => { if (!isOpen) closeQrModal(); }}>
      <DialogContent className="sm:max-w-md bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {qrError ? "Erro na Conexão" : "Conectar WhatsApp"}
          </DialogTitle>
          {qrError ? (
            <DialogDescription className="text-red-400 pt-2">
              {qrError}
            </DialogDescription>
          ) : (
            <DialogDescription className="text-white/70 pt-2">
              Escaneie o QR Code abaixo com seu aplicativo WhatsApp.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {/* Mostrar QR Code se disponível e não houver erro */}
        {!qrError && qrCodeBase64 && (
          <div className="flex items-center justify-center p-4 my-4">
            <Image src={qrCodeBase64} alt="QR Code do WhatsApp" width={256} height={256} className="rounded-lg border border-white/20" />
          </div>
        )}

        {/* Mostrar Pairing Code APENAS SE qrCodeBase64 NÃO ESTIVER disponível e não houver erro */}
        {!qrError && !qrCodeBase64 && pairingCode && (
          <div className="mt-3 p-2 bg-white/10 border border-white/20 rounded text-center mb-4">
            <p className="text-sm text-white/70">Ou use o código de pareamento:</p>
            <p className="text-2xl font-bold tracking-wider text-white py-2">{pairingCode.replace(/(\d{3})/g, '$1-').slice(0,-1)}</p>
          </div>
        )}

        {/* Mostrar "Aguardando Leitura" apenas se NENHUM QR/Pairing code estiver visível e não houver erro*/}
        {connectionStatus === ("Aguardando Leitura" as WhatsAppStatus) && !qrError && !qrCodeBase64 && !pairingCode && (
          <div className="text-center text-sm text-white/60 mt-2">
            Aguardando leitura... O código expira em breve.
          </div>
        )}
         <DialogFooter className="sm:justify-center mt-6">
          <Button 
            type="button" 
            variant={qrError ? "destructive" : "outline"} 
            onClick={closeQrModal}
            className={`w-full sm:w-auto cursor-pointer ${
              qrError 
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }`}
          >
            {qrError ? "Entendido" : "Cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 