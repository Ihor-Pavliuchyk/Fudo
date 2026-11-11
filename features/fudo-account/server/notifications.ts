import "server-only";
import { db } from "./db";
type FudoNotificationType = "DISCOUNT" | "PROMOTION" | "ORDER_STATUS";

// This API is intentionally isolated. Team members can call it from the store and order modules.
// It writes in-app notifications; push/email delivery would be a separate integration.
export async function createFudoNotification(input: {
  userId: string;
  type: FudoNotificationType;
  title: string;
  body: string;
  href?: string;
}) {
  if (input.title.length > 120 || input.body.length > 600) throw new Error("Notification content is too long");
  if (input.href && (!input.href.startsWith("/") || input.href.startsWith("//"))) throw new Error("Internal relative href required");
  const prefs = await db.fudoNotificationPrefs.findUnique({ where: { userId: input.userId } });
  const enabled = input.type === "DISCOUNT" ? prefs?.discounts !== false :
    input.type === "PROMOTION" ? prefs?.promotions !== false : prefs?.orderStatus !== false;
  if (!enabled) return null;
  return db.fudoNotification.create({ data: input });
}

export async function notifyFudoOrderUpdate(userId: string, orderId: string, statusText: string) {
  return createFudoNotification({
    userId, type: "ORDER_STATUS", title: "Оновлення замовлення",
    body: `Замовлення ${orderId}: ${statusText}`,
    href: `/orders/${encodeURIComponent(orderId)}`,
  });
}
