import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/fudo-account/components/forms";
export const metadata: Metadata = { title: "Відновлення пароля" };
export default function ForgotPasswordPage() {
  return <section className="fudo-auth-card"><span className="fudo-eyebrow">Безпека акаунта</span><h1>Забули пароль?</h1><p className="fudo-muted">Введіть email, і ми надішлемо посилання для створення нового пароля.</p><ForgotPasswordForm/></section>;
}
