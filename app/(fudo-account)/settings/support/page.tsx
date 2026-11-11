import type { Metadata } from "next";
import { HelpCircle, Mail, MessageSquareText } from "lucide-react";
import { SupportForm } from "@/features/fudo-account/components/forms";
import { db } from "@/features/fudo-account/server/db";
import { requireFudoUser } from "@/features/fudo-account/server/current-user";
export const metadata: Metadata = { title: "Підтримка" };
const faq = [
  { question: "Як працюють знижки Fudo?", answer: "Магазини публікують актуальні пропозиції на товари. Перевіряйте опис, ціну, наявність і час дії конкретної пропозиції." },
  { question: "Як працює групове замовлення?", answer: "Студенти зможуть об’єднуватися в одне замовлення. Деталі оплати та повернень з’являться після підключення модуля групових замовлень." },
  { question: "Не можу увійти до акаунта. Що робити?", answer: "Перевірте email і пароль або використайте сторінку «Забули пароль?». Якщо проблема залишилася, створіть звернення." },
];
export default async function SupportPage() {
  const user = await requireFudoUser();
  const tickets = await db.fudoSupportTicket.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 });
  const email = process.env.SUPPORT_EMAIL || "";
  return <><div className="fudo-pagehead"><span className="fudo-eyebrow">Ми на зв’язку</span><h1>Підтримка</h1><p>Знайдіть відповідь або повідомте команді про проблему.</p></div>
    <section className="fudo-panel"><h2><HelpCircle size={20}/> Поширені запитання</h2><div className="fudo-faq">{faq.map((x) => <details key={x.question}><summary>{x.question}</summary><p>{x.answer}</p></details>)}</div></section>
    <section className="fudo-panel"><h2><Mail size={20}/> Контакти</h2>{email ? <p>Напишіть нам: <a href={`mailto:${email}`}>{email}</a></p> : <p className="fudo-muted">Контактну пошту команда додасть перед запуском. Наразі скористайтеся формою нижче.</p>}</section>
    <section className="fudo-panel"><h2><MessageSquareText size={20}/> Повідомити про проблему</h2><p className="fudo-muted">Звернення зберігаються у базі. Обробку командою додамо після інтеграції адміністрування.</p><SupportForm/></section>
    <section className="fudo-panel"><h2>Мої звернення</h2>{tickets.length === 0 ? <p className="fudo-muted">У вас ще немає звернень.</p> : <ul className="fudo-tickets">{tickets.map((ticket) => <li key={ticket.id}><div><strong>{ticket.subject}</strong><small>{new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium" }).format(ticket.createdAt)}</small></div><span className="fudo-tag">{ticket.status === "OPEN" ? "Відкрито" : ticket.status}</span></li>)}</ul>}</section>
  </>;
}
