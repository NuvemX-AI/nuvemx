"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
// Importando o Button do local correto, assumindo que é este o usado pela Navbar
import { Button } from "@/app/components/ui/button"; 
import { Spinner } from "@/app/components/ui/spinner";

interface MagnetizeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    particleCount?: number;
    children?: React.ReactNode; // Adicionar children para o texto do botão
}

interface Particle {
    id: number;
    x: number;
    y: number;
}

function MagnetizeButton({
    className,
    particleCount = 12,
    children, // Children agora será o texto do botão
    ...props
}: MagnetizeButtonProps) {
    const [isAttracting, setIsAttracting] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const particlesControl = useAnimation();

    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 360 - 180,
            y: Math.random() * 360 - 180,
        }));
        setParticles(newParticles);
    }, [particleCount]);

    const handleInteractionStart = useCallback(async () => {
        setIsAttracting(true);
        await particlesControl.start({
            x: 0,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 10,
            },
        });
    }, [particlesControl]);

    const handleInteractionEnd = useCallback(async () => {
        setIsAttracting(false);
        // Certifique-se de que particles[i] existe antes de acessá-lo
        await particlesControl.start((i) => ({
            x: particles[i]?.x || 0, 
            y: particles[i]?.y || 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        }));
    }, [particlesControl, particles]);

    const spinnerDuration = isAttracting ? "1s" : "2s"; // Duração base do SVG é 2s, rápido é 1s

    return (
        <Button 
            className={cn(
                // "min-w-40", // <<< REMOVIDO para diminuir o botão
                "relative touch-none", 
                "transition-all duration-300",
                "flex items-center justify-center", 
                className 
            )}
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
            {...props}
        >
            {particles.map((particle, index) => ( 
                <motion.div
                    key={particle.id} 
                    custom={index}
                    initial={{ x: particle.x, y: particle.y }}
                    animate={particlesControl}
                    className={cn(
                        "absolute w-1.5 h-1.5 rounded-full",
                        "bg-[#171717]", 
                        "transition-opacity duration-300",
                        isAttracting ? "opacity-100" : "opacity-40"
                    )}
                />
            ))}
            
            {/* Conteúdo: Spinner + Texto */}
            <span className="relative z-10 flex items-center justify-center gap-2"> {/* Adicionado z-10 para garantir que o conteúdo esteja acima das partículas */} 
                <Spinner 
                    variant="infinite" 
                    size={22} 
                    animationDuration={spinnerDuration}
                    className="text-[#171717]"
                />
                {children} {/* Renderizar o texto passado */}
            </span>
        </Button>
    );
}

export { MagnetizeButton } 