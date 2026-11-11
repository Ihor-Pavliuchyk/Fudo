import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/fudo-account/components/forms";
export const metadata: Metadata = { title: "Новий пароль" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <section className="fudo-auth-card"><h1>Новий пароль</h1><p className="fudo-muted">Створіть надійний пароль, який ще не використовували.</p>
    {token ? <ResetPasswordForm token={token}/> : <p className="fudo-alert fudo-alert-err">Відсутній токен. <Link href="/forgot-password">Надіслати новий запит</Link></p>}
  </section>;
}
