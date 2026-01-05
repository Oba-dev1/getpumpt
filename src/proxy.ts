import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Domains that should show the marketing site (GymFlow Pro)
const MARKETING_DOMAINS = [
  'gymflowpro.com',
  'www.gymflowpro.com',
  'localhost:3000',
  'localhost',
];

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

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Remove port for local development
  const hostnameWithoutPort = hostname.split(':')[0];

  // Get the pathname
  const pathname = url.pathname;

  // Skip proxy for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Check if this is a custom domain (e.g., fitgym.ng)
  // Custom domains are stored in the database and mapped to gym slugs
  const isCustomDomain = !hostname.includes('gymflowpro.com') &&
                         !hostname.includes('localhost') &&
                         !hostname.includes('vercel.app');

  if (isCustomDomain) {
    // For custom domains, we need to look up the gym by domain
    // Set header for the app to use
    const response = NextResponse.rewrite(new URL(`/gym/${hostnameWithoutPort}${pathname}`, request.url));
    response.headers.set('x-gym-domain', hostnameWithoutPort);
    response.headers.set('x-gym-type', 'custom-domain');
    return response;
  }

  // Check if this is a subdomain (e.g., fitgym.gymflowpro.com)
  const parts = hostnameWithoutPort.split('.');

  // For localhost, check for subdomain simulation via query param or header
  // In production: fitgym.gymflowpro.com -> parts = ['fitgym', 'gymflowpro', 'com']
  // In development: localhost -> no subdomain, but we can simulate with ?gym=fitgym

  let gymSlug: string | null = null;

  // Production subdomain detection
  if (parts.length >= 3 && !RESERVED_SUBDOMAINS.includes(parts[0])) {
    // This is a subdomain like fitgym.gymflowpro.com
    gymSlug = parts[0];
  }

  // Development subdomain simulation
  // Can use: localhost:3000?gym=fitgym or set x-gym-slug header
  if (!gymSlug && (hostname.includes('localhost') || hostname.includes('127.0.0.1'))) {
    gymSlug = url.searchParams.get('gym') || request.headers.get('x-gym-slug');
  }

  // Vercel preview deployments: xxx-gymslug.vercel.app
  if (!gymSlug && hostname.includes('.vercel.app')) {
    // Check if there's a gym slug in the subdomain
    const vercelParts = hostnameWithoutPort.split('.');
    if (vercelParts.length >= 3) {
      const subdomain = vercelParts[0];
      // Pattern: project-gymslug or just gymslug
      const slugMatch = subdomain.match(/-([a-z0-9-]+)$/);
      if (slugMatch) {
        gymSlug = slugMatch[1];
      }
    }
  }

  // If we have a gym slug, rewrite to the gym routes
  if (gymSlug) {
    // Don't rewrite if already on a gym path
    if (pathname.startsWith('/gym/')) {
      return NextResponse.next();
    }

    // Rewrite to /gym/[domain]/... routes
    const response = NextResponse.rewrite(new URL(`/gym/${gymSlug}${pathname}`, request.url));
    response.headers.set('x-gym-slug', gymSlug);
    response.headers.set('x-gym-type', 'subdomain');
    return response;
  }

  // No gym detected - this is the marketing site
  // Check if we should show marketing or redirect
  const isMarketingPath = pathname === '/' ||
                          pathname.startsWith('/pricing') ||
                          pathname.startsWith('/features') ||
                          pathname.startsWith('/about') ||
                          pathname.startsWith('/contact') ||
                          pathname.startsWith('/blog') ||
                          pathname.startsWith('/demo');

  // If on root domain with no gym slug, show marketing site
  // The marketing site lives in (marketing) route group
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
