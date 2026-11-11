import "server-only";
import { Resend } from "resend";

export const mailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
export function appOrigin() {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL must be configured");
  const parsed = new URL(value);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("APP_URL must be HTTPS in production");
  }
  return parsed.origin;
}
export async function sendAccountEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[Fudo DEV email] To: ${to}\nSubject: ${subject}\n${text}`);
      return true;
    }
    return false;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: process.env.EMAIL_FROM!, to, subject, text });
  if (result.error) { console.error("Fudo email sending failed:", result.error.message); return false; }
  return true;
}
