import { cpSync, mkdirSync, rmSync } from 'node:fs';

const staged = new URL('./.public/', import.meta.url);
rmSync(staged, { recursive: true, force: true });
mkdirSync(staged);
for (const name of ['supersoccer', '11-metre', 'app-ads.txt']) {
  cpSync(new URL('../../' + name, import.meta.url), new URL(name, staged), { recursive: true });
}
