const siteOrigin = 'https://remotiq.umitcagdas.com';
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
  if (destination?.endsWith('/')) url.pathname += 'index.html';
  return env.ASSETS.fetch(new Request(url, request));
}
export default { fetch: (request, env) => handle(request, env) };
