const site = 'https://batakoffline.umitcagdas.com';
const legacyHosts = new Set(['umitcagdas.com', 'www.umitcagdas.com']);
const legacyBase = '/batakoyunu';
const aliases = new Map([
  ['/index.html', '/'],
  ['/privacy', '/privacy.html'],
  ['/privacy-policy.html', '/privacy.html'],
  ['/support', '/support.html'],
]);

export function handle(request, env, originFetch = fetch) {
  const url = new URL(request.url);
  const read = request.method === 'GET' || request.method === 'HEAD';
  if (legacyHosts.has(url.hostname)) {
    if (read && (url.pathname === legacyBase || url.pathname.startsWith(legacyBase + '/'))) {
      const path = url.pathname.slice(legacyBase.length) || '/';
      url.protocol = 'https:';
      url.hostname = 'batakoffline.umitcagdas.com';
      url.port = '';
      url.pathname = aliases.get(path) ?? path;
      return Response.redirect(url, 301);
    }
    return originFetch(request);
  }
  if (url.hostname !== 'batakoffline.umitcagdas.com') return new Response(null, { status: 404 });
  if (!read) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const canonical = aliases.get(url.pathname);
  if (url.origin !== site || canonical) return Response.redirect(site + (canonical ?? url.pathname) + url.search, 301);
  if (url.pathname === '/') url.pathname = '/index.html';
  return env.ASSETS.fetch(new Request(url, request));
}

export default { fetch: (request, env) => handle(request, env) };
