import { cpSync, rmSync } from 'node:fs';

const assets = new URL('./.public/', import.meta.url);
rmSync(assets, { recursive: true, force: true });
cpSync(new URL('../../batakoyunu/', import.meta.url), assets, { recursive: true });
