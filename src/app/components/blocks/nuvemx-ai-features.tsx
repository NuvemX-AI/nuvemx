// Test comment
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { EvervaultCard, Icon as EvervaultIcon } from "@/components/ui/evervault-card";
import { cn } from '@/lib/utils';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { 
    Gemini, 
    ShopifyIcon, 
    OpenAIIcon, 
    WhatsAppIcon,
    InstagramIcon,
    ClaudeAIIcon,
    VercelIcon
} from '@/components/logos';
import GeminiLogoComponent from "@/components/logos/Gemini";
import { ComponentV2 as EtherealShadowHeroContentWrapper } from "@/components/ui/etheral-shadow-v2";
import { Component as EtherealShadowV4 } from "@/components/ui/etheral-shadow-v4";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { motion, Variants } from 'framer-motion';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { MessageLoading } from '@/components/ui/message-loading';
import dynamic from 'next/dynamic';
// Ícones removidos pois não estão sendo utilizados
import { Globe } from "@/app/components/ui/globe"; // Importar o novo componente Globe



// Lazy load do CpuArchitecture para melhorar performance  
const CpuArchitecture = dynamic(() => import('@/components/ui/cpu-architecture').then(mod => ({ default: mod.CpuArchitecture })), {
  ssr: false,
  loading: () => <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg" />
});

// Lazy load dos componentes 3D
const CardContainer = dynamic(() => import('@/components/ui/3d-card').then(mod => ({ default: mod.CardContainer })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
});

const CardBody = dynamic(() => import('@/components/ui/3d-card').then(mod => ({ default: mod.CardBody })), {
  ssr: false,
});

const CardItem = dynamic(() => import('@/components/ui/3d-card').then(mod => ({ default: mod.CardItem })), {
  ssr: false,
});

// Removendo completamente o componente SectionBackground
/*
const SectionBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <AspectRatio ratio={16 / 9} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Background image"
          fill
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </AspectRatio>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
*/

// Definition from TecnologiasConectadasSection
const allLogos = [
    { name: "ClaudeAI", id: 1, img: ClaudeAIIcon },
    { name: "Gemini", id: 2, img: GeminiLogoComponent },
    { name: "Vercel", id: 3, img: VercelIcon },
    { name: "OpenAI", id: 4, img: OpenAIIcon },
    { name: "Shopify", id: 5, img: ShopifyIcon },
    { name: "WhatsApp", id: 6, img: WhatsAppIcon },
];

const chatMessages = [
    { id: 1, sender: 'customer', text: "Olá! Gostaria de saber sobre meu pedido." },
    { id: 2, sender: 'ai', text: "Olá! 😊 Sou a Sofia. Para te ajudar com o seu pedido, pode me informar o número dele, por favor?" },
    { id: 3, sender: 'customer', text: "É o #NVMX789." },
    { id: 4, sender: 'ai', text: "Ok! Seu pedido #NVMX789 está a caminho. A previsão de entrega é para depois de amanhã." },
];

// Definindo as variantes com o tipo correto
const chatContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            // staggerChildren: 0.8, // Removido para controle manual de sequência
        },
    },
};

const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1], // Usando array de números para cubic-bezier
        },
    },
};

// Props não precisam mais de onDone, pois o sequenciamento geral é pelo staggerChildren
interface AiMessageRendererProps {
    msg: typeof chatMessages[0];
    onDoneTyping: () => void;
    isActive: boolean;
}

const AiMessageRenderer = ({ msg, onDoneTyping, isActive }: AiMessageRendererProps) => {
    const [isThinking, setIsThinking] = useState(false);
    const [typingCompleted, setTypingCompleted] = useState(false);

    useEffect(() => {
        if (!isActive) {
            // Se não está ativo, mas a digitação já foi completada, não faz nada aqui
            // para permitir que o texto continue visível.
            // Apenas reseta isThinking se não completou a digitação.
            if (!typingCompleted) {
                setIsThinking(false);
            }
            return;
        }

        // Se está ativo e a digitação ainda não foi completada, inicia o ciclo de pensar.
        if (!typingCompleted) {
            setIsThinking(true);
            const thinkingTimerId = setTimeout(() => {
                if (isActive) {
                    setIsThinking(false); 
                }
            }, 2000);
            return () => clearTimeout(thinkingTimerId);
        }
        // Se já completou a digitação e se tornou ativo novamente (improvável no fluxo atual), não faz nada.

    }, [isActive, typingCompleted]); // Adicionado typingCompleted como dependência

    const handleTypingComplete = () => {
        setTypingCompleted(true);
        if (isActive) { // Garante que só chame onDoneTyping se ainda for o turno desta IA
            onDoneTyping();
        }
    };

    return (
        <>
            <Avatar className="h-8 w-8 mb-1 bg-[#f7f7f7]">
                <AvatarImage 
                    src="/nuvemx.png" 
                    alt="Avatar NuvemX AI"
                    loading="lazy"
                />
                <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            
            {/* Lógica de Renderização Atualizada */}
            {typingCompleted ? (
                // Se a digitação foi completada, mostra o texto estático
                <div className="px-2 py-1 rounded-lg text-xs shadow-sm bg-muted text-[#8a9097] inline-block max-w-full min-h-[2.25rem] align-bottom text-left">
                    {msg.text}
                </div>
            ) : isActive && isThinking ? (
                // Se está ativo e pensando (e digitação não completada)
                <div className="p-2 rounded-lg text-xs shadow-sm bg-muted text-muted-foreground inline-flex items-center justify-center align-bottom">
                    <MessageLoading />
                </div>
            ) : isActive && !isThinking ? (
                // Se está ativo, não está pensando (e digitação não completada) -> Inicia digitação
                <TypingAnimation
                    duration={25} 
                    className="px-2 py-1 rounded-lg text-xs shadow-sm bg-muted text-[#8a9097] inline-block max-w-full min-h-[2.25rem] align-bottom text-left"
                    onComplete={handleTypingComplete} // Usar o novo handler
                >
                    {msg.text}
                </TypingAnimation>
            ) : (
                // Caso contrário (não ativo e digitação não completada), não renderiza nada visível deste balão
                null
            )}
        </>
    );
};

export default function NuvemXAiFeatures() {
    const [activeMessageIndex, setActiveMessageIndex] = useState(0);

    const handleNextMessage = useCallback(() => {
        setTimeout(() => {
            setActiveMessageIndex(prevIndex => {
                if (prevIndex < chatMessages.length - 1) {
                    return prevIndex + 1;
                }
                return prevIndex; 
            });
        }, 1000);
    }, []);

    useEffect(() => {
      if (activeMessageIndex === 0 && chatMessages[0]?.sender === 'customer') {
        // console.log("Primeira mensagem do cliente está ativa.");
      }
    }, [activeMessageIndex]);

    return (
        // Restoring relative and z-[1] to see if it resolves performance issues
        <section id="features" className="relative z-[1] overflow-x-hidden pt-8 md:pt-16 pb-16 md:pb-32">
            <EtherealShadowHeroContentWrapper
                className="absolute inset-0 -z-10" // Adicionado para ser o fundo real e não interferir no layout dos filhos
                animation={{ scale: 1.1, speed: 5 }} 
                noise={{ opacity: 0.1, scale: 0.2 }} // Noise 2x MAIS: opacidade 0.1, escala 0.2
            />
            {/* O conteúdo que antes estava dentro do wrapper agora é irmão dele */}
            {/* Content from TecnologiasConectadasSection START */}
            <div className="container mx-auto text-center pb-12 md:pb-16"> {/* Conteúdo precisa de z-index para ficar acima do fundo */}
                <GradientHeading
                    className="mb-2 md:mb-3 text-2xl font-bold"
                >
                    Tecnologias Conectadas, Futuro Inteligente
                </GradientHeading>
                <p className="mb-6 md:mb-8 text-muted-foreground">
                    Integramos as melhores ferramentas para impulsionar a inteligência do seu negócio.
                </p>
                <LogoCarousel logos={allLogos} columnCount={3} />
            </div>
            {/* Content from TecnologiasConectadasSection END */}

            {/* O conteúdo interno da seção não fica mais dentro do EtherealShadowHeroContentWrapper */}
            {/* <div className="container mx-auto text-center pb-12 md:pb-16 relative z-0"> */}
            {/*   <GradientHeading */}
            {/*       className="mb-2 md:mb-3 text-2xl font-bold" */}
            {/* // ... existing code ... */} 
            {/* <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-0"> */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16 pt-8 md:pt-0"> {/* Added padding top to features title if needed, or adjust pb above */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#171717]">
                        Descubra o Poder da Inteligência Artificial com NuvemX.AI
                    </h2>
                    <p className="text-[#767f85] md:text-lg max-w-3xl mx-auto">
                        Potencialize seu negócio com nossa plataforma de IA integrada, projetada para otimizar seu atendimento, personalizar interações e impulsionar suas vendas.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch"> {/* Changed to 2x2 grid e adicionado items-stretch */}
                    {/* Card 1: AI Playground & Personalização Avançada */}
                    
                    <Card className="col-span-1 flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-slate-700 rounded-xl relative min-h-[28rem] md:min-h-[30rem] bg-transparent dark:bg-transparent"> 
                        
                        <EtherealShadowV4 
                            sizing="stretch" 
                            className="absolute inset-0 z-0" 
                            color="rgba(10, 10, 10, 0.9)" 
                            animation={{ scale: 1.8, speed: 18 }}
                            noise={{ opacity: 0.015, scale: 0.25 }}
                        />
                        
                        
                        <div className="relative z-10 flex flex-col h-full"> 
                            <EvervaultIcon className="absolute h-6 w-6 -top-[29px] -left-[12px] text-[#171717] z-20" /> 
                            <EvervaultIcon className="absolute h-6 w-6 -bottom-[16px] -left-[12px] text-[#171717] z-20" />
                            <EvervaultIcon className="absolute h-6 w-6 -top-[29px] -right-[12px] text-[#171717] z-20" />
                            <EvervaultIcon className="absolute h-6 w-6 -bottom-[16px] -right-[12px] text-[#171717] z-20" />
                            
                            <div className="flex flex-col items-center text-center p-4 flex-grow justify-center">
                                <CardContent className="flex flex-col items-center text-center p-0 flex-grow justify-center w-full">
                                    <EvervaultCard text="IA" className="w-full h-48 md:h-56 mb-4" />
                                    <h3 className="dark:text-white text-black mt-4 text-xl font-semibold">
                                        AI Playground & Personalização
                                    </h3>
                                    <p className="text-sm font-light text-[#8c9399] mt-2 px-2">
                                        Experimente e treine modelos de IA no nosso Playground. Personalize o tom, estilo e base de conhecimento para que a IA reflita perfeitamente a voz da sua marca.
                                    </p>
                                </CardContent>
                            </div>
                        </div>
                    </Card>
                    

                    {/* Card 2: Integrações Dinâmicas */}
                    
                    <CardContainer 
                        className="col-span-1 w-full h-full" 
                        containerClassName="p-0 w-full h-full flex items-stretch justify-stretch"
                    >
                        <CardBody className="w-full h-full">
                            <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-slate-700 p-4 h-fit relative overflow-hidden bg-transparent dark:bg-transparent">
                                <EtherealShadowHeroContentWrapper 
                                    sizing="stretch" 
                                    className="absolute inset-0 z-0" 
                                    animation={{ scale: 1.8, speed: 18 }}
                                    noise={{ opacity: 0.015, scale: 0.25 }}
                                />
                                <CardItem translateZ="100" className="relative z-10 flex flex-col h-full">
                                    <CardContent className="flex flex-col items-center text-center">
                                        <CardItem translateZ="60" className="bg-muted/25 group relative mx-auto max-w-[22rem] items-center justify-between space-y-2 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] sm:max-w-md mb-6">
                                            <div
                                                role="presentation"
                                                className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
                                            <div>
                                                <InfiniteSlider
                                                    gap={24}
                                                    speed={20}
                                                    >
                                                    <IntegrationCard><ShopifyIcon /></IntegrationCard>
                                                    <IntegrationCard><Gemini /></IntegrationCard>
                                                    <IntegrationCard><WhatsAppIcon /></IntegrationCard>
                                                    <IntegrationCard><OpenAIIcon /></IntegrationCard>
                                                    <IntegrationCard><ClaudeAIIcon /></IntegrationCard>
                                                    <IntegrationCard><InstagramIcon /></IntegrationCard>
                                                </InfiniteSlider>
                                            </div>

                                            <div>
                                                <InfiniteSlider
                                                    gap={24}
                                                    speed={20}
                                                    reverse>
                                                    <IntegrationCard><Gemini /></IntegrationCard>
                                                    <IntegrationCard><WhatsAppIcon /></IntegrationCard>
                                                    <IntegrationCard><InstagramIcon /></IntegrationCard>
                                                    <IntegrationCard><ShopifyIcon /></IntegrationCard>
                                                    <IntegrationCard><ClaudeAIIcon /></IntegrationCard>
                                                    <IntegrationCard><OpenAIIcon /></IntegrationCard>
                                                </InfiniteSlider>
                                            </div>
                                            <div>
                                                <InfiniteSlider
                                                    gap={24}
                                                    speed={20}
                                                    >
                                                    <IntegrationCard><WhatsAppIcon /></IntegrationCard>
                                                    <IntegrationCard><Gemini /></IntegrationCard>
                                                    <IntegrationCard><ShopifyIcon /></IntegrationCard>
                                                    <IntegrationCard><ClaudeAIIcon /></IntegrationCard>
                                                    <IntegrationCard><OpenAIIcon /></IntegrationCard>
                                                </InfiniteSlider>
                                            </div>
                                            <CardItem translateZ="80" className="absolute inset-0 m-auto flex size-fit justify-center gap-2">
                                                <IntegrationCard
                                                    className="shadow-black-950/10 size-16 bg-white/25 shadow-xl backdrop-blur-md backdrop-grayscale dark:border-white/10 dark:shadow-white/15 flex items-center justify-center"
                                                    isCenter={true}>
                                                    <Image 
                                                        src="/nuvemx.png" 
                                                        alt="NuvemX.AI Icon" 
                                                        width={60}
                                                        height={60}
                                                        className="object-contain"
                                                        priority
                                                        placeholder="blur"
                                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h6iW5ZR2wFhWmYLrW1ys0kGIEETOMo3X8bDdLJXs0T/wGqq/p8ifVKOLWF/dDh6G3iWRs99tSLsJfKvB0G37gMa++M8Q5VaRmgVA9NfKXP8P3Rqi2gX1oUSz6h4yXXqcUZjxslY7mE/g/Jdw4Sg8rNQ+lF7yiLfYLHhxHawNWJjVrGTelNJc7J8IhjONNcT9N"
                                                    /> 
                                                </IntegrationCard>
                                            </CardItem>
                                        </CardItem>
                                        <CardItem translateZ="40">
                                            <h3 className="text-xl font-semibold text-[#171717]">Integração com suas Ferramentas Favoritas</h3>
                                            <p className="mt-2 text-sm text-[#858c93]">
                                                Conecte-se perfeitamente com plataformas e serviços populares para aprimorar seu fluxo de trabalho.
                                            </p>
                                        </CardItem>
                                    </CardContent>
                                </CardItem>
                            </Card>
                        </CardBody>
                    </CardContainer>
                    

                    {/* Card: Disponibilidade 24/7 */}
                    
                    <Card className="col-span-1 flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-slate-700 rounded-xl relative min-h-[9rem] md:min-h-[9rem] bg-transparent dark:bg-transparent pt-0">
                        <EtherealShadowV4 
                            sizing="stretch" 
                            className="absolute inset-0 z-0" 
                            color="rgba(10, 10, 10, 0.9)" // Mantendo a cor de fundo do AI Playground Card
                            animation={{ scale: 1.8, speed: 18 }}
                            noise={{ opacity: 0.015, scale: 0.25 }}
                        />
                        <div className="relative z-10 flex flex-col h-full mt-2"> 
                            <h3 className="text-2xl font-semibold text-center px-4 text-[#171717] dark:text-slate-100 mt-0 mb-0">Disponibilidade 24/7</h3> 
                            
                            <div className="flex flex-col items-center text-center p-0 flex-grow justify-start mt-2"> 
                                <CardContent className="flex flex-col items-center text-center p-0 w-full h-full justify-start"> 
                                    <CpuArchitecture 
                                        className="w-full h-full" 
                                        animateLines={true}
                                        animateMarkers={true}
                                        showSpinner={true}
                                        animateText={false}
                                    />
                                </CardContent>
                            </div>
                            <p className="text-sm text-center text-[#848c92] mt-4 px-4 pb-2">
                                Nossa IA dedicada opera ininterruptamente, garantindo suporte e assistência constantes aos seus clientes.
                            </p>
                        </div>
                    </Card>
                    

                    {/* Card 3: Atendimento Inteligente em Tempo Real - MODIFICADO PARA INCLUIR CONTEÚDO DO GLOBO */}
                    <Card className="col-span-1 md:col-start-2 -mt-48 flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 dark:border-slate-700 px-4 pt-0 pb-4 h-fit relative overflow-hidden bg-transparent dark:bg-transparent min-h-[36rem] md:min-h-[38rem]"> {/* Aumentada a altura mínima */}
                        <EtherealShadowHeroContentWrapper 
                            sizing="stretch" 
                            className="absolute inset-0 z-0" 
                            animation={{ scale: 1.8, speed: 18 }}
                            noise={{ opacity: 0.015, scale: 0.25 }}
                        />
                        <div className="relative z-10 flex flex-col h-full">
                            <CardContent className="flex flex-col items-center text-center w-full pt-4">
                                <h3 className="text-xl font-semibold mb-1 mt-0 text-[#171717]">Atendimento Inteligente em Tempo Real</h3>
                                <p className="text-xs text-[#858c93] mb-2 max-w-md mx-auto">
                                    Nossa IA verifica pedidos, produtos e rastreios ao vivo nas suas plataformas conectadas, oferecendo respostas precisas e instantâneas via WhatsApp.
                                </p>
                                {/* Simulação de Chat Div */}
                                <div className="relative w-full p-3 rounded-lg min-h-[15rem] backdrop-blur-sm shadow-2xl border border-white/10 overflow-hidden">
                                    <EtherealShadowHeroContentWrapper
                                        sizing="stretch" 
                                        className="absolute inset-0 z-0"
                                        animation={{ scale: 1.8, speed: 18 }}
                                        noise={{ opacity: 0.015, scale: 0.25 }}
                                    />
                                    <motion.div
                                        className="relative z-10 w-full flex flex-col space-y-5 h-auto"
                                        variants={chatContainerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {chatMessages.slice(0, activeMessageIndex + 1).map((msg, index) => (
                                            <motion.div
                                                key={msg.id}
                                                className={`flex items-end max-w-[85%] space-x-2 ${ 
                                                    msg.sender === 'customer' 
                                                        ? 'self-end' 
                                                        : 'self-start'
                                                }`}
                                                variants={messageVariants}
                                                initial="hidden"
                                                animate="visible"
                                                onAnimationComplete={() => {
                                                    if (msg.sender === 'customer' && index === activeMessageIndex && activeMessageIndex < chatMessages.length - 1) {
                                                        handleNextMessage();
                                                    }
                                                }}
                                            >
                                                {msg.sender === 'customer' ? (
                                                    <>
                                                        <div className={`p-2 rounded-lg text-xs shadow-sm bg-primary text-primary-foreground order-1`}>
                                                            {msg.text}
                                                        </div>
                                                        <Avatar className="h-8 w-8 order-2 mb-1">
                                                            <AvatarImage src="https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Avatar Cliente" />
                                                            <AvatarFallback>CU</AvatarFallback>
                                                        </Avatar>
                                                    </>
                                                ) : (
                                                    <AiMessageRenderer 
                                                        msg={msg} 
                                                        onDoneTyping={handleNextMessage} 
                                                        isActive={index === activeMessageIndex}
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                                {/* Fim da Simulação de Chat Div */}

                                {/* Separador e Conteúdo do Globo */}
                                <hr className="w-full my-4" style={{ borderColor: '#a1a1a1' }} />

                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mt-2 mb-1">
                                    NuvemX.AI: Conectando o Mundo
                                </h3>
                                <p className="text-xs text-[#858c93] mb-3 max-w-md mx-auto">
                                    Nossa plataforma expande seus horizontes, alcançando clientes globalmente com inteligência e precisão.
                                </p>
                                <div className="relative w-full h-48 md:h-52 mt-1 flex items-center justify-center overflow-hidden">
                                    {/* Ajuste no tamanho e posicionamento do Globe para caber melhor */}
                                    <Globe className="!absolute !inset-auto !top-[-30px] !w-[280px] !h-[280px] md:!w-[320px] md:!h-[320px] !max-w-none" />
                                </div>
                                {/* Fim do Conteúdo do Globo */}
                            </CardContent>
                        </div>
                    </Card>

                </div>
            </div>
            {/* </EtherealShadowHeroContentWrapper> */}
        </section>
    )
}

const IntegrationCard = ({ children, className, isCenter = false }: { children: React.ReactNode; className?: string; isCenter?: boolean }) => {
    return (
        <div className={cn(
            'bg-background relative z-20 flex rounded-full border',
            isCenter ? 'size-16 items-center justify-center' : 'size-12', // O card central já tem size-16, os outros size-12
            className
        )}>
            <div className={cn(
                'm-auto size-fit', 
                !isCenter && '*:size-5' // Aplica size-5 aos filhos apenas se NÃO for o card central
            )}>
                {children}
            </div>
        </div>
    )
} 