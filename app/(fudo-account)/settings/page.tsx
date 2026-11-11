import type { Metadata } from "next";
import Link from "next/link";
import { UserRound, Bell, LifeBuoy, Info, ChevronRight } from "lucide-react";
import { requireFudoUser } from "@/features/fudo-account/server/current-user";
export const metadata: Metadata = { title: "Налаштування" };
const options = [
  { href: "/settings/profile", title: "Особисті дані", subtitle: "Профіль, email і пароль", Icon: UserRound },
  { href: "/settings/notifications", title: "Сповіщення", subtitle: "Знижки, акції, статус замовлення", Icon: Bell },
  { href: "/settings/support", title: "Підтримка", subtitle: "Допомога та повідомлення про проблему", Icon: LifeBuoy },
  { href: "/settings/about", title: "Про нас", subtitle: "Правила та політика приватності", Icon: Info },
];
export default async function SettingsPage() {
  const user = await requireFudoUser();
  return <><div className="fudo-pagehead"><span className="fudo-eyebrow">Ваш простір у Fudo</span><h1>Привіт, {user.name}!</h1><p>Керуйте акаунтом і обирайте, що для вас важливо.</p></div><section className="fudo-panel">
    {options.map(({ href, title, subtitle, Icon }) => <Link href={href} className="fudo-menu-item" key={href}><span className="fudo-menu-icon"><Icon size={22}/></span><span className="fudo-menu-text"><strong>{title}</strong><small>{subtitle}</small></span><ChevronRight size={20}/></Link>)}
  </section></>;
}
