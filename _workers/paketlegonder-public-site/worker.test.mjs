import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from './worker.mjs';

const site = 'https://paketlegonder.umitcagdas.com';
const env = { ASSETS: { fetch: request => new Response(new URL(request.url).pathname) } };
const parameters = '?lang=tr&utm_source=store&campaign=a%2Bb';

test('serves the landing, policy, support, licenses and shared ads file', async () => {
  for (const path of ['/', '/support.html', '/privacy.html', '/style.css', '/workshop.png', '/godot-license.txt', '/nunito-license.txt', '/sitemap.xml', '/app-ads.txt']) {
    const response = await handle(new Request(site + path + parameters), env);
    assert.equal(await response.text(), path === '/' ? '/index.html' : path);
  }
});

test('old portfolio entries redirect only within the game and keep language and tracking', async () => {
  for (const host of ['umitcagdas.com', 'www.umitcagdas.com']) {
    for (const [suffix, path] of [['','/'],['/','/'],['/index.html','/'],['/privacy.html','/privacy.html'],['/support.html','/support.html'],['/godot-license.txt','/godot-license.txt']]) {
      const r = await handle(new Request('https://' + host + '/paketle-gonder' + suffix + parameters), env);
      assert.equal(r.status, 301);
      assert.equal(r.headers.get('location'), site + path + parameters);
    }
  }
  const r = await handle(new Request('https://umitcagdas.com/paketle-gonderme'), env, () => new Response('portfolio'));
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
