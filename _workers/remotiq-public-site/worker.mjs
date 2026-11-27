const siteOrigin = 'https://remotiq.umitcagdas.com';
const releaseOrigin = 'https://umitcagdas.github.io';
const previousSites = new Set(['umitcagdas.com', 'www.umitcagdas.com']);
const languages = new Map(['en','de','es','fr','id','it','ja','ko','pt-BR','zh-Hans'].map(tag => [tag.toLowerCase(), tag]));

function marketingPath(path) {
  const parts = path.split('/').slice(1);
  const language = languages.get(parts[0].toLowerCase());
  if (language) parts.shift();
  const prefix = language ? '/' + language + '/' : '/';
  switch (parts.join('/').toLowerCase()) {
    case '': case 'index.html': return prefix;
    case 'get': case 'get/': case 'get.html': case 'get/index.html': return prefix + 'get/';
    case 'privacy': case 'privacy.html': return prefix + 'privacy.html';
    case 'support': case 'support.html': return prefix + 'support.html';
    default: return null;
  }
}

export async function handle(request, env, originFetch = fetch) {
  const url = new URL(request.url);
  if (previousSites.has(url.hostname)) {
    const prefix = /^\/remotiq(?=\/|$)/i.exec(url.pathname);
    if (prefix && (request.method === 'GET' || request.method === 'HEAD')) {
      const destination = marketingPath(url.pathname.slice(prefix[0].length) || '/');
      if (destination !== null) return Response.redirect(siteOrigin + destination + url.search, 301);
    }
    // The portfolio IIS site also hosts updater manifests and signed downloads.
    return originFetch(request);
  }

  if (url.hostname !== 'remotiq.umitcagdas.com') return new Response(null, { status: 404 });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const destination = marketingPath(url.pathname);
  if (url.protocol !== 'https:' || (destination !== null && url.pathname !== destination)) {
    return Response.redirect(siteOrigin + (destination ?? url.pathname) + url.search, 301);
  }
  // The published Tauri manifests, signatures and installers are one release set.
  // Use their native HTTP server for ranged downloads, validators and HEAD requests.
  if (url.pathname.startsWith('/downloads/')) {
    const file = new URL(releaseOrigin);
    file.pathname = '/Remotiq' + url.pathname;
    file.search = url.search;
    const headers = new Headers({ 'accept-encoding': 'identity' });
    for (const key of ['range', 'if-range', 'if-match', 'if-none-match', 'if-modified-since', 'if-unmodified-since']) {
      const value = request.headers.get(key);
      if (value !== null) headers.set(key, value);
    }
    // Some proxies compress a full HEAD response and lose the published byte length.
    // A one-byte GET returns the length of the identity representation used by installers.
    const metadata = request.method === 'HEAD' && !headers.has('range') && !headers.has('if-range');
    if (metadata) headers.set('range', 'bytes=0-0');
    const upstream = new Request(file, { method: metadata ? 'GET' : request.method, headers, redirect: 'manual' });
    const response = await originFetch(upstream, { cache: 'no-store' });
    const outgoing = new Headers(response.headers);
    const control = outgoing.get('cache-control');
    outgoing.set('cache-control', control ? control + ', no-transform' : 'no-transform');
    if (!metadata) return new Response(response.body, { status: response.status, headers: outgoing });
    await response.body?.cancel();
    const match = /^bytes 0-0\/(\d+)$/.exec(outgoing.get('content-range') ?? '');
    if (response.status === 206 && match) {
      outgoing.delete('content-range');
      outgoing.set('content-length', match[1]);
      return new Response(null, { status: 200, headers: outgoing });
    }
    return new Response(null, { status: response.status, headers: outgoing });
  }
  if (destination?.endsWith('/')) url.pathname += 'index.html';
  return env.ASSETS.fetch(new Request(url, request));
}
export default { fetch: (request, env) => handle(request, env) };
