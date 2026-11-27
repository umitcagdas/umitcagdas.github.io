import assert from 'node:assert/strict';
import test from 'node:test';
import { handle } from './worker.mjs';

const soccer = 'https://supersoccer.umitcagdas.com';
const eleven = 'https://11metre.umitcagdas.com';
const origin11 = 'https://onbirmetre.kobitron.com';
const originSoccer = 'https://soccer.kobitron.com';
const env = { ASSETS: { fetch: request => new Response(new URL(request.url).pathname) } };

test('each game serves its own landing, policy, graphics and authorized sellers', async () => {
  for (const [url, asset] of [[soccer+'/', '/supersoccer/oyun.html'], [soccer+'/privacy/', '/supersoccer/index.html'],
    [soccer+'/assets/icon.webp', '/supersoccer/assets/icon.webp'], [eleven+'/', '/11-metre/index.html'],
    [eleven+'/sq', '/11-metre/sq/index.html'], [eleven+'/fr/', '/11-metre/fr/index.html'],
    [eleven+'/de/privacy.html', '/11-metre/de/privacy.html'], [eleven+'/emblem.png','/11-metre/emblem.png'],
    [soccer+'/app-ads.txt','/app-ads.txt'], [eleven+'/app-ads.txt','/app-ads.txt']]) {
    assert.equal(await (await handle(new Request(url), env)).text(),asset);
  }
});

test('discovery describes the new endpoints without changing upstream errors', async () => {
  const discovery = {health:'/health/live',readiness:'/health/ready',signalR:'/hubs/game',guestSessions:'/api/guest-sessions'};
  for (const path of ['/api','/api/','/api/status']) {
    const response = await handle(new Request(soccer+path),env,req=>{
      assert.equal(req.url,originSoccer+'/');
      return Response.json(discovery);
    });
    assert.deepEqual(await response.json(),{health:'/api/health/live',readiness:'/api/health/ready',signalR:'/api/hubs/game',guestSessions:'/api/guest-sessions'});
  }
  const failed = await handle(new Request(eleven+'/api/config'),env,()=>new Response(null,{status:503}));
  assert.equal(failed.status,503);
});

test('11 Metre config advertises canonical game invites and keeps active auth and store settings', async () => {
  const state = {publicUrl:origin11, cosmeticShop:{mode:'sandbox'}, auth:{providers:['apple','google']}};
  const response = await handle(new Request(eleven+'/api/config'),env,req=>{
    assert.equal(req.url,origin11+'/api/config');
    return Response.json(state,{headers:{etag:'stale','cache-control':'public'}});
  });
  assert.deepEqual(await response.json(),{...state,publicUrl:eleven});
  assert.equal(response.headers.get('etag'),null);
  assert.equal(response.headers.get('cache-control'),'no-store');
});

test('REST, private and quick Colyseus rooms, and SignalR use the original routes', async () => {
  for (const [url, path, upgrade] of [
    [eleven+'/api',origin11+'/api/health'], [eleven+'/api/config',origin11+'/api/config'],
    [eleven+'/api/matchmake/joinById/AABBEEDD',origin11+'/matchmake/joinById/AABBEEDD'],
    [eleven+'/api/proc-test/ABCDEF01?sessionId=reserved',origin11+'/proc-test/ABCDEF01?sessionId=reserved',true],
    [eleven+'/api/proc-test/q-u1Ck_ID?sessionId=reserved',origin11+'/proc-test/q-u1Ck_ID?sessionId=reserved',true],
    [soccer+'/api/health',originSoccer+'/health/live'],[soccer+'/api/health/ready',originSoccer+'/health/ready'],
    [soccer+'/api/hubs/game/negotiate?negotiateVersion=1',originSoccer+'/hubs/game/negotiate?negotiateVersion=1'],
    [soccer+'/api/hubs/game?access_token=test',originSoccer+'/hubs/game?access_token=test',true],
    [soccer+'/api/friends',originSoccer+'/api/friends']]) {
    const headers = {authorization:'Bearer test','x-forwarded-host':'untrusted.invalid'};
    if (upgrade) headers.upgrade='websocket';
    await handle(new Request(url,{headers}),env,(req,opts)=>{
      assert.equal(req.url,path); assert.equal(req.headers.get('authorization'),'Bearer test');
      assert.equal(req.headers.has('x-forwarded-host'),false); assert.equal(opts.redirect,'manual');
      if (upgrade) assert.equal(req.headers.get('upgrade'),'websocket');
      return new Response(null,{status:401});
    });
  }
});

test('original JSON body and method reach the backend; only our own origin is translated', async () => {
  for (const from of [eleven,'capacitor://localhost','https://other.example']) {
    const res = await handle(new Request(eleven+'/api/session/guest',{method:'POST',headers:{origin:from},body:'{"name":"test"}'}),env,async req=>{
      assert.equal(req.method,'POST'); assert.equal(await req.text(),'{"name":"test"}');
      assert.equal(req.headers.get('origin'),from===eleven?origin11:from);
      return new Response(null,{headers:{'access-control-allow-origin':req.headers.get('origin')}});
    });
    assert.equal(res.headers.get('access-control-allow-origin'),from);
  }
});

test('web game preserves its storage and OAuth origin, language and invitation',async()=>{
  for (const [path,target] of [['/oyna/?lang=tr','/?lang=tr'],['/d/ABCDEF01','/d/ABCDEF01'],['/hesap-sil?lang=el','/hesap-sil?lang=el']]){
    const res = await handle(new Request(eleven+path),env); assert.equal(res.status,307);
    assert.equal(res.headers.get('location'),origin11+target);
  }
  assert.equal((await handle(new Request('https://other.example/api/health'),env)).status,404);
});

test('existing legal, support and OAuth home links find the localized published document',async()=>{
  for (const [path,languageHeader,target] of [
    ['/gizlilik/?lang=fr&utm_source=game','tr','/fr/privacy.html?lang=fr&utm_source=game'],
    ['/kullanim-kosullari','en-US,en;q=0.9','/en/terms.html'],
    ['/oyun?lang=tr','de','/?lang=tr'], ['/oyun/?lang=sq','tr','/sq/?lang=sq'],
    ['/gizlilik?lang=unknown','it','/privacy.html?lang=unknown']]) {
    const response = await handle(new Request(eleven+path,{headers:{'accept-language':languageHeader}}),env);
    assert.equal(response.status,302);
    assert.equal(response.headers.get('location'),eleven+target);
  }
});
