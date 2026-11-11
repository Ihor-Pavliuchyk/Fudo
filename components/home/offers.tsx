'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import styles from '@/app/home.module.css';

type Kind = 'Випічка' | 'Готові страви' | 'Овочі та фрукти' | 'Продуктові набори';
type Offer = { id: string; name: string; vendor: string; kind: Kind; emoji: string; price: number; oldPrice: number; gradient: string; short: string };

// Демонстраційні дані для верстки Нестора: реальні магазинні акції поки не підключені.
const offers: Offer[] = [
  { id:'buns', name:'Вечірній набір випічки', vendor:'Пекарня поруч', kind:'Випічка', emoji:'🥐', price:69, oldPrice:144, gradient:'peach', short:'Круасани та булочки' },
  { id:'dinner', name:'Готова вечеря', vendor:'Смачна перерва', kind:'Готові страви', emoji:'🍱', price:99, oldPrice:165, gradient:'lavender', short:'Готовий набір на вечір' },
  { id:'produce', name:'Набір овочів та фруктів', vendor:'Зелений кошик', kind:'Овочі та фрукти', emoji:'🥑', price:79, oldPrice:172, gradient:'mint', short:'Сезонні продукти' },
  { id:'groceries', name:'Сюрприз-бокс продуктів', vendor:'Маркет Щодня', kind:'Продуктові набори', emoji:'🛍️', price:119, oldPrice:259, gradient:'butter', short:'Різні продукти дня' },
  { id:'pizza', name:'Вечірній ланч-бокс', vendor:'Тепла кухня', kind:'Готові страви', emoji:'🍕', price:109, oldPrice:227, gradient:'rose', short:'Смачний набір для студента' },
  { id:'bread', name:'Хлібний кошик', vendor:'Добрий хліб', kind:'Випічка', emoji:'🥖', price:55, oldPrice:120, gradient:'sand', short:'Свіжа випічка до вечора' },
];
const categories = ['Усі пропозиції', 'Випічка', 'Готові страви', 'Овочі та фрукти', 'Продуктові набори'] as const;

export function Offers() {
  const [category, setCategory] = useState<string>('Усі пропозиції');
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => offers.filter(offer => {
    const matchesCategory = category === 'Усі пропозиції' || category === offer.kind;
    const query = search.trim().toLocaleLowerCase('uk');
    const matchesSearch = !query || [offer.name, offer.vendor, offer.kind, offer.short].some(value => value.toLocaleLowerCase('uk').includes(query));
    return matchesCategory && matchesSearch;
  }), [category, search]);

  return <>
    <div className={styles.searchBox}>
      <Search size={19} aria-hidden="true" />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Шукати магазин, страву чи продукт..." aria-label="Пошук пропозицій" type="search" />
    </div>
    <div className={styles.filterBar} role="group" aria-label="Категорії пропозицій">
      {categories.map(item => <button type="button" key={item} className={category === item ? styles.filterActive : styles.filter} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <div className={styles.resultsHeader}><span>Пропозиції <span className={styles.count}>{filtered.length}</span></span><span className={styles.demoHint}>Приклади знижок для прототипу</span></div>
    {filtered.length ? <div className={styles.offersGrid}>
      {filtered.map(offer => <article key={offer.id} className={styles.offerCard}>
        <div className={`${styles.offerImage} ${styles[offer.gradient]}`}>
          <span className={styles.discount}>−{Math.round((1-offer.price/offer.oldPrice)*100)}%</span>
          <div className={styles.emojiDisc} aria-hidden="true">{offer.emoji}</div>
          <span className={styles.star} aria-hidden="true">✦</span>
          <span className={styles.categoryPill}>{offer.kind}</span>
        </div>
        <div className={styles.offerInfo}>
          <span className={styles.vendor}>✧ {offer.vendor}</span>
          <h3>{offer.name}</h3>
          <p>{offer.short} · демонстрація</p>
          <div className={styles.offerBottom}><div><strong>{offer.price} грн</strong><del>{offer.oldPrice} грн</del></div>
            <Link className={styles.offerGo} href="/maps" title="Переглянути карту магазинів" aria-label={`Знайти магазини для пропозиції «${offer.name}»`}><ArrowUpRight size={20}/></Link>
          </div>
        </div>
      </article>)}
    </div> : <div className={styles.emptyState}><Sparkles size={25}/><h3>Нічого не знайшлося</h3><p>Спробуй іншу назву або категорію.</p><button type="button" onClick={() => {setSearch(''); setCategory('Усі пропозиції');}}>Очистити фільтри</button></div>}
    <p className={styles.catalogDisclaimer}>* Назви, ціни, асортимент і знижки вище — приклади для демонстрації дизайну. Це не підтверджені акції магазинів. Реальні пропозиції та онлайн-кошик ще розробляються.</p>
  </>;
}
