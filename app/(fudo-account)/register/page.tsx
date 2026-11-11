import type { Metadata } from "next";
import { RegisterForm } from "@/features/fudo-account/components/forms";
export const metadata: Metadata = { title: "Реєстрація" };
export default function RegisterPage() {
  return <section className="fudo-auth-card"><span className="fudo-eyebrow">Приєднуйтесь до Fudo</span><h1>Створити акаунт</h1><p className="fudo-muted">Знижки на їжу й групові замовлення для студентів — в одному місці.</p><RegisterForm/></section>;
}
