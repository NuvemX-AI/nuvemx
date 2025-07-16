"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    Paperclip,
    ArrowUp,
    XIcon,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react"
import { Spinner } from "@/app/components/ui/spinner";
import { OpenAiIcon } from "@/app/components/logos/OpenAiIcon";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

interface AnimatedAIChatProps {
    onSendMessage: (message: string, attachments?: File[]) => void;
    isProcessing: boolean;
    onNewConversation: () => void;
    isOpenAIActive: boolean;
    onOpenAIStatusClick: () => void;
    isInitialLargeView?: boolean;
}

export function AnimatedAIChat({ 
    onSendMessage, 
    isProcessing, 
    onNewConversation, 
    isOpenAIActive,
    onOpenAIStatusClick,
    isInitialLargeView = false
}: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 40, 
        maxHeight: isInitialLargeView ? 80 : 120, // MODIFIED: maxHeight for initialLargeView to 80px
    });
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <ImageIcon className="w-4 h-4" />, 
            label: "Clone UI", 
            description: "Generate a UI from a screenshot", 
            prefix: "/clone" 
        },
        { 
            icon: <Figma className="w-4 h-4" />, 
            label: "Import Figma", 
            description: "Import a design from Figma", 
            prefix: "/figma" 
        },
        { 
            icon: <MonitorIcon className="w-4 h-4" />, 
            label: "Create Page", 
            description: "Generate a new web page", 
            prefix: "/page" 
        },
        { 
            icon: <Sparkles className="w-4 h-4" />, 
            label: "Improve", 
            description: "Improve existing UI design", 
            prefix: "/improve" 
        },
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
        } else {
            setShowCommandPalette(false);
            setActiveSuggestion(-1);
        }
        adjustHeight();
    }, [value, adjustHeight]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                commandPaletteRef.current &&
                !commandPaletteRef.current.contains(event.target as Node) &&
                textareaRef.current && // textareaRef.current is stable within this effect's lifecycle
                !textareaRef.current.contains(event.target as Node)
            ) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // textareaRef.current is accessed, but its stability is handled by the nature of refs and this effect's lifecycle.

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev + 1) % commandSuggestions.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev - 1 + commandSuggestions.length) % commandSuggestions.length);
            } else if (e.key === "Enter" && activeSuggestion !== -1) {
                e.preventDefault();
                selectCommandSuggestion(activeSuggestion);
            } else if (e.key === "Escape") {
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            triggerSendMessage();
        }

        if (e.key === "/" && e.metaKey) {
            e.preventDefault();
            setShowCommandPalette(true);
        }
    };

    const triggerSendMessage = () => {
        if (value.trim() || attachments.length > 0) {
            onSendMessage(value, attachments);
            setValue("");
            setAttachments([]);
            adjustHeight(true);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setAttachments((prev) => [...prev, ...files].slice(0, 5)); // Max 5 files
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const selectCommandSuggestion = (index: number) => {
        const command = commandSuggestions[index];
        setValue(command.prefix + ' ');
        setShowCommandPalette(false);
        textareaRef.current?.focus();
    };

    return (
        <div className={cn(
                "relative w-full backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10",
                isInitialLargeView ? "p-4 min-h-[92px]" : "p-2.5",
                "flex flex-col justify-between transition-all duration-300 ease-in-out",
                "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none"
        )}>
            {/* Command Palette - absolute positioning */}
            {showCommandPalette && (
                <motion.div 
                    ref={commandPaletteRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-20"
                >
                    <p className="text-xs text-white/70 dark:text-white/60 px-2 pb-1.5 pt-0.5 font-medium border-b border-white/20 dark:border-white/10 mb-1.5">
                        COMANDOS IA
                    </p>
                    <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 dark:scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {commandSuggestions.map((suggestion, index) => (
                            <button
                                key={suggestion.prefix}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-sm transition-colors duration-100 ease-in-out",
                                    activeSuggestion === index ? "bg-white/20 dark:bg-white/10" : "hover:bg-white/10 dark:hover:bg-white/5"
                                )}
                                onClick={() => selectCommandSuggestion(index)}
                                onMouseEnter={() => setActiveSuggestion(index)}
                            >
                                <div className="p-1.5 bg-white/20 dark:bg-white/10 rounded-lg">
                                    {suggestion.icon}
                                </div>
                                <div>
                                    <p className="font-medium text-white dark:text-white">{suggestion.label}</p>
                                    <p className="text-xs text-white/60 dark:text-white/50">{suggestion.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Main input area and buttons */}
            <div className="flex flex-col w-full relative z-10 gap-0">
                {/* Textarea */} 
                <div className="w-full">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Pergunte alguma coisa..." 
                        rows={1}
                        className={cn(
                            "w-full bg-transparent resize-none focus:ring-0 focus:outline-none py-2 pl-3 pr-10 text-sm leading-6 scrollbar-thin scrollbar-thumb-white/30 dark:scrollbar-thumb-white/20 scrollbar-track-transparent",
                            "text-white dark:text-white border-none",
                            "min-h-[36px]",
                            "[&::placeholder]:text-[#ababab]"
                        )}
                        style={{ 
                            color: "white",
                            "--tw-placeholder-color": "#ababab"
                        } as React.CSSProperties & { "--tw-placeholder-color": string }}
                        onKeyDown={handleKeyDown}
                        showRing={false}
                    />
                </div>

                {/* Botões na parte inferior */}
                <div className="flex items-center justify-between w-full px-1">
                    {/* Lado esquerdo: Anexar + Nova Conversa */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-xl transition-colors duration-150 ease-in-out focus:outline-none bg-white/10 hover:bg-white/20 backdrop-blur-sm cursor-pointer"
                            title="Anexar arquivos"
                        >
                            <Paperclip className="w-4 h-4 text-white" />
                        </button>
                            <button
                            onClick={onNewConversation}
                            className="flex items-center gap-1.5 text-xs text-white hover:text-white/90 transition-colors"
                            title="Iniciar Nova Conversa"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Nova Conversa
                            </button>
                    </div>
                    
                    {/* Lado direito: OpenAI + Enviar */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onOpenAIStatusClick}
                            className={cn(
                                "flex items-center text-xs px-2 py-1 rounded-full transition-colors backdrop-blur-sm border",
                                isOpenAIActive 
                                    ? "bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-400/30" 
                                    : "bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-400/30"
                            )}
                            title={isOpenAIActive ? "Conexão com OpenAI ativa" : "Conexão com OpenAI inativa"}
                        >
                            <OpenAiIcon className="w-3 h-3 mr-1 brightness-0 invert" />
                            OpenAI
                        </button>
                        
                        <button
                            type="button"
                            onClick={triggerSendMessage}
                            className={cn(
                                "p-2 rounded-xl transition-colors duration-150 ease-in-out focus:outline-none",
                                (value.trim() || attachments.length > 0) 
                                    ? "bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white hover:from-blue-500/90 hover:to-purple-600/90 cursor-pointer backdrop-blur-sm"
                                    : "bg-white/10 text-white/40 cursor-not-allowed",
                                isProcessing ? "opacity-70 cursor-wait" : ""
                            )}
                            disabled={!value.trim() && attachments.length === 0}
                            title="Enviar Mensagem (Enter)"
                        >
                            {isProcessing ? (
                                <Spinner variant="infinite" size={16} className="text-white" />
                            ) : (
                                <ArrowUp className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20 dark:border-white/10 relative z-10">
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center gap-1.5 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
                                <FileUp className="w-3 h-3 text-white/70 dark:text-white/60" />
                                <span className="text-white dark:text-white">{file.name}</span>
                                <button onClick={() => removeAttachment(index)} className="text-white/60 hover:text-white/80 dark:text-white/50 dark:hover:text-white/70">
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Hidden file input */}
            <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" // Example file types
            />

            {/* ADICIONAR O SPINNER DE PROCESSAMENTO AQUI */}
            {isProcessing && (
                <div className="flex justify-center items-center py-4 relative z-10">
                    <Spinner variant="infinite" className="h-6 w-6 text-white dark:text-white" />
                </div>
            )}
        </div>
    );
}


