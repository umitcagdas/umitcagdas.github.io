import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import test from 'node:test';
import {handle} from './worker.mjs';
const site='https://piknikzamani.umitcagdas.com';
const paths=['/','/en/','/support.html','/support-tr.html','/privacy.html','/privacy-tr.html','/sitemap.xml','/robots.txt','/app-ads.txt'];
const env={ASSETS:{fetch(request){const path=new URL(request.url).pathname;try{const file=new URL('./.public'+path,import.meta.url);return statSync(file).isFile()?new Response(request.method==='HEAD'?null:readFileSync(file)):new Response(null,{status:404})}catch{return new Response(null,{status:404})}}}};
test('static pages, head, localized metadata and local assets',async()=>{
  for(const path of paths){
    for(const method of ['GET','HEAD']){
      const response=await handle(new Request(site+path,{method}),env);
      assert.equal(response.status,200,path); const content=await response.text(); if(method==='HEAD')assert.equal(content,'');
      if(method!=='GET'||!(/\.html$|\/$/.test(path)))continue;
      assert.ok(content.includes('rel="canonical" href="'+site+path+'"'));
      assert.ok(content.includes('hreflang="en"')&&content.includes('hreflang="tr"'));
      for(const a of content.matchAll(/(?:src|href)="((?:\.\.\/|\.\/)?(?:assets\/[^"]+|style\.css))"/g)){
        const url=new URL(a[1],site+path);assert.equal((await handle(new Request(url),env)).status,200,url.pathname);
      }
      if(path==='/'||path==='/en/')assert.doesNotMatch(content,/apps\.apple\.com|play\.google\.com/);
    }
  }
});
test('market pages and portfolio aliases preserve query; wrong hosts, methods, and routes stay isolated',async()=>{
  const qs='?src=a%2Bb&tag=x%20y';
  for(const [alias,target] of [['/index.html','/'],['/en','/en/'],['/en/index.html','/en/'],['/privacy','/privacy.html'],['/support-tr','/support-tr.html']]){
    const r=await handle(new Request(site+alias+qs),env);assert.equal(r.status,301);assert.equal(r.headers.get('location'),site+target+qs);
  }
  for(const host of ['umitcagdas.com','www.umitcagdas.com']){
    const r=await handle(new Request('https://'+host+'/piknik-zamani/privacy-tr.html'+qs),env);assert.equal(r.headers.get('location'),site+'/privacy-tr.html'+qs);
    assert.equal((await handle(new Request('https://'+host+'/piknik-zamanim'),env,()=>new Response('prior route'))).status,200);
  }
  assert.equal((await handle(new Request(site+'/api'),env)).status,404);
  assert.equal((await handle(new Request(site+'/',{method:'POST'}),env)).status,405);
  assert.equal((await handle(new Request('https://sample.invalid/'),env)).status,404);
});
