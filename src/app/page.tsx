"use client";

import React from 'react';
import OriginalNuvemXHero from '@/app/components/landing/OriginalNuvemXHero';
import { Component as EtherealShadow } from "@/components/ui/etheral-shadow";
import NuvemXAiFeatures from '@/app/components/blocks/nuvemx-ai-features';
import StepFaqSection from '@/app/components/blocks/step-faq';
import FullNavbar from '@/app/components/layout/FullNavbar';

export default function HomePage() {
  return (
    <>
      <FullNavbar />

      <main className="flex-grow">
        <EtherealShadow 
          className="min-h-screen"
          animation={{ scale: 5, speed: 80 }} 
          noise={{ opacity: 0.05, scale: 0.8 }}
        > 
          <OriginalNuvemXHero />
        </EtherealShadow>

        <NuvemXAiFeatures />

        <StepFaqSection />

        {/* FAQ Section removed from here */}

      </main>
    </>
  );
}
