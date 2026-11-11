import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Search, ShoppingCart, Smile, Star } from 'lucide-react';
import { Offers } from '@/components/home/offers';
import styles from './home.module.css';

export default function Home() {
  return <main className={styles.home}>
    <section className={`${styles.hero} site-container`} aria-labelledby="hero-heading">
      <div className={styles.heroCopy}>
        <span className={styles.eyebrowPill}><span className={styles.liveDot}/> Новий погляд на вечірні покупки</span>
        <h1 id="hero-heading">Смачно їж.<br/><span>Менше витрачай.</span></h1>
        <p>Знаходь смачну їжу зі знижками наприкінці дня. Забирай свій набір, об&apos;єднуйся з друзями з гуртожитку.</p>
        <div className={styles.heroButtons}>
          <Link className={styles.btnPrimary} href="/#offers">Знайти щось смачне <ArrowRight size={17}/></Link>
          <Link className={styles.textLink} href="/#how-it-works">Як це працює <ArrowRight size={15}/></Link>
        </div>
        <div className={styles.heroBenefits}>
          <span><Check size={13}/> Вигідні ціни</span>
          <span><Check size={13}/> Свіжа їжа</span>
          <span><Check size={13}/> Менше відходів</span>
        </div>
      </div>
      <div className={styles.heroVisual} aria-label="Демонстраційна картка вечірньої пропозиції">
        <div className={styles.heroVisualCircle}/>
        <span className={styles.heroSun} aria-hidden="true">✳</span>
        <span className={styles.heroSparkle} aria-hidden="true">✦</span>
        <div className={styles.floatNote}><span>🌿</span><span><strong>Добрі покупки</strong><small>Їжа зі знижкою</small></span></div>
        <div className={styles.heroProductCard}>
          <div className={styles.heroProductTop}><span>Вибір вечора</span><span>♡</span></div>
          <div className={styles.heroFood} aria-hidden="true">🥗</div>
          <div className={styles.heroProductDetails}><small>Свіже та смачне</small><strong>Вечірній набір</strong><div><b>89 грн</b><del>185 грн</del><span>−52%</span></div></div>
        </div>
        <div className={styles.floatSuccess}><span>✓</span><div><strong>Забрали з користю</strong><small>Більше їжі — менше втрат</small></div></div>
      </div>
    </section>

    <section className={styles.offersSection} id="offers" aria-labelledby="offers-title">
      <div className="site-container">
        <div className={styles.sectionLabel}>Смачні знахідки поруч</div>
        <div className={styles.titleRow}><div><h2 id="offers-title">Вигідне на сьогодні <span className={styles.orangeStar}>✳</span></h2><p>Обирай те, що смакує. Усі пропозиції нижче — демонстраційні приклади.</p></div><span className={styles.updateBadge}>✦ Знижки в розробці</span></div>
        <Offers />
      </div>
    </section>

    <section className={`${styles.howSection} site-container`} id="how-it-works" aria-labelledby="how-title">
      <div className={styles.centerHeading}><div className={styles.sectionLabel}>Так просто</div><h2 id="how-title">Три кроки до вигідної вечері</h2><p>Більше смаку у твоєму дні, менше зайвих витрат.</p></div>
      <div className={styles.stepsGrid}>
        <div className={styles.stepItem}><div className={`${styles.stepIcon} ${styles.greenIcon}`}><Search size={43} strokeWidth={1.7}/></div><span>01</span><h3>Знайди пропозицію</h3><p>Переглядай вечірні набори та знижки у магазинах поруч.</p></div>
        <div className={styles.stepArrow} aria-hidden="true">······ →</div>
        <div className={styles.stepItem}><div className={`${styles.stepIcon} ${styles.yellowIcon}`}><ShoppingCart size={43} strokeWidth={1.7}/></div><span>02</span><h3>Обери набір</h3><p>Додай його до кошика або заплануй спільне замовлення з друзями.</p></div>
        <div className={styles.stepArrow} aria-hidden="true">······ →</div>
        <div className={styles.stepItem}><div className={`${styles.stepIcon} ${styles.pinkIcon}`}><Smile size={43} strokeWidth={1.7}/></div><span>03</span><h3>Забери й смакуй</h3><p>Забирай у зазначений час і насолоджуйся смачною їжею.</p></div>
      </div>
    </section>

    <section className={`${styles.groupBanner} site-container`} aria-labelledby="group-title">
      <div className={styles.groupCopy}><div className={styles.bannerEyebrow}>Для студентів</div><h2 id="group-title">Разом замовляти —<br/><span>ще вигідніше.</span></h2><p>Живеш у гуртожитку? Об&apos;єднуйтеся з сусідами, формуйте одне групове замовлення та діліть смаколики й витрати.</p><Link href="/group-orders" className={styles.whiteButton}>Обрати їжу для компанії <ArrowRight size={17}/></Link><small>Групове замовлення тестується — поки це демо без реальної оплати.</small></div>
      <div className={styles.groupArt} aria-hidden="true"><span className={styles.pizza}>🍕</span><div className={styles.orderNote}><div><strong>Група «Наш поверх»</strong><span>🟢</span></div><div className={styles.avatars}><i>О</i><i>М</i><i>А</i><i>+3</i></div><small>4 з 6 учасників</small><div className={styles.progress}><span/></div><small>До завершення збору · демо</small></div><span className={styles.bannerStar}>✳</span></div>
    </section>

    <section className={`${styles.reviews} site-container`} id="reviews" aria-labelledby="reviews-title">
      <div className={styles.sectionLabel}>Ваша думка важлива</div>
      <div className={styles.titleRow}><div><h2 id="reviews-title">Що кажуть про ідею fudo.</h2><p>Приклади відгуків для демонстрації майбутнього розділу.</p></div><Link href="/settings/support" className={styles.softButton}>Написати відгук <ArrowRight size={17}/></Link></div>
      <div className={styles.reviewGrid}>
        {[
          { quote:'Зручно було б знаходити вечерю після пар і не переплачувати. Особливо подобається ідея вечірніх наборів.', name:'Марія К.' },
          { quote:'Круте рішення для гуртожитку — те, чого бракує. Можна зібрати друзів і замовити разом.', name:'Олег П.' },
          { quote:'Подобається, що хороша їжа не пропадає, а студенти можуть купувати її за приємною ціною.', name:'Ірина М.' },
        ].map(review => <article className={styles.reviewCard} key={review.name}><div className={styles.stars}><Star/><Star/><Star/><Star/><Star/><span>“</span></div><blockquote>«{review.quote}»</blockquote><div className={styles.reviewer}><span>{review.name.charAt(0)}</span><div><strong>{review.name}</strong><small>Приклад відгуку</small></div></div></article>)}
      </div>
      <p className={styles.reviewDisclaimer}>* Відгуки наведені для прикладу й не є справжніми відгуками користувачів.</p>
    </section>

    <section className={`${styles.bottomCta} site-container`}><div><span>🌿 Не дай хорошій їжі пропасти</span><h2>Смакуй більше. Марнуй менше.</h2></div><Link href="/#offers" className={styles.btnPrimary}>Переглянути пропозиції <ArrowRight size={17}/></Link></section>

    <footer className={styles.footer}><div className="site-container"><div className={styles.footerColumns}><div className={styles.footerBrand}><Link href="/" aria-label="Fudo — на головну"><Image src="/brand/fudo-logo-footer.png" alt="fudo." width={1030} height={245}/></Link><p>Смачні рішення для щоденних покупок.<br/>Менше харчових відходів. Більше можливостей для студентів.</p><strong>Смачно. Вигідно. Без марнування.</strong></div><div><h3>Навігація</h3><Link href="/#offers">Пропозиції</Link><Link href="/#how-it-works">Як це працює</Link><Link href="/group-orders">Групові замовлення</Link><Link href="/#reviews">Відгуки</Link></div><div><h3>Можливості</h3><Link href="/maps">Карта магазинів ↗</Link><Link href="/settings">Налаштування</Link><Link href="/register">Для користувачів</Link></div><div><h3>Про проєкт</h3><p>Fudo — навчальний стартап команди студентів Львівської політехніки.</p><Link href="/settings/about">Про нас</Link><Link href="/settings/about/privacy">Політика конфіденційності</Link></div></div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} fudo. Усі права захищено.</span><span>Створено з турботою про їжу 🌿</span></div></div></footer>
  </main>;
}
