"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { KeyRound, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { Spinner } from "@/app/components/ui/spinner";

interface OpenAIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  isConfigured: boolean; // Para futuramente adaptar o modal (ex: mostrar apenas últimos 4 dígitos)
}

export default function OpenAIConfigModal({
  isOpen,
  onClose,
  onSaveSuccess,
  isConfigured,
}: OpenAIConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpa o estado do input e erros quando o modal é fechado ou aberto
  useEffect(() => {
    if (isOpen) {
      setApiKey('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setError("A chave API da OpenAI não pode estar vazia.");
      toast.error("A chave API da OpenAI não pode estar vazia.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/openai/config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Erro ${response.status} ao salvar a chave.`);
      }

      toast.success(responseData.message || "Chave API da OpenAI salva com sucesso!");
      onSaveSuccess(); // Chama o callback da página pai
      // onClose(); // Fechar o modal é responsabilidade da página pai através de onSaveSuccess
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      console.error("Erro ao salvar chave OpenAI:", err);
      setError(errorMessage);
      toast.error(`Falha ao salvar: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <KeyRound className="mr-2 h-5 w-5" />
            {isConfigured ? "Gerenciar Chave OpenAI" : "Configurar Chave OpenAI"}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {isConfigured 
              ? "Você já tem uma chave API configurada. Para alterá-la, insira uma nova chave abaixo." 
              : "Insira sua chave API da OpenAI para habilitar as funcionalidades de inteligência artificial."}
            {' '}Para obter sua chave, acesse{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-blue-300 hover:text-blue-200"
            >
              OpenAI API Keys
            </a>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div>
            <label htmlFor="openai-api-key" className="sr-only">Chave API da OpenAI</label>
            <Input
              id="openai-api-key"
              type="password"
              placeholder="sk-************************************************"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
            />
          </div>
          {error && (
            <div className="flex items-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-2">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSaveKey} disabled={isLoading || !apiKey.trim()} className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30">
            {isLoading ? (
              <Spinner variant="infinite" className="mr-2 h-4 w-4" />
            ) : null}
            {isLoading ? "Salvando..." : "Salvar Chave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 