import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  gymId: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        gymId: { label: 'Gym ID', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password, gymId } = parsed.data;

        // Find user by email and optionally gymId
        const user = await prisma.user.findFirst({
          where: gymId
            ? { email, gymId }
            : { email },
          include: {
            gym: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        if (user.status !== 'ACTIVE') {
          throw new Error('Account is not active');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.avatar,
          role: user.role,
          gymId: user.gymId,
          gymSlug: user.gym.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.gymId = user.gymId;
        token.gymSlug = user.gymSlug;
      }

      // Handle session update
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
    async signIn({ user, account }) {
      // Allow OAuth sign-in
      if (account?.provider !== 'credentials') {
        return true;
      }

      // For credentials, user is already validated in authorize
      return true;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome email to new users
        // TODO: Implement welcome email via Resend
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface User {
    role?: string;
    gymId?: string;
    gymSlug?: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      gymId: string;
      gymSlug: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    gymId?: string;
    gymSlug?: string;
  }
}
