import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from './worker.mjs';

const site = 'https://marketsim.umitcagdas.com';
const env = { ASSETS: { fetch: (request) => new Response(new URL(request.url).pathname) } };
const query = '?lang=tr&utm_source=store&campaign=a%2Bb';

test('routes public landing pages, store documents and ads', async () => {
  for (const path of ['/', '/tr/', '/support.html', '/support-tr.html', '/privacy.html', '/privacy-tr.html', '/assets/app-icon.png', '/app-ads.txt', '/robots.txt', '/sitemap.xml']) {
    const response = await handle(new Request(site + path + query), env);
    assert.equal(await response.text(), path.endsWith('/') ? path + 'index.html' : path);
  }
});

test('legacy sites redirect to the equivalent document including any tracking parameters', async () => {
  for (const host of ['umitcagdas.com','www.umitcagdas.com']) {
    for (const [old, expected] of [['','/'], ['/','/'], ['/tr','/tr/'], ['/tr/index.html','/tr/'], ['/privacy-tr.html','/privacy-tr.html'], ['/support.html','/support.html']]) {
      const res = await handle(new Request('https://'+host+'/mahallemarketi'+old+query),env);
      assert.equal(res.status,301);
      assert.equal(res.headers.get('location'),site+expected+query);
    }
    const pass = await handle(new Request('https://'+host+'/mahallemarketim'),env,()=>new Response('portfolio'));
    assert.equal(await pass.text(),'portfolio');
  }
});

test('canonical aliases keep queries and HTTP redirects to HTTPS',async () => {
  for(const [from,to] of [['/tr/index.html','/tr/'],['/support-tr','/support-tr.html'],['/privacy','/privacy.html']]) {
    const res = await handle(new Request(site+from+query),env);
    assert.equal(res.headers.get('location'),site+to+query);
  }
  const r = await handle(new Request(site.replace('https:','http:')+'/privacy.html'),env);
  assert.equal(r.headers.get('location'),site+'/privacy.html');
  assert.equal((await handle(new Request(site+'/',{method:'POST'}),env)).status,405);
});
