"use client";

import React from 'react';
import { SignUpButton, SignedOut } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
// Importa o RainbowButton normalmente, pois este wrapper será dinâmico
import { RainbowButton } from "@/components/ui/rainbow-button"; 

export default function ClientOnlyAuthButtons() {
  return (
    <SignedOut>
      <SignUpButton mode="modal">
        <RainbowButton>
          Começar Teste Grátis <ArrowRight className="ml-2 size-5" />
        </RainbowButton>
      </SignUpButton>
    </SignedOut>
  );
} 