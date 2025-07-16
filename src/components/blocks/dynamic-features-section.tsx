"use client"
import { MessageCircle, Bot, BarChart2, Globe } from 'lucide-react'
import DottedMap from 'dotted-map'
import { Area, AreaChart, CartesianGrid } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Ripple } from "@/components/magicui/ripple";

// Mapa de Pontos representando interações globais/nacionais
const mapInstance = new DottedMap({ height: 55, grid: 'diagonal' })
// Adicionar alguns pontos para representar cidades com alta interação (ex: Brasil)
mapInstance.addPin({ lat: -23.5505, lng: -46.6333, svgOptions: { color: 'var(--color-primary)', radius: 0.5 } }) // São Paulo
mapInstance.addPin({ lat: -22.9068, lng: -43.1729, svgOptions: { color: 'var(--color-primary)', radius: 0.4 } }) // Rio de Janeiro
mapInstance.addPin({ lat: -15.7797, lng: -47.9297, svgOptions: { color: 'var(--color-accent)', radius: 0.3 } })   // Brasília
mapInstance.addPin({ lat: -3.7172, lng: -38.5431, svgOptions: { color: 'var(--color-accent)', radius: 0.3 } })    // Fortaleza
mapInstance.addPin({ lat: 40.7128, lng: -74.0060, svgOptions: { color: 'var(--color-muted-foreground)', radius: 0.2 } }) // NY (Exemplo internacional)


const points = mapInstance.getPoints()

// Definir tipo para os pontos do mapa
interface MapPoint {
    x: number;
    y: number;
    svgOptions?: {
        color?: string;
        radius?: number;
    };
}

const svgMapOptions = {
    backgroundColor: 'transparent', // Adaptado para tema
    color: 'var(--color-muted-foreground)',
    radius: 0.15,
}

const CustomMap = () => {
    const viewBox = `0 0 120 60`
    return (
        <svg viewBox={viewBox} style={{ background: svgMapOptions.backgroundColor }} className="w-full h-auto">
            {(points as MapPoint[]).map((point: MapPoint, index: number) => (
                <circle 
                    key={index} 
                    cx={point.x} 
                    cy={point.y} 
                    r={point.svgOptions?.radius || svgMapOptions.radius} 
                    fill={point.svgOptions?.color || svgMapOptions.color} 
                />
            ))}
        </svg>
    )
}

// Configuração e dados do gráfico de monitoramento adaptados para NuvemX.AI
const nuvemXChartConfig = {
    automatedInteractions: {
        label: 'Interações Automatizadas',
        color: 'hsl(var(--chart-1))',
    },
    resolvedQueries: {
        label: 'Consultas Resolvidas',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig

const nuvemXChartData = [
    { month: 'Jan', automatedInteractions: 1860, resolvedQueries: 1500 },
    { month: 'Fev', automatedInteractions: 2100, resolvedQueries: 1850 },
    { month: 'Mar', automatedInteractions: 2350, resolvedQueries: 2050 },
    { month: 'Abr', automatedInteractions: 1900, resolvedQueries: 1700 },
    { month: 'Mai', automatedInteractions: 2500, resolvedQueries: 2200 },
    { month: 'Jun', automatedInteractions: 2800, resolvedQueries: 2650 },
]

const NuvemXMonitoringChart = () => {
    return (
        <ChartContainer className="h-120 aspect-auto md:h-96" config={nuvemXChartConfig}>
            <AreaChart
                accessibilityLayer
                data={nuvemXChartData}
                margin={{
                    left: 0,
                    right: 0,
                }}>
                <defs>
                    <linearGradient id="fillAutomated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-automatedInteractions)" stopOpacity={0.8} />
                        <stop offset="55%" stopColor="var(--color-automatedInteractions)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-resolvedQueries)" stopOpacity={0.8} />
                        <stop offset="55%" stopColor="var(--color-resolvedQueries)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <ChartTooltip active cursor={false} content={<ChartTooltipContent className="dark:bg-muted" />} />
                <Area strokeWidth={2} dataKey="automatedInteractions" type="monotone" fill="url(#fillAutomated)" fillOpacity={0.4} stroke="var(--color-automatedInteractions)" stackId="a" />
                <Area strokeWidth={2} dataKey="resolvedQueries" type="monotone" fill="url(#fillResolved)" fillOpacity={0.4} stroke="var(--color-resolvedQueries)" stackId="a" />
            </AreaChart>
        </ChartContainer>
    )
}

export function DynamicNuvemXFeatures() {
    return (
        <section className="px-4 py-16 md:py-24 bg-white dark:bg-black">
            <div className="mx-auto grid max-w-5xl border border-border dark:border-border/50 md:grid-cols-2 rounded-lg shadow-xl shadow-slate-950/5">
                {/* Seção 1: Mapa de Interações */}
                <div className="border-b md:border-b-0 md:border-r border-border dark:border-border/50">
                    <div className="p-6 sm:p-12">
                        <span className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Globe className="size-4" />
                            Visão Global de Atendimentos
                        </span>
                        <p className="mt-6 text-xl md:text-2xl font-semibold text-foreground">
                            Acompanhe suas interações de clientes em tempo real, de qualquer lugar.
                        </p>
                    </div>
                    <div aria-hidden className="relative">
                        <div className="absolute inset-0 z-10 m-auto size-fit">
                            <div className="rounded-md bg-background z-[1] dark:bg-muted relative flex size-fit w-fit items-center gap-2 border border-border dark:border-border/50 px-3 py-1.5 text-xs font-medium shadow-lg shadow-black/10">
                                <span className="text-base">🇧🇷</span> Última Interação: São Paulo, Brasil
                            </div>
                            <div className="rounded-md bg-background absolute inset-2 -bottom-2 mx-auto border border-border dark:border-border/50 px-3 py-4 text-xs font-medium shadow-lg shadow-black/10 dark:bg-zinc-900"></div>
                        </div>
                        <div className="relative overflow-hidden p-4 md:p-6">
                            <Ripple />
                            <div className="[background-image:radial-gradient(var(--tw-gradient-stops))] z-1 to-background absolute inset-0 from-transparent to-75%"></div>
                            <CustomMap />
                        </div>
                    </div>
                </div>

                {/* Seção 2: Suporte Inteligente Multicanal */}
                <div className="overflow-hidden bg-slate-50 dark:bg-slate-900/30 p-6 sm:p-12">
                    <div className="relative z-10">
                        <span className="text-muted-foreground flex items-center gap-2 text-sm">
                            <MessageCircle className="size-4" />
                            Suporte Inteligente Multicanal
                        </span>
                        <p className="my-6 text-xl md:text-2xl font-semibold text-foreground">
                            Respostas instantâneas e personalizadas no WhatsApp e suas plataformas.
                        </p>
                    </div>
                    <div aria-hidden className="flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex justify-center items-center size-5 rounded-full border border-border bg-background">
                                    <Bot className="size-3 text-primary"/>
                                </span>
                                <span className="text-muted-foreground text-xs">Cliente - 10:32 AM</span>
                            </div>
                            <div className="rounded-lg bg-background mt-1.5 w-4/5 border border-border p-3 text-sm shadow-sm">
                                Olá! Gostaria de saber o status do meu pedido #12345.
                            </div>
                        </div>
                        <div>
                            <div className="rounded-lg mb-1 ml-auto w-4/5 bg-primary p-3 text-sm text-primary-foreground shadow-sm">
                                Olá! Seu pedido #12345 já foi enviado e está a caminho. O código de rastreio é BR123XYZ.
                            </div>
                            <span className="text-muted-foreground block text-right text-xs">NuvemX.AI - 10:32 AM</span>
                        </div>
                         <div>
                            <div className="flex items-center gap-2">
                                <span className="flex justify-center items-center size-5 rounded-full border border-border bg-background">
                                    <Bot className="size-3 text-primary"/>
                                </span>
                                <span className="text-muted-foreground text-xs">Lead - 11:15 AM</span>
                            </div>
                            <div className="rounded-lg bg-background mt-1.5 w-4/5 border border-border p-3 text-sm shadow-sm">
                                Quais são os planos de assinatura?
                            </div>
                        </div>
                         <div>
                            <div className="rounded-lg mb-1 ml-auto w-4/5 bg-primary p-3 text-sm text-primary-foreground shadow-sm">
                                Temos planos a partir de R$X9,90! Posso te enviar mais detalhes ou prefere agendar uma demonstração?
                            </div>
                            <span className="text-muted-foreground block text-right text-xs">NuvemX.AI - 11:15 AM</span>
                        </div>
                    </div>
                </div>

                {/* Seção 3: Uptime / Disponibilidade */}
                <div className="col-span-full border-y border-border dark:border-border/50 p-10 md:p-12 text-center bg-slate-50 dark:bg-slate-900/30">
                    <h3 className="text-3xl md:text-5xl font-semibold text-foreground">
                        Disponibilidade Contínua 24/7
                    </h3>
                    <p className="text-muted-foreground mt-3 text-sm md:text-base">
                        Seu assistente virtual sempre ativo, garantindo que nenhuma pergunta fique sem resposta.
                    </p>
                </div>
                
                {/* Seção 4: Gráfico de Atividade */}
                <div className="relative col-span-full">
                    <div className="absolute z-10 max-w-lg px-6 pr-12 pt-6 md:px-12 md:pt-12">
                        <span className="text-muted-foreground flex items-center gap-2 text-sm">
                            <BarChart2 className="size-4" />
                            Monitoramento de Performance
                        </span>
                        <p className="my-6 text-xl md:text-2xl font-semibold text-foreground">
                            Acompanhe a eficiência da sua IA em tempo real. 
                            <span className="text-muted-foreground"> Identifique picos de atendimento e otimize suas estratégias.</span>
                        </p>
                    </div>
                    <NuvemXMonitoringChart />
                </div>
            </div>
        </section>
    )
}

// Garantir que DottedMap seja instanciado apenas no client-side se necessário
if (typeof window !== 'undefined') {
  // const map = new DottedMap({ height: 55, grid: 'diagonal' })
  // ...
} 