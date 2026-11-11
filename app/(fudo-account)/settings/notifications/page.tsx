import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { db } from "@/features/fudo-account/server/db";
import { requireFudoUser } from "@/features/fudo-account/server/current-user";
import { NotificationPrefsForm } from "@/features/fudo-account/components/forms";
import { markNotificationReadAction } from "@/features/fudo-account/server/actions";
export const metadata: Metadata = { title: "Сповіщення" };
export default async function NotificationsPage() {
  const user = await requireFudoUser();
  const [prefs, items] = await Promise.all([
    db.fudoNotificationPrefs.findUnique({ where: { userId: user.id } }),
    db.fudoNotification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return <><div className="fudo-pagehead"><span className="fudo-eyebrow">Важливе для вас</span><h1>Сповіщення</h1><p>Контролюйте нові пропозиції та оновлення замовлень.</p></div>
    <section className="fudo-panel"><h2>Налаштування</h2><NotificationPrefsForm discounts={prefs?.discounts ?? true} promotions={prefs?.promotions ?? true} orderStatus={prefs?.orderStatus ?? true}/></section>
    <section className="fudo-panel"><h2>Вхідні сповіщення</h2><p className="fudo-muted">Повідомлення зберігаються в акаунті. Нові події з’являться після підключення магазинів і замовлень.</p>
      {items.length === 0 ? <div className="fudo-empty"><Bell size={28}/><strong>Поки немає повідомлень</strong><span>Коли з’являться оновлення, ви побачите їх тут.</span></div> :
      <ul className="fudo-notification-list">{items.map((item) => <li key={item.id} className={`fudo-notification ${item.readAt ? "" : "fudo-unread"}`}>
        <div className="fudo-notification-main"><strong>{item.title}</strong><p>{item.body}</p><small>{new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</small>{item.href?.startsWith("/") && !item.href.startsWith("//") && <Link href={item.href}>Переглянути</Link>}</div>
        {!item.readAt && <form action={markNotificationReadAction}><input type="hidden" name="notificationId" value={item.id}/><button title="Позначити прочитаним" aria-label="Позначити прочитаним" className="fudo-icon-btn"><CheckCheck size={18}/></button></form>}
      </li>)}</ul>}
    </section>
  </>;
}
