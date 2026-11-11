import Link from "next/link";
import { UserRound, Bell, LifeBuoy, Info, Settings2 } from "lucide-react";
import { LogoutControl } from "./logout-control";
const navigation = [
  { href: "/settings", label: "Огляд", Icon: Settings2 },
  { href: "/settings/profile", label: "Особисті дані", Icon: UserRound },
  { href: "/settings/notifications", label: "Сповіщення", Icon: Bell },
  { href: "/settings/support", label: "Підтримка", Icon: LifeBuoy },
  { href: "/settings/about", label: "Про нас", Icon: Info },
];
export function SettingsNav({ signedIn }: { signedIn: boolean }) {
  return <aside className="fudo-side" aria-label="Меню налаштувань"><h2>Налаштування</h2><nav className="fudo-nav">
    {navigation.map(({ href, label, Icon }) => <Link key={href} href={href} className="fudo-nav-link"><Icon size={19} aria-hidden="true"/> {label}</Link>)}
    {signedIn ? <LogoutControl /> : <Link className="fudo-nav-link" href="/login">Увійти</Link>}
  </nav></aside>;
}
