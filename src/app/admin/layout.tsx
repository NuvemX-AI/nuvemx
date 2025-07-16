'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'next-themes';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removido a verificação de autenticação duplicada
  // A página de login já faz essa verificação
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gray-50 dark:bg-[#171717] transition-colors">
      {children}
    </div>
    </ThemeProvider>
  );
} 