import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(resolve(root,p),'utf8');
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name === '.next' || name === 'generated') return [];
    const f=resolve(dir,name); return statSync(f).isDirectory()?walk(f):[f];
  });
}
test('key pages from both modules survive merge', () => {
  for (const p of ['app/page.tsx','app/layout.tsx','app/maps/page.tsx','app/group-orders/page.tsx','app/api/stores/route.ts','app/api/dormitories/route.ts','app/api/auth/[...nextauth]/route.ts','auth.ts','prisma/schema.prisma']) assert.ok(existsSync(resolve(root,p)),p);
  for (const route of ['login','register','forgot-password','reset-password','verify-email','settings','settings/profile','settings/notifications','settings/support','settings/about','settings/about/terms','settings/about/privacy']) assert.ok(existsSync(resolve(root,'app/(fudo-account)',route,'page.tsx')),route);
});
test('all local imports of merged account module resolve (generated Prisma is build output)', () => {
  const files=['auth.ts',...walk(resolve(root,'features/fudo-account')), ...walk(resolve(root,'app/(fudo-account)')), ...walk(resolve(root,'app/api/auth'))].filter(x=>['.ts','.tsx'].includes(extname(x)));
  const fails=[];
  for(const file of files) {
    for(const m of readFileSync(file,'utf8').matchAll(/\bfrom\s+["']([^"']+)["']/g)) {
      const imp=m[1]; if(imp.includes('generated/prisma'))continue;
      const base=imp.startsWith('@/')?resolve(root,imp.slice(2)):imp.startsWith('.')?resolve(dirname(file),imp):null;
      if(!base)continue;
      if(!['.ts','.tsx','.d.ts','.js','/index.ts','/index.tsx'].some(x=>existsSync(base+x)))fails.push([file,imp]);
    }
  }
  assert.deepEqual(fails,[]);
});
test('shared navigation and FudoUser contract present',()=>{
  const layout=read('app/layout.tsx');
  const header=read('components/site-header.tsx');
  for(const href of ['/maps','/group-orders','/login','/settings'])assert.ok(header.includes(`'${href}'`) || header.includes(`"${href}"`),href);
  assert.match(layout,/SiteHeader/);
  assert.match(header,/fudo-logo\.png/);
  assert.ok(!read('features/fudo-account/components/shell.tsx').includes('fudo-topbar'), 'account header should not duplicate shared header');
  const schema=read('prisma/schema.prisma');
  assert.match(schema,/model FudoUser \{/);
  assert.match(schema,/model FudoNotification \{/);
  assert.match(read('tsconfig.json'),/"@\/\*"/);
});
