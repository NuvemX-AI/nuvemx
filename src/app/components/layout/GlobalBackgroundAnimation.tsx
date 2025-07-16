"use client";

import { motion } from "framer-motion";

// Definição do componente FloatingPaths, usando as configurações do código original do usuário
function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        // A propriedade color aqui não é usada se stroke="currentColor" estiver no motion.path
        width: 0.5 + i * 0.03,
    }));

    return (
        // Este div wrapper interno para o SVG não precisa de "absolute inset-0"
        // pois o componente pai GlobalBackgroundAnimation já é posicionado absolutamente.
        // pointer-events-none aqui é bom.
        <div className="w-full h-full pointer-events-none">
            <svg
                className="w-full h-full text-slate-950 dark:text-white" // Cores do código original do usuário
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice" // Mantido para bom dimensionamento do fundo
            >
                <title>Background Paths Animation</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03} // Opacidade do código original
                        initial={{ pathLength: 0.3, opacity: 0.6 }} // Configs de animação do código original
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3], // Configs de animação do código original
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10, // Configs de animação do código original
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

// Componente principal exportado que usa FloatingPaths
export default function GlobalBackgroundAnimation() {
    // Aumentando a opacidade do wrapper para garantir visibilidade,
    // ou podemos remover a opacidade daqui e confiar apenas na opacidade das paths.
    // Por enquanto, vamos aumentar para testar.
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-70 dark:opacity-50 pointer-events-none">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
        </div>
    );
} 