import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { z } from 'zod';
import authConfig from './auth.config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  gymId: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  providers: [
    // Re-declare providers here with full implementations (authorize for Credentials)
    ...authConfig.providers.filter(
      (p) => (p as any).type !== 'credentials'
    ),
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

        const user = await prisma.user.findFirst({
          where: gymId
            ? { email, gymId }
            : { email, role: { in: ['ADMIN', 'STAFF', 'SUPER_ADMIN'] } },
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
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        return true;
      }
      return true;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
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
