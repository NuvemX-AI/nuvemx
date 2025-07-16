import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

console.log("SRC/MIDDLEWARE.TS: File is being executed (v5.1 matcher fix).");

// Rotas que são públicas (acessíveis sem login)
const isPublicRoute = createRouteMatcher([
  '/',
  '/planos',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/stripe/webhook',
  '/admin(.*)'  // Todas as rotas admin são públicas (têm sua própria autenticação)
]);

// Rotas que devem ser tratadas como API
const isApiRoute = createRouteMatcher(['/api/(.*)']);

// Rotas estáticas que devem ser ignoradas
const isStaticRoute = createRouteMatcher([
  '/_next/static/(.*)',
  '/_next/image/(.*)',
  '/favicon.ico',
  '/_next/webpack-hmr'
]);

// Rotas protegidas que requerem autenticação
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Ignorar rotas estáticas completamente
  if (isStaticRoute(req)) {
    return NextResponse.next();
  }

  // Para rotas públicas, permitir acesso livre
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verificar autenticação
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      // Usuário não autenticado tentando acessar rota protegida
      // Redirecionar para a página principal
      const signInUrl = new URL('/', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Para rotas de API, aplicar proteção baseada na rota
  if (isApiRoute(req)) {
    // APIs públicas (webhooks, etc.) já foram tratadas acima
    // APIs protegidas requerem autenticação (exceto admin APIs)
    if (!pathname.includes('/api/webhooks/') && 
        !pathname.includes('/api/stripe/webhook') && 
        !pathname.includes('/api/admin/')) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (favicon)
     * - _next/webpack-hmr (hot module replacement)
     */
    '/((?!_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)',
  ],
}; 