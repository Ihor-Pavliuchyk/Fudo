import type { Metadata } from "next";
import { ProfileForm, ChangePasswordForm, ChangeEmailForm } from "@/features/fudo-account/components/forms";
import { requireFudoUser } from "@/features/fudo-account/server/current-user";
export const metadata: Metadata = { title: "Особисті дані" };
export default async function ProfilePage() {
  const user = await requireFudoUser();
  return <><div className="fudo-pagehead"><span className="fudo-eyebrow">Акаунт</span><h1>Особисті дані</h1><p>Оновлюйте контактні дані та налаштовуйте безпеку акаунта.</p></div>
    <section className="fudo-panel fudo-stack"><div><h2>Ваш профіль</h2><p className="fudo-muted">Ім’я та телефон можна змінювати в будь-який час.</p><ProfileForm name={user.name} phone={user.phone ?? ""}/></div>
    <div className="fudo-panel-divider"/><div><h2>Електронна пошта</h2><p className="fudo-current-email">{user.email}</p><ChangeEmailForm/></div>
    <div className="fudo-panel-divider"/><div><h2>Пароль</h2><ChangePasswordForm/></div></section>
  </>;
}
