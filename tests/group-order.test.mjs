import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGroup, joinGroup, addProduct, removeProduct, simulateMemberPayment, finalizeGroup,
  markPickedUp, completeGroup, cancelGroup, getMemberDue, getPickupReward,
  getPaidItemTotal, getRefundedTotal, getPaidMembers,
} from '../lib/fudo-group-order.ts';

const T0 = new Date('2026-11-11T12:00:00.000Z');
const demo = () => createGroup('Ігор', 'Гуртожиток № 5, хол', 30, T0);
function twoPaid() {
  let g = demo();
  g = joinGroup(g, 'Марко', T0);
  g = addProduct(g, g.organizerId, 'sandwich', T0);
  g = addProduct(g, g.members[1].id, 'salad', T0);
  g = simulateMemberPayment(g, g.organizerId, T0);
  g = simulateMemberPayment(g, g.members[1].id, T0);
  return g;
}

test('створення групи і 30-хвилинний дедлайн', () => {
  const g = demo();
  assert.equal(g.members.length, 1);
  assert.equal(g.status, 'collecting');
  assert.equal(g.deadlineAt, '2026-11-11T12:30:00.000Z');
});
test('учасники не дублюються, кількість обмежена', () => {
  let g = joinGroup(demo(), 'Марко', T0);
  assert.throws(() => joinGroup(g, 'марко', T0), /вже є/);
  for (const name of ['Анна', 'Оля', 'Назар', 'Петро', 'Софія', 'Влад']) g = joinGroup(g, name, T0);
  assert.equal(g.members.length, 8);
  assert.throws(() => joinGroup(g, 'Ще один', T0), /максимум 8/);
});
test('сума учасника: ціна їжі + 5 грн лише для неорганізатора', () => {
  let g = joinGroup(demo(), 'Марко', T0);
  g = addProduct(g, g.organizerId, 'sandwich', T0);
  g = addProduct(g, g.members[1].id, 'salad', T0);
  g = addProduct(g, g.members[1].id, 'salad', T0);
  assert.equal(getMemberDue(g, g.organizerId), 5900);
  assert.equal(getMemberDue(g, g.members[1].id), 9500);
  g = removeProduct(g, g.members[1].id, g.lines.find(l => l.memberId === g.members[1].id).id, T0);
  assert.equal(getMemberDue(g, g.members[1].id), 5000);
});
test('не можна завершити збір з однією оплатою', () => {
  let g = demo();
  g = addProduct(g, g.organizerId, 'bowl', T0);
  g = simulateMemberPayment(g, g.organizerId, T0);
  assert.throws(() => finalizeGroup(g, T0), /мінімум 2/);
});
test('оплачений кошик заблокований від змін', () => {
  let g = demo();
  g = addProduct(g, g.organizerId, 'bowl', T0);
  g = simulateMemberPayment(g, g.organizerId, T0);
  assert.throws(() => addProduct(g, g.organizerId, 'salad', T0), /Після оплати/);
  assert.throws(() => simulateMemberPayment(g, g.organizerId, T0), /вже оплатив/);
});
test('повний сценарій: 2 оплати → отримання → завершення → бонус', () => {
  let g = twoPaid();
  assert.equal(getPaidMembers(g).length, 2);
  assert.equal(getPaidItemTotal(g), 10400);
  assert.equal(getPickupReward(g), 500);
  g = finalizeGroup(g, T0);
  assert.equal(g.status, 'awaiting_pickup');
  g = markPickedUp(g, T0);
  g = completeGroup(g, T0);
  assert.equal(g.status, 'completed');
  assert.equal(g.organizerCreditKop, 500);
});
test('скасування повертає демо-оплати, бонус не нараховується', () => {
  let g = twoPaid();
  g = cancelGroup(g, T0);
  assert.equal(g.status, 'cancelled');
  assert.equal(g.payments.every(p => p.status === 'refunded'), true);
  assert.equal(getRefundedTotal(g), 10900);
  assert.equal(g.organizerCreditKop, 0);
});
test('після дедлайну нова оплата й додавання товарів заборонені', () => {
  let g = demo();
  const late = new Date('2026-11-11T12:31:00.000Z');
  assert.throws(() => addProduct(g, g.organizerId, 'salad', late), /Час збору вичерпано/);
  assert.throws(() => joinGroup(g, 'Марко', late), /Час збору вичерпано/);
});
