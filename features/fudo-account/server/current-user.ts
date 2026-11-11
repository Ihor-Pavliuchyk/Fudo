import "server-only";
import { auth } from "@/auth";
import { db } from "./db";
import { redirect } from "next/navigation";

export async function getFudoUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.fudoUser.findUnique({ where: { id: session.user.id } });
  if (!user || user.tokenVersion !== session.user.tokenVersion) return null;
  return user;
}
export async function requireFudoUser() {
  const user = await getFudoUser();
  if (!user) redirect("/login?next=/settings");
  return user;
}
