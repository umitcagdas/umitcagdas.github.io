import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { handle } from './worker.mjs';

const site = 'https://batakoffline.umitcagdas.com';
const env = { ASSETS: { fetch: request => new Response(new URL(request.url).pathname) } };
const parameters = '?lang=tr&utm_source=store&campaign=a%2Bb';

test('serves the landing, policy, support, artwork and publisher ads files', async () => {
  for (const path of ['/', '/support.html', '/privacy.html', '/assets/site.css', '/assets/app-icon.png', '/assets/main-menu.webp', '/apps-ads.txt', '/sitemap.xml', '/app-ads.txt']) {
    const response = await handle(new Request(site + path + parameters), env);
    assert.equal(await response.text(), path === '/' ? '/index.html' : path);
  }
});

test('old portfolio entries redirect only within the game and keep language and tracking', async () => {
  for (const host of ['umitcagdas.com', 'www.umitcagdas.com']) {
    for (const [suffix, path] of [['','/'],['/','/'],['/index.html','/'],['/privacy.html','/privacy.html'],['/support.html','/support.html'],['/assets/main-menu.webp','/assets/main-menu.webp'],['/privacy-policy.html','/privacy.html']]) {
      const r = await handle(new Request('https://' + host + '/batakoyunu' + suffix + parameters), env);
      assert.equal(r.status, 301);
      assert.equal(r.headers.get('location'), site + path + parameters);
    }
  }
  const r = await handle(new Request('https://umitcagdas.com/batakoyunuonline'), env, () => new Response('portfolio'));
  assert.equal(await r.text(), 'portfolio');
});

test('redirects legacy filenames and HTTP, permits HEAD, and rejects writes', async () => {
  const r = await handle(new Request(site + '/index.html' + parameters), env);
  assert.equal(r.headers.get('location'), site + '/' + parameters);
  const https = await handle(new Request(site.replace('https:', 'http:') + '/support.html' + parameters), env);
  assert.equal(https.headers.get('location'), site + '/support.html' + parameters);
  assert.equal((await handle(new Request(site + '/privacy.html', { method: 'HEAD' }), env)).status, 200);
  assert.equal((await handle(new Request(site + '/', { method: 'POST' }), env)).status, 405);
  assert.equal((await handle(new Request('https://example.org/'), env)).status, 404);
});

test('GitHub Pages moves each document with both its query and fragment', () => {
  const script = readFileSync(new URL('../../batakoyunu/legacy-navigation.js', import.meta.url), 'utf8');
  function navigate(address, canonical) {
    let redirect;
    const url = new URL(address);
    const location = { hostname: url.hostname, pathname: url.pathname, search: url.search, hash: url.hash, replace(value) { redirect = value; } };
    const document = { querySelector: () => ({ href: canonical }) };
    runInNewContext(script, { location, document, URL });
    return redirect;
  }
  for (const page of ['', 'index.html', 'privacy.html', 'support.html']) {
    const path = page === 'index.html' ? '' : page;
    const canonical = site + '/' + path;
    assert.equal(navigate('https://umitcagdas.github.io/batakoyunu/' + page + parameters + '#english', canonical), canonical + parameters + '#english');
    assert.equal(navigate(canonical, canonical), undefined);
  }
  assert.equal(navigate('https://umitcagdas.github.io/batakonline/', site + '/'), undefined);
});
