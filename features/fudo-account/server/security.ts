import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { hash, compare } from "bcryptjs";
import { db } from "./db";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const hashPassword = (value: string) => hash(value, 12);
export const checkPassword = (value: string, encoded: string) => compare(value, encoded);
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const makeToken = () => randomBytes(32).toString("base64url");

// Persisted throttling works across multiple Next.js instances (unlike in-memory maps).
// Rate keys contain only hashes, never raw email addresses.
export async function isRateLimited(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const bucket = await db.fudoRateLimit.findUnique({ where: { key } });
  if (!bucket || bucket.resetAt <= now) {
    await db.fudoRateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return false;
  }
  if (bucket.count >= maxAttempts) return true;
  await db.fudoRateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return false;
}
export async function clearRateLimit(key: string) {
  await db.fudoRateLimit.deleteMany({ where: { key } });
}
export const rateKey = (purpose: string, identity: string) => `${purpose}:${hashToken(identity)}`;
