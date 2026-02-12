import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

// Edge-compatible auth config (no Prisma, bcrypt, or heavy deps)
// Used by middleware only. Full auth with adapter is in auth.ts.
const providers = [
  // Only register Google provider when credentials are available
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  // Credentials provider needs authorize() for full auth,
  // but for middleware we only need the JWT/session callbacks.
  // Auth.js will skip authorize in middleware context.
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
      gymId: { label: 'Gym ID', type: 'text' },
    },
  }),
];

export default {
  trustHost: true,
  providers,
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.gymId = user.gymId;
        token.gymSlug = user.gymSlug;
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.gymId = token.gymId as string;
        session.user.gymSlug = token.gymSlug as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Onboarding requires auth
      if (pathname.startsWith('/onboarding') && !isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      // Admin routes require staff/admin roles
      if (pathname.startsWith('/admin')) {
        const role = auth?.user?.role;
        if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(role as string)) {
          return Response.redirect(new URL('/login', nextUrl));
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
