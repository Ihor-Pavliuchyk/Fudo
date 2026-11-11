'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './maps.module.css';

const StoreMap = dynamic(() => import('../../components/map/StoreMap'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Завантаження карти…</div>,
});

const brands = ['Усі', 'Сільпо', 'Рукавичка', 'Близенько', 'Сімі'];

export default function MapsPage() {
  const [brand, setBrand] = useState('Усі');
  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>Fudo · Карти</span>
        <h1>Магазини на карті</h1>
        <p>Знайди магазини поруч. Магазини чотирьох мереж у Львові за даними OpenStreetMap. Впізнавані фірмові позначки видно без натискання. Шукай магазини поблизу гуртожитків.</p>
      </div>
      <div className={styles.filters} aria-label="Фільтр за мережею">
        {brands.map((item) => (
          <button key={item} type="button" aria-pressed={brand === item} className={brand === item ? styles.active : styles.filter} onClick={() => setBrand(item)}>{item}</button>
        ))}
      </div>
      <div className={styles.map}><StoreMap brand={brand} /></div>
      <p className={styles.notice}>Мітки отримуємо з OpenStreetMap: кількість залежить від повноти та актуальності відкритих даних. Позначки — власний дизайн Fudo з назвами мереж, а не офіційні логотипи. Гуртожитки беруться з OpenStreetMap, їхня приналежність до Львівської політехніки не завжди підтверджена. Знижки, залишки та партнерство Fudo поки не підключені.</p>
    </main>
  );
}
