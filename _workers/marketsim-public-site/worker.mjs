const publicOrigin = 'https://marketsim.umitcagdas.com';
const portfolioHosts = new Set(['umitcagdas.com', 'www.umitcagdas.com']);
const legacyBase = '/mahallemarketi';
const canonicalPaths = new Map([
  ['/index.html', '/'],
  ['/tr', '/tr/'],
  ['/tr/index.html', '/tr/'],
  ['/privacy', '/privacy.html'],
  ['/support', '/support.html'],
  ['/privacy-tr', '/privacy-tr.html'],
  ['/support-tr', '/support-tr.html'],
]);

function redirectToSite(url, path) {
  const destination = new URL(publicOrigin);
  destination.pathname = path;
  destination.search = url.search;
  return Response.redirect(destination, 301);
}

export function handle(request, env, originFetch = fetch) {
  const url = new URL(request.url);
  const read = request.method === 'GET' || request.method === 'HEAD';
  if (portfolioHosts.has(url.hostname)) {
    if (read && (url.pathname === legacyBase || url.pathname.startsWith(legacyBase + '/'))) {
      const path = url.pathname.slice(legacyBase.length) || '/';
      return redirectToSite(url, canonicalPaths.get(path) ?? path);
    }
    return originFetch(request);
  }
  if (url.hostname !== 'marketsim.umitcagdas.com') return new Response(null, { status: 404 });
  if (!read) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const path = canonicalPaths.get(url.pathname);
  if (path || url.origin !== publicOrigin) return redirectToSite(url, path ?? url.pathname);
  if (url.pathname === '/' || url.pathname === '/tr/') url.pathname += 'index.html';
  return env.ASSETS.fetch(new Request(url, request));
}

export default { fetch: (request, env) => handle(request, env) };
