import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const source = new URL('../../projeler/index.html', import.meta.url);
const directory = new URL('./.public/projeler/', import.meta.url);
const page = readFileSync(source, 'utf8').replaceAll('https://umitcagdas.github.io/', 'https://umitcagdas.com/');
mkdirSync(directory, { recursive: true });
writeFileSync(new URL('index.html', directory), page);
cpSync(new URL('../../projeler/assets/', import.meta.url), new URL('assets/', directory), {
  recursive: true,
});
