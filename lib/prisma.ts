import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy Prisma client creation. Initialising it at module import time caused
// "Failed to collect page data" errors on some deployment platforms (Vercel
// in particular) because the PrismaClient constructor would attempt to reach
// the database during the build phase, before env vars were fully wired up.
// With lazy initialisation, the connection is only attempted the first time
// a route handler actually runs.
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Execute a Prisma operation with retry logic to handle Neon cold starts.
 * Neon free-tier databases auto-suspend after inactivity; the first query
 * after suspension may fail with P1001 while the database wakes up.
 * Retrying with a small delay almost always succeeds.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; delayMs?: number; label?: string } = {}
): Promise<T> {
  const { retries = 3, delayMs = 1500, label = "prisma" } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = (error as { code?: string })?.code;
      const isConnectionError =
        code === "P1001" || // Can't reach database server
        code === "P1002" || // Database server timed out
        code === "P1017"; // Server has closed the connection

      if (!isConnectionError || attempt === retries) {
        throw error;
      }

      console.warn(
        `[${label}] connection error (${code}), retrying in ${delayMs}ms (attempt ${attempt}/${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
