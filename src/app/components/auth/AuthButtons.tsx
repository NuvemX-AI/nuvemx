"use client";

import { SignUpButton, SignedOut } from '@clerk/nextjs';
import { Button } from '@/app/components/ui/button';

export function AuthButtons() {
  return (
    <SignedOut>
      <SignUpButton mode="modal">
        <Button 
          size="lg"
          variant="default" 
          className="rounded-lg px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-[#171717] hover:bg-[#171717]/90 text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary-hover)]"
        >
          Começar Teste Grátis
        </Button>
      </SignUpButton>
    </SignedOut>
  );
}

export function AuthButtonsExperimentar() {
  return (
    <SignedOut>
      <SignUpButton>
        <Button 
          variant="default" 
          className="px-10 py-4 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-white text-neutral-900 hover:bg-gray-200 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200"
        >
          Experimentar Agora
        </Button>
      </SignUpButton>
    </SignedOut>
  );
} 