import React from 'react';

interface DotCardProps {
  mainText: string;
  subText: string;
}

// Mantendo a estrutura JSX original, mas usando props para conteúdo estático
export default function DotCard({ mainText, subText }: DotCardProps) {
  // Lógica de contagem removida pois o conteúdo agora é estático

  return (
    <div className="outer"> {/* Estas classes precisam de definições CSS externas */}
      <div className="dot"></div>
      <div className="card">
        <div className="ray"></div>
        <div className="text">{mainText}</div>
        <div className="label">{subText}</div>
        <div className="line topl"></div>
        <div className="line leftl"></div>
        <div className="line bottoml"></div>
        <div className="line rightl"></div>
      </div>
    </div>
  );
}
