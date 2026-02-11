import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;

  // Remove port for local development
  const hostnameWithoutPort = hostname.split(':')[0];

  // Skip proxy for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Reserved subdomains that shouldn't be treated as gym slugs
  const RESERVED_SUBDOMAINS = [
    'www',
    'api',
    'admin',
    'app',
    'dashboard',
    'member',
    'members',
    'auth',
    'login',
    'signup',
    'register',
  ];

  // Root domain from env (defaults to getpumpt.com)
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'getpumpt.com';

  // Check if this is a custom domain (e.g., fitstudio.ng)
  const isCustomDomain = !hostname.includes(ROOT_DOMAIN) &&
                         !hostname.includes('localhost') &&
                         !hostname.includes('vercel.app');

  if (isCustomDomain) {
    const response = NextResponse.rewrite(new URL(`/gym/${hostnameWithoutPort}${pathname}`, req.url));
    response.headers.set('x-gym-domain', hostnameWithoutPort);
    response.headers.set('x-gym-type', 'custom-domain');
    return response;
  }

  // Check if this is a subdomain (e.g., fitstudio.getpumpt.com)
  const parts = hostnameWithoutPort.split('.');
  let gymSlug: string | null = null;

  // Production subdomain detection (only on root domain, e.g., fitstudio.getpumpt.com)
  if (hostname.includes(ROOT_DOMAIN) && parts.length >= 3 && !RESERVED_SUBDOMAINS.includes(parts[0])) {
    gymSlug = parts[0];
  }

  // Development subdomain simulation
  if (!gymSlug && (hostname.includes('localhost') || hostname.includes('127.0.0.1'))) {
    gymSlug = url.searchParams.get('gym') || req.headers.get('x-gym-slug');
  }

  // If we have a gym slug, rewrite to the gym routes
  if (gymSlug) {
    if (pathname.startsWith('/gym/')) {
      return NextResponse.next();
    }

    const response = NextResponse.rewrite(new URL(`/gym/${gymSlug}${pathname}`, req.url));
    response.headers.set('x-gym-slug', gymSlug);
    response.headers.set('x-gym-type', 'subdomain');
    return response;
  }

  // No gym detected - show marketing site
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/admin/:path*',
    '/onboarding/:path*',
  ],
};
