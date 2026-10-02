import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Reconnecting to the remote database costs ~0.7s, so keep idle connections
    // alive for 5 minutes instead of pg's 10 second default.
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 300_000,
      connectionTimeoutMillis: 10_000,
      // Safety net: never let a request wait on a dead connection for minutes.
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      query_timeout: 20_000,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
