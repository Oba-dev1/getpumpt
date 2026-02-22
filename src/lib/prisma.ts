import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Retryable Prisma error codes:
// P1001 - Can't reach database server
// P1002 - Database server timed out
// P2024 - Connection pool timed out
const RETRYABLE_CODES = new Set(['P1001', 'P1002', 'P2024']);

function isRetryable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_CODES.has(error.code);
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  return false;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < MAX_RETRIES && isRetryable(error)) {
        attempt++;
        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DELAY_MS * attempt)
        );
        continue;
      }
      throw error;
    }
  }
}
