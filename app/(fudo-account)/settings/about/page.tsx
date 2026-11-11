import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ShieldCheck, Leaf } from "lucide-react";
export const metadata: Metadata = { title: "Про Fudo" };
export default function AboutPage() {
  return <><div className="fudo-pagehead"><span className="fudo-eyebrow">Fudo</span><h1>Про нас</h1><p>Менше харчових відходів. Більше доступних страв для студентів.</p></div>
    <section className="fudo-panel fudo-about"><div className="fudo-about-icon"><Leaf size={30}/></div><h2>Що таке Fudo?</h2><p>Fudo — студентський проєкт, який допомагає знаходити товари зі знижками у місцевих магазинах і об’єднуватися для групових замовлень, зокрема мешканцям гуртожитків.</p><p>Наша мета — зробити свіжі продукти доступнішими та допомогти магазинам зменшувати списання їжі.</p></section>
    <div className="fudo-link-cards"><Link href="/settings/about/terms" className="fudo-link-card"><BookOpen size={24}/><strong>Правила користування</strong><span>Умови використання сервісу</span></Link><Link href="/settings/about/privacy" className="fudo-link-card"><ShieldCheck size={24}/><strong>Політика конфіденційності</strong><span>Як обробляються дані</span></Link></div>
  </>;
}
