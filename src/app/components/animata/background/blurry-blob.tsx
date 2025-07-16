import { cn } from "@/lib/utils";

interface BlobProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function BlurryBlob({
  className,
}: BlobProps) {
  return (
    <div className={cn("relative w-36 h-36 flex items-center justify-center overflow-hidden", className)}>
      {/* Camada Externa - Base luminosa e suave */}
      <div
        className={cn(
          "absolute w-full h-full animate-orb-flow rounded-full mix-blend-screen opacity-80 filter shadow-[inset_0px_0px_12px_3px_rgba(255,255,255,0.25)]",
          "bg-gradient-to-br from-sky-200/60 via-indigo-300/50 to-pink-300/60"
        )}
        style={{ animationDuration: '20s' }}
      ></div>
      {/* Camada Intermediária - Cor e textura */}
      <div
        className={cn(
          "absolute w-5/6 h-5/6 animate-orb-flow rounded-full mix-blend-overlay opacity-70 filter shadow-[inset_0px_0px_8px_2px_rgba(200,200,255,0.2)]", // mix-blend-overlay para interação de cor
          "bg-gradient-to-tl from-teal-200/70 via-cyan-200/60 to-fuchsia-300/70"
        )}
        style={{ animationDuration: '22s', animationDelay: '0.8s' }} // Duração e delay diferentes
      ></div>
      {/* Núcleo Brilhante - Ponto focal iridescente */}
      <div
        className={cn(
          "absolute w-2/3 h-2/3 animate-orb-flow rounded-full mix-blend-screen opacity-90 filter shadow-[inset_0px_0px_5px_1px_rgba(255,255,255,0.3)]",
          "bg-gradient-to-tr from-white/80 via-sky-100/70 to-violet-200/80" // Mais branco e cores claras
        )}
        style={{ animationDuration: '18s', animationDelay: '1.2s' }}
      ></div>
    </div>
  );
} 