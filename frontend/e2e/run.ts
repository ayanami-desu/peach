/* `npm run e2e` 的入口：默认跑 e2e 目录下全部用例。
 *
 * 逐轮迭代时用 `PEACH_E2E_FILES=canonical-routes,catalog-list` 只跑选中的文件，
 * 名字可带通配（`card-*`），也可以写成相对路径。选不中任何文件时直接失败，
 * 免得把写错的名字当成「没有用例」而静默通过。 */
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const available = readdirSync(here).filter(name => name.endsWith('.test.ts')).sort();

function expand(term) {
  const name = term.startsWith('e2e/') ? term.slice('e2e/'.length) : term;
  const literal = name.endsWith('.test.ts') ? name : `${name}.test.ts`;
  if (available.includes(literal)) return [literal];
  if (!name.includes('*')) return [];
  const pattern = new RegExp(`^${literal.replaceAll(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')}$`);
  return available.filter(file => pattern.test(file));
}

const requested = (process.env.PEACH_E2E_FILES ?? '').split(',').map(term => term.trim()).filter(Boolean);
const selected = [];
for (const term of requested) {
  const matched = expand(term);
  if (matched.length === 0) {
    console.error(`PEACH_E2E_FILES 里的 ${term} 没有对上任何用例；现有：${available.join(' ')}`);
    process.exit(2);
  }
  selected.push(...matched);
}

const targets = selected.length > 0 ? selected.map(file => join('e2e', file)) : ['e2e/**/*.test.ts'];
const child = spawn(process.execPath,
  ['--test', '--test-concurrency=1', '--test-reporter=tap', ...targets],
  { stdio: 'inherit' });
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
