import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { z } from 'zod';
import authConfig from './auth.config';
import { phoneLoginSchema, nigerianPhoneSchema } from './validations';
import { normalizePhone, hashOtpCode, isOtpExpired, isOtpMaxAttempts } from './otp-helpers';
import { checkRateLimit, otpVerifyRateLimiter } from './rate-limiter';

const loginSchema = z
  .object({
    email: z.string().email().optional().or(z.literal('')),
    phone: nigerianPhoneSchema.optional(),
    password: z.string().min(8),
    gymId: z.string().optional(),
  })
  .refine((d) => d.email || d.phone, { message: 'Email or phone is required' });

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  providers: [
    // Strip all Credentials stubs from authConfig — full implementations follow below.
    ...authConfig.providers.filter(
      (p) => (p as any).type !== 'credentials'
    ),

    // Email or phone + password login
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
        gymId: { label: 'Gym ID', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, phone, password, gymId } = parsed.data;
        const normalizedPhone = phone ? normalizePhone(phone) : undefined;

        // Require a concrete identifier before querying — prevents Prisma from
        // ignoring an undefined field and returning an unintended user.
        const hasEmail = !!email;
        const hasPhone = !!normalizedPhone;
        if (!hasEmail && !hasPhone) return null;

        // Phone login requires a gymId — no gymId means admin email-only path.
        if (!gymId && !hasEmail) return null;

        const user = await prisma.user.findFirst({
          where: gymId
            ? hasEmail
              ? { email: email!, gymId }
              : { phone: normalizedPhone!, gymId }
            : { email: email!, role: { in: ['ADMIN', 'STAFF', 'SUPER_ADMIN'] } },
          include: {
            gym: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
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

        if (user.gym && !user.gym.isActive) {
          throw new Error('Please verify your email to activate your gym');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.avatar,
          role: user.role,
          gymId: user.gymId,
          gymSlug: user.gym?.slug,
        };
      },
    }),

    // Phone OTP login
    Credentials({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'OTP Code', type: 'text' },
        gymId: { label: 'Gym ID', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = phoneLoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, code, gymId } = parsed.data;
        const normalized = normalizePhone(phone);

        // Look up token before consuming a rate limit slot — prevents attackers
        // from DoS-ing the rate limiter for a phone with no active token.
        const token = await prisma.otpToken.findUnique({
          where: { gymId_phone: { gymId, phone: normalized } },
        });

        if (!token) return null;

        try {
          await checkRateLimit(otpVerifyRateLimiter, `otp:verify:${gymId}:${normalized}`);
        } catch {
          throw new Error('Too many attempts. Please wait and try again.');
        }

        if (isOtpExpired(token.expires)) {
          await prisma.otpToken.delete({ where: { id: token.id } }).catch(() => {});
          throw new Error('OTP has expired. Please request a new one.');
        }

        if (isOtpMaxAttempts(token.attempts)) {
          // Clean up exhausted token so a fresh sendOtp can proceed immediately.
          await prisma.otpToken.delete({ where: { id: token.id } }).catch(() => {});
          throw new Error('Too many failed attempts. Please request a new OTP.');
        }

        const hashed = hashOtpCode(code);
        if (hashed !== token.code) {
          await prisma.otpToken.update({
            where: { id: token.id },
            data: { attempts: token.attempts + 1 },
          });
          return null;
        }

        // Code is valid — look up the user BEFORE deleting the token so a failed
        // user lookup does not permanently consume the OTP.
        const user = await prisma.user.findFirst({
          where: { gymId, phone: normalized, role: 'MEMBER', status: 'ACTIVE' },
          include: {
            gym: { select: { id: true, name: true, slug: true, isActive: true } },
          },
        });

        if (!user || !user.gym) return null;

        // Delete the token only after confirming the user — prevents replay.
        await prisma.otpToken.delete({ where: { id: token.id } }).catch(() => {});

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
