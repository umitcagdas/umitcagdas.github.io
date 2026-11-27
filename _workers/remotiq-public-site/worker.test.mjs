import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handle} from './worker.mjs';

const base = 'https://remotiq.umitcagdas.com';
const files = { ASSETS: { fetch: (req) => new Response(new URL(req.url).pathname) } };
const query = '?utm_source=review&a=1&a=2';
const tags = ['', 'en/', 'de/', 'es/', 'fr/', 'id/', 'it/', 'ja/', 'ko/', 'pt-BR/', 'zh-Hans/'];

test('all four localized page types are served at their canonical paths', async () => {
  for (const tag of tags) for (const path of ['', 'get/', 'support.html', 'privacy.html']) {
    const relative = '/' + tag + path;
    const response = await handle(new Request(base + relative + query), files);
    assert.equal(await response.text(), relative.endsWith('/') ? relative+'index.html' : relative);
  }
});

test('old hostnames and legacy document spellings redirect to the matching page', async () => {
  for (const host of ['umitcagdas.com','www.umitcagdas.com']) {
    for (const old of ['/Remotiq','/remotiq']) for (const [suffix,canonical] of [
      ['', '/'], ['/index.html','/'], ['/en','/en/'], ['/ja/index.html','/ja/'],
      ['/de/support.html','/de/support.html'], ['/privacy.html','/privacy.html'],
      ['/en/get.html','/en/get/'], ['/zh-hans/get/index.html','/zh-Hans/get/'],
    ]) {
      const r = await handle(new Request('https://'+host+old+suffix+query), files);
      assert.equal(r.status,301); assert.equal(r.headers.get('location'),base+canonical+query);
    }
  }
});

test('existing portfolio downloads, manifests, other paths and methods reach the original server unchanged', async()=>{
  const pass = async (request) => new Response(request.url+' '+request.method+' '+request.headers.get('range'));
  for (const path of ['/Remotiq/assets/site.css','/Remotiq/mobile-version.json','/Remotiq/downloads/latest.json','/Remotiq/downloads/Remotiq.app.tar.gz','/RemotiqOther/']) {
    const req = new Request('https://umitcagdas.com'+path+query,{method:'HEAD',headers:{range:'bytes=0-5'}});
    assert.equal(await (await handle(req,files,pass)).text(),req.url+' HEAD bytes=0-5');
  }
});

test('new host supports installer and manifest paths plus human-friendly aliases',async()=>{
  for (const path of ['/mobile-version.json','/downloads/latest.json','/downloads/SHA256SUMS.txt','/downloads/Remotiq.app.tar.gz','/assets/site.css','/robots.txt','/sitemap.xml']) {
    assert.equal(await (await handle(new Request(base+path),files)).text(),path);
  }
  assert.equal((await handle(new Request(base+'/en/get.html'+query),files)).headers.get('location'),base+'/en/get/'+query);
  assert.equal((await handle(new Request('https://unknown.example/'),files)).status,404);
});
