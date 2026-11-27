import { cpSync, rmSync } from 'node:fs';

const assets = new URL('./.public/', import.meta.url);
rmSync(assets, { recursive: true, force: true });
cpSync(new URL('../../Remotiq/', import.meta.url), assets, { recursive: true });
cpSync(new URL('../../app-ads.txt', import.meta.url), new URL('app-ads.txt', assets));
