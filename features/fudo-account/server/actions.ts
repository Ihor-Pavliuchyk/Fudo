"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/auth";
import { db } from "./db";
import { requireFudoUser } from "./current-user";
import { sendAccountEmail, appOrigin, mailConfigured } from "./email";
import { checkPassword, hashPassword, hashToken, isRateLimited, makeToken, rateKey } from "./security";
import { registerSchema, profileSchema, passwordChangeSchema, loginSchema, resetSchema, emailChangeSchema, supportSchema } from "./validation";
import { friendlyZodError, type ActionResult } from "./action-types";

const failure = (message: string): ActionResult => ({ ok: false, message });
const success = (message: string): ActionResult => ({ ok: true, message });
const field = (form: FormData, key: string) => String(form.get(key) ?? "");

export async function registerAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: field(form, "name"), email: field(form, "email"), password: field(form, "password"),
    confirmPassword: field(form, "confirmPassword"), consent: field(form, "consent"),
  });
  if (!parsed.success) return failure(friendlyZodError(parsed.error.issues));
  const { name, email, password } = parsed.data;
  if (await isRateLimited(rateKey("register", email), 4, 60 * 60_000)) return failure("Забагато спроб. Спробуйте пізніше.");
  const existing = await db.fudoUser.findUnique({ where: { email } });
  if (existing) return failure("Акаунт з таким email уже існує");
  try {
    await db.fudoUser.create({
      data: { name, email, passwordHash: await hashPassword(password), preferences: { create: {} } },
    });
  } catch (error) {
    // Concurrent registration can hit the unique email constraint.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return failure("Акаунт з таким email уже існує");
    }
    throw error;
  }
  redirect("/login?created=1");
}

export async function loginAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: field(form, "email"), password: field(form, "password") });
  if (!parsed.success) return failure("Введіть коректні email і пароль");
  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return failure("Неправильний email або пароль (або забагато спроб)");
    throw error;
  }
  // Prevent external redirects, even if someone supplied ?next=https://...
  const next = field(form, "next");
  const safeNext = next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/settings";
  redirect(safeNext);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfileAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireFudoUser();
  const parsed = profileSchema.safeParse({ name: field(form, "name"), phone: field(form, "phone") });
  if (!parsed.success) return failure(friendlyZodError(parsed.error.issues));
  await db.fudoUser.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null } });
  revalidatePath("/settings/profile");
  return success("Особисті дані оновлено");
}

export async function changePasswordAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireFudoUser();
  const parsed = passwordChangeSchema.safeParse({ oldPassword: field(form, "oldPassword"), password: field(form, "password"), confirmPassword: field(form, "confirmPassword") });
  if (!parsed.success) return failure(friendlyZodError(parsed.error.issues));
  if (!(await checkPassword(parsed.data.oldPassword, user.passwordHash))) return failure("Поточний пароль неправильний");
  await db.fudoUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password), tokenVersion: { increment: 1 } } });
  await db.fudoPasswordResetToken.deleteMany({ where: { userId: user.id } });
  await signOut({ redirectTo: "/login?password=changed" });
  return success("Пароль оновлено");
}

export async function updateNotificationPrefsAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireFudoUser();
  await db.fudoNotificationPrefs.upsert({
    where: { userId: user.id }, create: { userId: user.id, discounts: form.has("discounts"), promotions: form.has("promotions"), orderStatus: form.has("orderStatus") },
    update: { discounts: form.has("discounts"), promotions: form.has("promotions"), orderStatus: form.has("orderStatus") },
  });
  revalidatePath("/settings/notifications");
  return success("Налаштування сповіщень збережено");
}

export async function markNotificationReadAction(form: FormData) {
  const user = await requireFudoUser();
  const id = field(form, "notificationId");
  if (id) await db.fudoNotification.updateMany({ where: { id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/settings/notifications");
}

export async function createSupportTicketAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireFudoUser();
  const parsed = supportSchema.safeParse({ subject: field(form, "subject"), message: field(form, "message") });
  if (!parsed.success) return failure(friendlyZodError(parsed.error.issues));
  if (await isRateLimited(rateKey("support", user.id), 6, 24 * 60 * 60_000)) return failure("Ліміт звернень на сьогодні вичерпано");
  await db.fudoSupportTicket.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/settings/support");
  return success("Звернення зареєстровано. Ми зберегли його у вашому акаунті.");
}

// Generic response prevents checking whether an email exists.
export async function requestPasswordResetAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = loginSchema.pick({ email: true }).safeParse({ email: field(form, "email") });
  if (!parsed.success) return failure("Вкажіть коректну електронну пошту");
  const email = parsed.data.email;
  if (process.env.NODE_ENV === "production" && !mailConfigured()) return failure("Відновлення пароля тимчасово недоступне. Зверніться до підтримки.");
  if (await isRateLimited(rateKey("reset-request", email), 3, 60 * 60_000)) {
    return success("Якщо акаунт існує, перевірте свою пошту.");
  }
  const user = await db.fudoUser.findUnique({ where: { email } });
  if (user) {
    const raw = makeToken();
    await db.fudoPasswordResetToken.deleteMany({ where: { userId: user.id } });
    const record = await db.fudoPasswordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 30 * 60_000) } });
    const link = `${appOrigin()}/reset-password?token=${encodeURIComponent(raw)}`;
    let delivered = false;
    try { delivered = await sendAccountEmail(email, "Fudo — відновлення пароля", `Для створення нового пароля відкрийте посилання (30 хвилин):\n${link}\nЯкщо ви не надсилали запит, просто проігноруйте цей лист.`); }
    catch (error) { console.error("Reset email failed", error); }
    if (!delivered) {
      await db.fudoPasswordResetToken.deleteMany({ where: { id: record.id } });
      if (process.env.NODE_ENV !== "production") return failure("Не вдалося надіслати лист. Налаштуйте поштовий сервіс.");
    }
  }
  return success("Якщо акаунт існує, ми надіслали інструкцію на електронну пошту.");
}

export async function resetPasswordAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({ token: field(form, "token"), password: field(form, "password"), confirmPassword: field(form, "confirmPassword") });
  if (!parsed.success) return failure(friendlyZodError(parsed.error.issues));
  const record = await db.fudoPasswordResetToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!record || record.expiresAt < new Date()) return failure("Посилання недійсне або прострочене. Запросіть нове.");
  // Conditional deletion consumes a reset token only once, even with simultaneous submissions.
  const changedHash = await hashPassword(parsed.data.password);
  try {
    await db.$transaction(async (tx) => {
      const consumed = await tx.fudoPasswordResetToken.deleteMany({ where: { id: record.id, expiresAt: { gt: new Date() } } });
      if (consumed.count !== 1) throw new Error("RESET_TOKEN_USED");
      await tx.fudoUser.update({ where: { id: record.userId }, data: { passwordHash: changedHash, tokenVersion: { increment: 1 } } });
      await tx.fudoPasswordResetToken.deleteMany({ where: { userId: record.userId } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_TOKEN_USED") return failure("Посилання вже використано. Запросіть нове.");
    throw error;
  }
  redirect("/login?password=changed");
}

export async function requestEmailChangeAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireFudoUser();
  const parsed = emailChangeSchema.safeParse({ newEmail: field(form, "newEmail"), password: field(form, "password") });
  if (!parsed.success) return failure(friendlyZodError(parsed.error.issues));
  if (!(await checkPassword(parsed.data.password, user.passwordHash))) return failure("Неправильний пароль");
  if (parsed.data.newEmail === user.email) return failure("Це вже ваша пошта");
  if (await db.fudoUser.findUnique({ where: { email: parsed.data.newEmail } })) return failure("Ця адреса вже використовується");
  if (await isRateLimited(rateKey("email-change", user.id), 3, 60 * 60_000)) return failure("Забагато запитів. Спробуйте пізніше.");
  const raw = makeToken();
  await db.fudoEmailChangeToken.deleteMany({ where: { userId: user.id } });
  const token = await db.fudoEmailChangeToken.create({ data: { userId: user.id, newEmail: parsed.data.newEmail, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 30 * 60_000) } });
  const link = `${appOrigin()}/verify-email?token=${encodeURIComponent(raw)}`;
  let sent = false;
  try { sent = await sendAccountEmail(parsed.data.newEmail, "Fudo — підтвердження нової пошти", `Для підтвердження нової адреси відкрийте посилання (30 хвилин):\n${link}`); }
  catch (error) { console.error("Email change delivery failed", error); }
  if (!sent) { await db.fudoEmailChangeToken.deleteMany({ where: { id: token.id } }); return failure("Не вдалося надіслати лист підтвердження"); }
  return success("Перевірте нову електронну пошту й підтвердьте зміну адреси.");
}

export async function verifyNewEmailAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const raw = field(form, "token");
  if (raw.length < 32) return failure("Некоректне посилання");
  const token = await db.fudoEmailChangeToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!token || token.expiresAt < new Date()) return failure("Посилання недійсне або прострочене");
  try {
    await db.$transaction(async (tx) => {
      const consumed = await tx.fudoEmailChangeToken.deleteMany({ where: { id: token.id, expiresAt: { gt: new Date() } } });
      if (consumed.count !== 1) throw new Error("EMAIL_TOKEN_USED");
      await tx.fudoUser.update({ where: { id: token.userId }, data: { email: token.newEmail, tokenVersion: { increment: 1 } } });
      await tx.fudoEmailChangeToken.deleteMany({ where: { userId: token.userId } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TOKEN_USED") return failure("Це посилання вже використано");
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return failure("Ця пошта вже зайнята");
    throw error;
  }
  await signOut({ redirectTo: "/login?email=updated" });
  return success("Email оновлено");
}
