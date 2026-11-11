import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Fudo accounts");

const globalForPrisma = globalThis as unknown as { fudoPrisma?: PrismaClient };
export const db = globalForPrisma.fudoPrisma ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
if (process.env.NODE_ENV !== "production") globalForPrisma.fudoPrisma = db;
