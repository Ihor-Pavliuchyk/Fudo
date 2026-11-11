/** Fudo · Group orders · Week 1 prototype
 * All amounts are integer kopecks. No real payment is initiated.
 * Pure state transitions make the business logic easy to test and later move to API.
 */
export const PICKUP_FEE_KOP = 500; // Demo: 5 ₴ per paying participant other than the organizer
export const MAX_MEMBERS = 8;

export const DEMO_PRODUCTS = [
  { id: 'sandwich', name: 'Сендвіч з куркою', priceKop: 5900, oldPriceKop: 8900, emoji: '🥪' },
  { id: 'salad', name: 'Овочевий салат', priceKop: 4500, oldPriceKop: 7000, emoji: '🥗' },
  { id: 'croissant', name: 'Круасан', priceKop: 2900, oldPriceKop: 4900, emoji: '🥐' },
  { id: 'bowl', name: 'Рис-бол з овочами', priceKop: 6500, oldPriceKop: 9900, emoji: '🍚' },
] as const;

export type GroupStatus = 'collecting' | 'awaiting_pickup' | 'picked_up' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'refunded';
export type GroupMember = { id: string; name: string; joinedAt: string };
export type OrderLine = { id: string; memberId: string; productId: string; quantity: number; priceKop: number; title: string };
export type SimulatedPayment = { id: string; memberId: string; amountKop: number; status: PaymentStatus; createdAt: string; refundedAt?: string };
export type LogEntry = { at: string; text: string };
export type GroupOrder = {
  id: string;
  shopName: string;
  organizerId: string;
  pickupPoint: string;
  deadlineAt: string;
  status: GroupStatus;
  members: GroupMember[];
  lines: OrderLine[];
  payments: SimulatedPayment[];
  organizerCreditKop: number;
  history: LogEntry[];
};

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function assertValid(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
function checkCollecting(group: GroupOrder, now: Date): void {
  assertValid(group.status === 'collecting', 'Збір замовлення вже завершено.');
  assertValid(now.getTime() <= Date.parse(group.deadlineAt), 'Час збору вичерпано. Завершіть або скасуйте групу.');
}
function log(group: GroupOrder, text: string, now: Date): GroupOrder {
  return { ...group, history: [...group.history, { at: now.toISOString(), text }] };
}
export function formatMoney(kop: number): string {
  return `${(kop / 100).toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₴`;
}
export function createGroup(organizerName: string, pickupPoint: string, windowMinutes = 30, now = new Date()): GroupOrder {
  const name = organizerName.trim();
  assertValid(name.length >= 2 && name.length <= 40, 'Вкажіть ім’я організатора (2–40 символів).');
  assertValid(pickupPoint.trim().length >= 3 && pickupPoint.trim().length <= 100, 'Уточніть місце передачі замовлення.');
  assertValid(Number.isInteger(windowMinutes) && windowMinutes >= 5 && windowMinutes <= 120, 'Час збору має бути 5–120 хв.');
  const organizerId = makeId('u');
  return {
    id: makeId('FG'), shopName: 'Fudo Demo Market', organizerId,
    pickupPoint: pickupPoint.trim(),
    deadlineAt: new Date(now.getTime() + windowMinutes * 60_000).toISOString(),
    status: 'collecting',
    members: [{ id: organizerId, name, joinedAt: now.toISOString() }],
    lines: [], payments: [], organizerCreditKop: 0,
    history: [{ at: now.toISOString(), text: `${name} створив(-ла) групу` }],
  };
}
export function joinGroup(group: GroupOrder, nameValue: string, now = new Date()): GroupOrder {
  checkCollecting(group, now);
  const name = nameValue.trim();
  assertValid(name.length >= 2 && name.length <= 40, 'Вкажіть ім’я учасника (2–40 символів).');
  assertValid(group.members.length < MAX_MEMBERS, `У групі може бути максимум ${MAX_MEMBERS} осіб.`);
  assertValid(!group.members.some(m => m.name.toLocaleLowerCase('uk') === name.toLocaleLowerCase('uk')), 'Таке ім’я вже є у групі.');
  return log({ ...group, members: [...group.members, { id: makeId('u'), name, joinedAt: now.toISOString() }] }, `${name} приєднався(-лася)`, now);
}
export function getMemberSubtotal(group: GroupOrder, memberId: string): number {
  return group.lines.filter(l => l.memberId === memberId).reduce((sum, l) => sum + l.priceKop * l.quantity, 0);
}
export function getMemberPayment(group: GroupOrder, memberId: string): SimulatedPayment | undefined {
  return group.payments.find(p => p.memberId === memberId);
}
export function getMemberDue(group: GroupOrder, memberId: string): number {
  const subtotal = getMemberSubtotal(group, memberId);
  return subtotal === 0 ? 0 : subtotal + (memberId === group.organizerId ? 0 : PICKUP_FEE_KOP);
}
export function addProduct(group: GroupOrder, memberId: string, productId: string, now = new Date()): GroupOrder {
  checkCollecting(group, now);
  const member = group.members.find(m => m.id === memberId);
  assertValid(member, 'Учасника не знайдено.');
  assertValid(!getMemberPayment(group, memberId), 'Після оплати змінити кошик не можна.');
  const product = DEMO_PRODUCTS.find(p => p.id === productId);
  assertValid(product, 'Товар не знайдено.');
  const existing = group.lines.find(l => l.memberId === memberId && l.productId === productId);
  assertValid(!existing || existing.quantity < 5, 'Максимум 5 одиниць одного товару на учасника.');
  const lines = existing
    ? group.lines.map(l => l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l)
    : [...group.lines, { id: makeId('l'), memberId, productId, quantity: 1, priceKop: product.priceKop, title: product.name }];
  return log({ ...group, lines }, `${member.name} додав(-ла) «${product.name}»`, now);
}
export function removeProduct(group: GroupOrder, memberId: string, lineId: string, now = new Date()): GroupOrder {
  checkCollecting(group, now);
  assertValid(!getMemberPayment(group, memberId), 'Оплачений кошик змінити не можна.');
  const line = group.lines.find(l => l.id === lineId && l.memberId === memberId);
  assertValid(line, 'Товар не знайдено в кошику.');
  const lines = line.quantity > 1
    ? group.lines.map(l => l.id === lineId ? { ...l, quantity: l.quantity - 1 } : l)
    : group.lines.filter(l => l.id !== lineId);
  return log({ ...group, lines }, `Кількість «${line.title}» зменшено`, now);
}
export function simulateMemberPayment(group: GroupOrder, memberId: string, now = new Date()): GroupOrder {
  checkCollecting(group, now);
  const member = group.members.find(m => m.id === memberId);
  assertValid(member, 'Учасника не знайдено.');
  assertValid(!getMemberPayment(group, memberId), 'Цей учасник вже оплатив замовлення.');
  const amountKop = getMemberDue(group, memberId);
  assertValid(amountKop > 0, 'Спочатку додайте хоча б один товар.');
  const payments = [...group.payments, { id: makeId('pay'), memberId, amountKop, status: 'paid' as const, createdAt: now.toISOString() }];
  return log({ ...group, payments }, `${member.name} змоделював(-ла) оплату ${formatMoney(amountKop)}`, now);
}
export function getPaidMembers(group: GroupOrder): GroupMember[] {
  return group.members.filter(m => getMemberPayment(group, m.id)?.status === 'paid');
}
export function getPaidItemTotal(group: GroupOrder): number {
  return getPaidMembers(group).reduce((sum, m) => sum + getMemberSubtotal(group, m.id), 0);
}
export function getPickupReward(group: GroupOrder): number {
  return getPaidMembers(group).filter(m => m.id !== group.organizerId).length * PICKUP_FEE_KOP;
}
export function finalizeGroup(group: GroupOrder, now = new Date()): GroupOrder {
  assertValid(group.status === 'collecting', 'Група вже закрита.');
  assertValid(getPaidMembers(group).length >= 2, 'Для спільного замовлення потрібні мінімум 2 оплачені кошики.');
  return log({ ...group, status: 'awaiting_pickup' }, 'Збір завершено, сформовано замовлення лише з оплачених кошиків', now);
}
export function markPickedUp(group: GroupOrder, now = new Date()): GroupOrder {
  assertValid(group.status === 'awaiting_pickup', 'Спочатку завершіть збір.');
  return log({ ...group, status: 'picked_up' }, 'Організатор підтвердив отримання замовлення', now);
}
export function completeGroup(group: GroupOrder, now = new Date()): GroupOrder {
  assertValid(group.status === 'picked_up', 'Спочатку підтвердьте отримання замовлення.');
  const organizerCreditKop = getPickupReward(group);
  return log({ ...group, status: 'completed', organizerCreditKop }, `Замовлення завершене; демо-бонус організатора: ${formatMoney(organizerCreditKop)}`, now);
}
export function cancelGroup(group: GroupOrder, now = new Date()): GroupOrder {
  assertValid(group.status === 'collecting', 'Після завершення збору потрібне окреме звернення до підтримки.');
  const refundedAt = now.toISOString();
  const payments = group.payments.map(p => p.status === 'paid' ? { ...p, status: 'refunded' as const, refundedAt } : p);
  return log({ ...group, status: 'cancelled', payments, organizerCreditKop: 0 }, 'Групу скасовано, демо-оплати позначено як повернені', now);
}
export function getRefundedTotal(group: GroupOrder): number {
  return group.payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amountKop, 0);
}
