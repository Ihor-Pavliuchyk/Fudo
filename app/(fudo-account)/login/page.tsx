import type { Metadata } from "next";
import { LoginForm } from "@/features/fudo-account/components/forms";
export const metadata: Metadata = { title: "Вхід" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ created?: string; password?: string; email?: string; next?: string }> }) {
  const params = await searchParams;
  return <section className="fudo-auth-card"><span className="fudo-eyebrow">З поверненням!</span><h1>Увійти до Fudo</h1><p className="fudo-muted">Продовжуйте знаходити вигідні пропозиції та замовляти разом.</p>
    {params.created === "1" && <div className="fudo-alert fudo-alert-ok">Акаунт створено. Увійдіть, використовуючи свій пароль.</div>}
    {params.password === "changed" && <div className="fudo-alert fudo-alert-ok">Пароль оновлено. Увійдіть з новим паролем.</div>}
    {params.email === "updated" && <div className="fudo-alert fudo-alert-ok">Пошту оновлено. Увійдіть з новою адресою.</div>}
    <LoginForm next={params.next} />
  </section>;
}
