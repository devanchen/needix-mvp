// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Pick pooled first; fall back to direct if needed
const datasourceUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
