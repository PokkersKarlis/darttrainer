/**
 * Pievieno `import { ... } from '<rel>/store/index.js'` failiem, kas lieto Pinia store hookus.
 * node scripts/add-pinia-imports.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../resources/js/dart-app');

const skipRe = /^store\/|^(app|api|router|main)\.(js|vue)$/;

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

function storeImportPath(rel) {
  const depth = rel.split('/').length - 1;
  return `${'../'.repeat(depth)}store/index.js`;
}

for (const [p, rel] of walk(root)) {
  if (skipRe.test(rel)) continue;

  let c = fs.readFileSync(p, 'utf8');
  if (!/\buse(Auth|Locale|Friends|Game)Store\b/.test(c)) continue;
  if (/from\s+['"][^'"]*store\/index\.js['"]/.test(c)) continue;

  const names = [];
  if (/\buseAuthStore\b/.test(c)) names.push('useAuthStore');
  if (/\buseLocaleStore\b/.test(c)) names.push('useLocaleStore');
  if (/\buseFriendsStore\b/.test(c)) names.push('useFriendsStore');
  if (/\buseGameStore\b/.test(c)) names.push('useGameStore');
  const uniq = [...new Set(names)];
  const line = `import { ${uniq.join(', ')} } from '${storeImportPath(rel)}';`;

  const lines = c.split('\n');
  let insertAt = 0;
  while (insertAt < lines.length && lines[insertAt].startsWith('import ')) insertAt++;
  lines.splice(insertAt, 0, line);
  fs.writeFileSync(p, lines.join('\n'));
  console.log(rel);
}

console.log('add-pinia-imports: done');
