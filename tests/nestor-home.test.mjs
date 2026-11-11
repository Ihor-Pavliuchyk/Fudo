import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=(path)=>readFileSync(resolve(root,path),'utf8');
test('The supplied Fudo logo is integrated in shared navigation',()=>{
  for(const name of ['fudo-logo-original.png','fudo-logo.png','fudo-icon.png']) assert.ok(existsSync(resolve(root,'public/brand',name)),name);
  assert.match(read('components/site-header.tsx'),/\/brand\/fudo-logo.png/);
  assert.match(read('app/layout.tsx'),/SiteHeader/);
});
test('Reference-based homepage sections and filters link into team modules',()=>{
  const home=read('app/page.tsx');
  const offers=read('components/home/offers.tsx');
  for (const section of ['offers','how-it-works','reviews']) assert.ok(home.includes(`id="${section}"`),section);
  assert.ok(home.includes('href="/group-orders"'));
  assert.ok(offers.includes('href="/maps"'));
  assert.ok(offers.includes('setSearch') && offers.includes('setCategory'));
  assert.match(offers,/демонстраційні/i);
});
test('The group orders page uses the shared header instead of duplicating nav',()=>{
  assert.doesNotMatch(read('app/group-orders/page.tsx'),/className=\{styles\.header\}/);
  assert.match(read('lib/fudo-group-order.ts'),/export/);
});
