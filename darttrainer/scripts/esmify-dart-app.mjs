/**
 * Palīgs: dart-app → ESM (Vue / vue-router / export default).
 * Palaiž: node scripts/esmify-dart-app.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../resources/js/dart-app');

const skip = new Set([
  'i18n/messages.js',
  'cookiealert.js',
  'app.js',
  'api.js',
  'router.js',
]);

function walk(dir, base = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (fs.statSync(p).isDirectory()) out.push(...walk(p, rel));
    else if (name.endsWith('.js')) out.push([p, rel]);
  }
  return out;
}

for (const [p, rel] of walk(root)) {
  if (skip.has(rel)) continue;
  if (rel.startsWith('store/')) continue;

  let c = fs.readFileSync(p, 'utf8');
  const orig = c;

  if (rel === 'composables/useBodyShellClass.js') {
    c = c.replace(
      /function useBodyShellClass/m,
      "import { onMounted, onUnmounted } from 'vue';\nexport function useBodyShellClass",
    );
    c = c.replace(/Vue\.onMounted/g, 'onMounted');
    c = c.replace(/Vue\.onUnmounted/g, 'onUnmounted');
    if (c !== orig) fs.writeFileSync(p, c);
    continue;
  }

  const needsVue =
    /\bVue\./.test(c) || /\}\s*=\s*Vue\b/.test(c) || /\bVue\.ref\b/.test(c);
  const needsVueRouter = /VueRouter\.use(Router|Route)/.test(c);

  let prepend = [];
  if (needsVue) prepend.push("import * as Vue from 'vue';");
  if (needsVueRouter) prepend.push("import { useRouter, useRoute } from 'vue-router';");

  if (needsVueRouter) {
    c = c.replace(/VueRouter\.useRouter\(\)/g, 'useRouter()');
    c = c.replace(/VueRouter\.useRoute\(\)/g, 'useRoute()');
  }

  if (prepend.length) {
    const lines = c.split('\n');
    let insertAt = 0;
    while (insertAt < lines.length && /^\s*(\/\*|\/\/| \*|\*\/)/.test(lines[insertAt])) {
      insertAt++;
      if (lines[insertAt - 1].includes('*/')) break;
    }
    while (insertAt < lines.length && /^\s*(\/\*| \*|\*\/)/.test(lines[insertAt])) insertAt++;
    while (insertAt < lines.length && lines[insertAt].startsWith('import ')) insertAt++;
    lines.splice(insertAt, 0, ...prepend);
    c = lines.join('\n');
  }

  if (rel.startsWith('pages/') || rel.startsWith('components/')) {
    if (!/export\s+default\s*\{/.test(c)) {
      c = c.replace(/\bconst\s+[A-Za-z0-9_]+\s*=\s*\{/m, 'export default {');
    }
  }

  if (c !== orig) fs.writeFileSync(p, c);
}

console.log('esmify-dart-app: done');
