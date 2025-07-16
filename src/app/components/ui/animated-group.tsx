'use client';

import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion'; 

export type PresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'blur'
  | 'blur-slide'
  | 'zoom'
  | 'flip'
  | 'bounce'
  | 'rotate'
  | 'swing';

// Usar HTMLMotionProps para tipar 'as' e 'asChild' de forma mais robusta
// Permitindo strings como 'div', 'span', etc.
type MotionTag = keyof typeof motion;

export type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: PresetType;
  // Tipar 'as' e 'asChild' como possíveis tags HTML que framer-motion pode animar
  as?: MotionTag; 
  asChild?: MotionTag; 
};

// Variantes padrão permanecem as mesmas
const defaultContainerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  hidden: {}, // Adicionar estado hidden padrão para container
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Presets permanecem os mesmos
const presetVariants: Record<PresetType, Variants> = {
  fade: {},
  slide: { hidden: { y: 20 }, visible: { y: 0 } },
  scale: { hidden: { scale: 0.8 }, visible: { scale: 1 } },
  blur: { hidden: { filter: 'blur(4px)' }, visible: { filter: 'blur(0px)' } },
  'blur-slide': { hidden: { filter: 'blur(4px)', y: 20 }, visible: { filter: 'blur(0px)', y: 0 } },
  zoom: { hidden: { scale: 0.5 }, visible: { scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } } },
  flip: { hidden: { rotateX: -90 }, visible: { rotateX: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } } },
  bounce: { hidden: { y: -50 }, visible: { y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } } },
  rotate: { hidden: { rotate: -180 }, visible: { rotate: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 15 } } },
  swing: { hidden: { rotate: -10 }, visible: { rotate: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 8 } } },
};

// Função auxiliar para mesclar variantes padrão com as específicas do preset ou customizadas
const mergeVariants = (base: Variants, specific?: Variants): Variants => ({
  hidden: { ...base.hidden, ...specific?.hidden },
  visible: { ...base.visible, ...specific?.visible },
});

function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  as = 'div', // Default para 'div'
  asChild = 'div', // Default para 'div'
}: AnimatedGroupProps) {

  // Seleciona as variantes do item com base no preset ou usa as padrão
  const itemPresetVariants = preset ? presetVariants[preset] : {};
  // Mescla variantes padrão, preset e customizadas (se fornecidas)
  const finalItemVariants = mergeVariants(defaultItemVariants, mergeVariants(itemPresetVariants, variants?.item));
  
  // Mescla variantes padrão do container com as customizadas (se fornecidas)
  const finalContainerVariants = mergeVariants(defaultContainerVariants, variants?.container);

  // Usa a tag dinâmica com framer-motion
  // Ex: motion['div'], motion['span']
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;
  const MotionChild = motion[asChild as keyof typeof motion] as typeof motion.div;

  // Verifica se os componentes são válidos antes de renderizar
  if (!MotionComponent || !MotionChild) {
    console.error(`AnimatedGroup: Invalid 'as' or 'asChild' prop provided. Received: as='${as}', asChild='${asChild}'`);
    // Renderiza um div simples como fallback ou retorna null
    return <div className={className}>{children}</div>; 
  }

  return (
    <MotionComponent
      initial="hidden"
      // Pode usar animate="visible" ou whileInView para animar ao entrar na viewport
      whileInView="visible" // Anima quando o elemento entra na tela
      viewport={{ once: true, amount: 0.2 }} // Configurações do whileInView: animar uma vez, quando 20% estiver visível
      variants={finalContainerVariants}
      className={className} // className deve funcionar com motion[tag]
    >
      {React.Children.map(children, (child, index) => {
        // Verifica se o filho é um elemento React válido antes de envolvê-lo
        if (!React.isValidElement(child)) {
          return child; // Retorna filhos não-elementos (ex: strings) diretamente
        }
        return (
          <MotionChild key={index} variants={finalItemVariants}>
            {child}
          </MotionChild>
        );
      })}
    </MotionComponent>
  );
}

export { AnimatedGroup };

