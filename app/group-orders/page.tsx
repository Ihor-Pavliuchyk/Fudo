'use client';

import { useEffect, useState } from 'react';
import styles from './group-orders.module.css';
import {
  MAX_MEMBERS, PICKUP_FEE_KOP, DEMO_PRODUCTS,
  createGroup, joinGroup, addProduct, removeProduct, simulateMemberPayment,
  finalizeGroup, markPickedUp, completeGroup, cancelGroup,
  getMemberDue, getMemberSubtotal, getMemberPayment, getPaidMembers,
  getPaidItemTotal, getPickupReward, getRefundedTotal, formatMoney,
  type GroupOrder, type GroupStatus,
} from '../../lib/fudo-group-order';

const STORAGE_KEY = 'fudo:group-order:week1';
const STATUS: Record<GroupStatus, string> = {
  collecting: 'Збираємо замовлення',
  awaiting_pickup: 'Очікує отримання',
  picked_up: 'Замовлення отримано',
  completed: 'Завершено',
  cancelled: 'Скасовано',
};

export default function GroupOrdersPage() {
  const [ready, setReady] = useState(false);
  const [group, setGroup] = useState<GroupOrder | null>(null);
  const [organizerName, setOrganizerName] = useState('Ігор');
  const [pickupPoint, setPickupPoint] = useState('Гуртожиток №5, хол першого поверху');
  const [windowMinutes, setWindowMinutes] = useState(30);
  const [joiningName, setJoiningName] = useState('');
  const [activeMemberId, setActiveMemberId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GroupOrder;
        if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.lines) && Array.isArray(parsed.payments)) {
          setGroup(parsed);
          setActiveMemberId(parsed.organizerId);
        }
      }
    } catch { /* ignore invalid demo storage */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (group) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(group));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [group, ready]);

  function apply(fn: (current: GroupOrder) => GroupOrder, success: string) {
    if (!group) return;
    try {
      const updated = fn(group);
      setGroup(updated);
      setMessage(success);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не вдалося виконати дію.');
    }
  }
  function makeGroup() {
    try {
      const created = createGroup(organizerName, pickupPoint, windowMinutes);
      setGroup(created);
      setActiveMemberId(created.organizerId);
      setMessage('Групу створено. Додайте учасників і товари.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Помилка створення групи.');
    }
  }
  function addMember() {
    if (!group) return;
    try {
      const updated = joinGroup(group, joiningName);
      setGroup(updated);
      setActiveMemberId(updated.members.at(-1)?.id ?? group.organizerId);
      setJoiningName('');
      setMessage('Учасника додано до групи.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Не вдалося приєднатися.');
    }
  }
  function resetDemo() {
    setGroup(null);
    setActiveMemberId('');
    setMessage('Демонстрацію скинуто.');
  }

  const active = group?.members.find(m => m.id === activeMemberId) ?? group?.members[0];
  const activeId = active?.id ?? '';
  const activePayment = group && active ? getMemberPayment(group, activeId) : undefined;
  const ownLines = group?.lines.filter(line => line.memberId === activeId) ?? [];
  const isCollecting = group?.status === 'collecting';
  const isDeadlineExpired = group ? Date.now() > Date.parse(group.deadlineAt) : false;
  const canEdit = isCollecting && !isDeadlineExpired && !activePayment;
  const paidMembers = group ? getPaidMembers(group) : [];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>FUDO / ДЛЯ СТУДЕНТІВ</div>
            <h1>Разом замовляти <span>вигідніше.</span></h1>
            <p>Об’єднайтеся з друзями з гуртожитку, оберіть їжу зі знижкою та оформіть одне спільне замовлення.</p>
          </div>
          <div className={styles.heroBadge}><span aria-hidden="true">👥</span><strong>Одна група</strong><small>Кожен оплачує своє</small></div>
        </div>
        <div className={styles.notice} role="note">
          <strong>Навчальний прототип.</strong> Оплата, повернення коштів і бонус організатора тут лише симулюються. Дані зберігаються у вашому браузері; спільне замовлення з інших пристроїв поки недоступне.
        </div>
        {message && <div className={styles.feedback} role="status">{message}<button type="button" onClick={() => setMessage('')} aria-label="Закрити повідомлення">×</button></div>}

        {!ready ? <div className={styles.card}>Завантаження демонстрації…</div> : !group ? (
          <section className={styles.createCard}>
            <div className={styles.sectionHead}>
              <span className={styles.step}>01</span>
              <div><h2>Створити групове замовлення</h2><p>Усі дані можна змінити, почавши нову демонстрацію.</p></div>
            </div>
            <div className={styles.formGrid}>
              <label className={styles.field}>Ім’я організатора<input value={organizerName} maxLength={40} onChange={e => setOrganizerName(e.target.value)} placeholder="Наприклад, Ігор" /></label>
              <label className={styles.field}>Місце передачі їжі<input value={pickupPoint} maxLength={100} onChange={e => setPickupPoint(e.target.value)} placeholder="Гуртожиток, корпус, хол" /></label>
              <label className={styles.field}>Час на збір<select value={windowMinutes} onChange={e => setWindowMinutes(Number(e.target.value))}><option value={15}>15 хвилин</option><option value={30}>30 хвилин</option><option value={45}>45 хвилин</option><option value={60}>60 хвилин</option></select></label>
            </div>
            <button className={styles.primary} type="button" onClick={makeGroup}>+ Створити групу</button>
          </section>
        ) : (
          <>
            <section className={styles.summary} aria-label="Коротка інформація про групу">
              <div><small>Статус</small><strong className={styles.status}>{STATUS[group.status]}</strong></div>
              <div><small>Учасники</small><strong>{group.members.length} / {MAX_MEMBERS}</strong></div>
              <div><small>Оплачені кошики</small><strong>{paidMembers.length}</strong></div>
              <div><small>Сума оплачених товарів</small><strong>{formatMoney(getPaidItemTotal(group))}</strong></div>
            </section>
            <div className={styles.metaLine}><span>Магазин: <b>{group.shopName}</b></span><span>Передача: <b>{group.pickupPoint}</b></span><span>Збір до: <b>{new Date(group.deadlineAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</b></span></div>
            <div className={styles.layout}>
              <div className={styles.mainColumn}>
                <section className={styles.card}>
                  <div className={styles.sectionHead}><span className={styles.step}>02</span><div><h2>Учасники групи</h2><p>Натисніть на ім’я, щоб додати товари до кошика цієї людини.</p></div></div>
                  <div className={styles.members}>
                    {group.members.map((member) => {
                      const payment = getMemberPayment(group, member.id);
                      return <button key={member.id} className={`${styles.member} ${activeId === member.id ? styles.memberActive : ''}`} type="button" onClick={() => setActiveMemberId(member.id)}>
                        <span className={styles.avatar}>{member.name.slice(0, 1).toUpperCase()}</span>
                        <span><b>{member.name}</b><small>{member.id === group.organizerId ? 'Організатор' : 'Учасник'}</small><small className={payment?.status === 'paid' ? styles.paid : ''}>{payment?.status === 'paid' ? '✓ Оплачено' : payment?.status === 'refunded' ? '↩ Повернено' : 'Не оплачено'}</small></span>
                      </button>;
                    })}
                  </div>
                  {isCollecting && <div className={styles.joinRow}><input aria-label="Ім’я нового учасника" maxLength={40} placeholder="Ім’я нового учасника" value={joiningName} onChange={e => setJoiningName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addMember(); }} disabled={isDeadlineExpired || group.members.length >= MAX_MEMBERS} /><button className={styles.secondary} onClick={addMember} type="button" disabled={isDeadlineExpired || group.members.length >= MAX_MEMBERS}>+ Додати</button></div>}
                </section>
                <section className={styles.card}>
                  <div className={styles.sectionHead}><span className={styles.step}>03</span><div><h2>Товари зі знижками</h2><p>Демонстраційний асортимент одного магазину.</p></div></div>
                  <div className={styles.products}>
                    {DEMO_PRODUCTS.map(product => <article className={styles.product} key={product.id}>
                      <div className={styles.productEmoji} aria-hidden="true">{product.emoji}</div>
                      <strong>{product.name}</strong>
                      <div className={styles.prices}><b>{formatMoney(product.priceKop)}</b><del>{formatMoney(product.oldPriceKop)}</del></div>
                      <button className={styles.addButton} type="button" onClick={() => apply(g => addProduct(g, activeId, product.id), `Товар додано до кошика: ${active?.name}`)} disabled={!canEdit}>+ Додати</button>
                    </article>)}
                  </div>
                </section>
                <section className={styles.card}>
                  <div className={styles.sectionHead}><span className={styles.step}>04</span><div><h2>Кошик: {active?.name}</h2><p>Кожен учасник оплачує лише свої товари та, за потреби, внесок за отримання.</p></div></div>
                  {ownLines.length === 0 ? <p className={styles.muted}>У цьому кошику поки немає товарів.</p> : <div className={styles.cartRows}>
                    {ownLines.map(line => <div key={line.id} className={styles.cartRow}><span>{line.title} <small>× {line.quantity}</small></span><div><b>{formatMoney(line.priceKop * line.quantity)}</b><button type="button" className={styles.removeButton} onClick={() => apply(g => removeProduct(g, activeId, line.id), 'Кількість товару змінено.')} disabled={!canEdit} aria-label={`Прибрати одну одиницю: ${line.title}`}>−</button></div></div>)}
                  </div>}
                  <div className={styles.totals}>
                    <div><span>Вартість товарів</span><b>{formatMoney(getMemberSubtotal(group, activeId))}</b></div>
                    <div><span>Внесок організатору {activeId === group.organizerId ? '(не сплачується)' : ''}</span><b>{getMemberSubtotal(group, activeId) > 0 && activeId !== group.organizerId ? formatMoney(PICKUP_FEE_KOP) : '0 ₴'}</b></div>
                    <div className={styles.totalLine}><strong>Разом</strong><strong>{formatMoney(getMemberDue(group, activeId))}</strong></div>
                  </div>
                  {activePayment ? <div className={styles.successState}>{activePayment.status === 'paid' ? '✓ Цей кошик оплачено (симуляція)' : '↩ Оплату позначено як повернену (симуляція)'}</div> : <button className={styles.primary} type="button" onClick={() => apply(g => simulateMemberPayment(g, activeId), `Демо-оплату учасника «${active?.name}» проведено.`)} disabled={!canEdit || getMemberDue(group, activeId) === 0}>Оплатити {formatMoney(getMemberDue(group, activeId))} · ДЕМО</button>}
                </section>
              </div>
              <aside className={styles.sideColumn}>
                <section className={styles.card}>
                  <div className={styles.sectionHead}><span className={styles.step}>05</span><div><h2>Керування групою</h2><p>Дії організатора</p></div></div>
                  <div className={styles.infoRows}>
                    {group.members.map(member => {
                      const p = getMemberPayment(group, member.id);
                      return <div key={member.id}><span>{member.name}</span><b className={p?.status === 'paid' ? styles.paid : ''}>{p?.status === 'paid' ? formatMoney(p.amountKop) : p?.status === 'refunded' ? 'Повернено' : 'Очікуємо оплату'}</b></div>;
                    })}
                  </div>
                  <div className={styles.reward}><span>Бонус організатора за отримання</span><strong>{formatMoney(group.status === 'completed' ? group.organizerCreditKop : getPickupReward(group))}</strong><small>{group.status === 'completed' ? 'Демо-бонус нараховано' : 'Попередній розрахунок, не реальна виплата'}</small></div>
                  {group.status === 'collecting' && <><button className={styles.primary} type="button" disabled={paidMembers.length < 2} onClick={() => apply(g => finalizeGroup(g), 'Збір закрито. До замовлення включено лише оплачені кошики.')}>Завершити збір ({paidMembers.length}/2)</button><button className={styles.dangerOutline} type="button" onClick={() => { if (window.confirm('Скасувати групу? Усі демо-оплати будуть позначені як повернені.')) apply(g => cancelGroup(g), 'Групу скасовано, демо-кошти повернено.'); }}>Скасувати групу</button></>}
                  {group.status === 'awaiting_pickup' && <button className={styles.primary} type="button" onClick={() => apply(g => markPickedUp(g), 'Організатор підтвердив отримання їжі.')}>Підтвердити отримання в магазині</button>}
                  {group.status === 'picked_up' && <button className={styles.primary} type="button" onClick={() => apply(g => completeGroup(g), 'Замовлення завершено, демо-бонус нараховано.')}>Підтвердити передачу студентам</button>}
                  {group.status === 'completed' && <div className={styles.successState}>✓ Усі етапи завершено</div>}
                  {group.status === 'cancelled' && <div className={styles.successState}>Повернення (демо): {formatMoney(getRefundedTotal(group))}</div>}
                  {isCollecting && isDeadlineExpired && <p className={styles.warning}>Дедлайн минув. Закрийте групу, якщо є 2 оплати, або скасуйте її.</p>}
                  <button className={styles.resetButton} type="button" onClick={() => { if (window.confirm('Почати нову демонстрацію? Дані поточної групи зітруться з цього браузера.')) resetDemo(); }}>Почати нову демонстрацію</button>
                </section>
                <section className={styles.card}>
                  <h2 className={styles.smallHeading}>Як працює оплата?</h2>
                  <ol className={styles.steps}>
                    <li>Кожен обирає власні товари.</li>
                    <li>Кожен окремо оплачує свою частку.</li>
                    <li>Група містить лише оплачені кошики.</li>
                    <li>Організатор забирає їжу та передає студентам.</li>
                    <li>Після завершення фіксується його бонус.</li>
                  </ol>
                  <p className={styles.muted}>У реальному продукті оплати й виплати відбуватимуться лише через платіжного партнера.</p>
                </section>
                <section className={styles.card}>
                  <h2 className={styles.smallHeading}>Історія подій</h2>
                  <ul className={styles.history}>{group.history.slice().reverse().slice(0, 7).map((event, index) => <li key={`${event.at}-${index}`}><time>{new Date(event.at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</time><span>{event.text}</span></li>)}</ul>
                </section>
              </aside>
            </div>
          </>
        )}
        <footer className={styles.footer}>Fudo · Прототип групового замовлення · Тиждень 1</footer>
      </div>
    </main>
  );
}
