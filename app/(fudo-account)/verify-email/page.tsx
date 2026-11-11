import type { Metadata } from "next";
import Link from "next/link";
import { VerifyEmailForm } from "@/features/fudo-account/components/forms";
export const metadata: Metadata = { title: "Підтвердження пошти" };
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <section className="fudo-auth-card"><h1>Підтвердити пошту</h1><p className="fudo-muted">Натисніть кнопку, щоб активувати нову електронну адресу.</p>
    {token ? <VerifyEmailForm token={token}/> : <p className="fudo-alert fudo-alert-err">Немає токена підтвердження. <Link href="/settings/profile">Повернутися до профілю</Link></p>}
  </section>;
}
