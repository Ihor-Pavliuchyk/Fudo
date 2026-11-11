'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag, Settings2 } from 'lucide-react';

const items = [
  { href: '/#offers', label: 'Пропозиції' },
  { href: '/#how-it-works', label: 'Як це працює' },
  { href: '/group-orders', label: 'Групові замовлення' },
  { href: '/#reviews', label: 'Відгуки' },
  { href: '/maps', label: 'Карта ↗' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  function close() { setOpen(false); }
  return <>
    <div className="site-announcement"><span>✦ Менше марнуємо. Більше смакуємо.</span><span className="site-announcement-extra">Студентський проєкт, що рятує їжу та бюджет</span></div>
    <header className="site-header">
      <nav className="site-nav site-container" aria-label="Головна навігація">
        <Link href="/" className="site-brand" aria-label="Fudo — головна" onClick={close}>
          <Image src="/brand/fudo-logo.png" alt="fudo." width={1030} height={245} priority className="site-brand-logo" />
        </Link>
        <div className="site-nav-links">
          {items.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
        <div className="site-nav-actions">
          <Link className="site-account-link" href="/login">Увійти</Link>
          <Link className="site-settings-link" href="/settings" aria-label="Налаштування акаунта" title="Налаштування"><Settings2 size={18} /></Link>
          <Link className="site-cart" href="/group-orders"><ShoppingBag size={17} aria-hidden="true" /> <span>Кошик</span></Link>
          <button className="site-menu-toggle" type="button" aria-expanded={open} aria-controls="site-mobile-menu" aria-label={open ? 'Закрити меню' : 'Відкрити меню'} onClick={() => setOpen(v => !v)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      {open && <div className="site-mobile-menu" id="site-mobile-menu"><nav aria-label="Мобільна навігація">
        {items.map(item => <Link href={item.href} key={item.href} onClick={close}>{item.label}</Link>)}
        <Link href="/login" onClick={close}>Увійти / Реєстрація</Link>
        <Link href="/settings" onClick={close}>⚙ Налаштування</Link>
      </nav></div>}
    </header>
  </>;
}
