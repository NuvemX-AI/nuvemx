'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Cloud, LogIn } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/app/components/ui/button';
// import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

// const navigation = [
//   { name: 'Funcionalidades', href: '/#features' },
//   { name: 'Como Funciona', href: '/#como-funciona' },
//   { name: 'Depoimentos', href: '/#testimonials' },
// ];

export function HeroHeader() {
  // const [isScrolled, setIsScrolled] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 10);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <header style={{ backgroundColor: 'lightblue', padding: '20px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <h1>Teste Header Visível</h1>
    </header>
  );
} 