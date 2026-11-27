const soccer = 'supersoccer.umitcagdas.com';
const eleven = '11metre.umitcagdas.com';
const soccerBackend = 'https://soccer.kobitron.com';
const elevenBackend = 'https://onbirmetre.kobitron.com';
const languages = new Set(['de', 'en', 'es', 'fr', 'it', 'nl', 'el', 'pt', 'sq']);

function publicAsset(host, path) {
  if (path === '/app-ads.txt') return path;
  if (host === soccer) {
    if (['/', '/index.html', '/oyun.html'].includes(path)) return '/supersoccer/oyun.html';
    if (['/privacy', '/privacy/', '/privacy.html'].includes(path)) return '/supersoccer/index.html';
    return '/supersoccer' + path;
  }
  if (path === '/') return '/11-metre/index.html';
  if (path.endsWith('/')) return '/11-metre' + path + 'index.html';
  if (languages.has(path.slice(1))) return '/11-metre' + path + '/index.html';
  return '/11-metre' + path;
}

function backendPath(host, url, isSocket) {
  const path = url.pathname;
  if (host === soccer) {
    if (path === '/api' || path === '/api/' || path === '/api/status') return '/';
    if (path === '/api/health' || path === '/api/health/') return '/health/live';
    if (/^\/api\/(?:health|hubs\/game)(?:\/|$)/.test(path)) return path.slice(4);
  } else {
    if (path === '/api' || path === '/api/' || path === '/api/status') return '/api/health';
    if (path.startsWith('/api/matchmake/')) return path.slice(4);
    if (isSocket && /^\/api\/[\w-]+\/(?:[a-f\d]{8}|[\w-]{9})\/?$/i.test(path)) return path.slice(4);
  }
  if (path.startsWith('/api/')) return path;
  return null;
}

// Browser game sessions and pending web OAuth attempts are stored by origin.
// Keep the existing web player for these entries. Native clients use the new API.
function existingBrowserPlayer(path) {
  if (path === '/oyna' || path === '/oyna/') return '/';
  if (/^\/d\/[a-f\d]{8}\/?$/i.test(path) ||
      /^\/(?:hesap-sil|auth\/callback)\/?$/.test(path)) return path;
  return null;
}

async function backendResponse(request, url, path, isSocket, send) {
  const isSoccer = url.hostname === soccer;
  const origin = isSoccer ? soccerBackend : elevenBackend;
  const target = new URL(origin);
  target.pathname = path;
  target.search = url.search;
  const upstream = new Request(target, request);
  for (const header of ['host', 'forwarded', 'x-forwarded-host']) upstream.headers.delete(header);
  const fromPublicSite = request.headers.get('Origin') === url.origin;
  if (fromPublicSite) upstream.headers.set('Origin', origin);
  const options = { redirect: 'manual' };
  if (!isSocket) options.cache = 'no-store';
  const result = await send(upstream, options);
  if (isSocket && result.status === 101) return result;

  const response = new Response(result.body, result);
  response.headers.set('cache-control', 'no-store');
  if (fromPublicSite && response.headers.get('access-control-allow-origin') === origin) {
    response.headers.set('access-control-allow-origin', url.origin);
    response.headers.append('vary', 'Origin');
  }
  const changesJson = request.method === 'GET' && result.ok &&
    (isSoccer ? path === '/' : path === '/api/config');
  if (!changesJson || !response.headers.get('content-type')?.includes('application/json')) return response;
  const json = await response.json();
  if (isSoccer) {
    for (const key of ['health', 'readiness', 'signalR']) {
      if (typeof json[key] === 'string' && /^\/(?:health|hubs)\//.test(json[key])) json[key] = '/api' + json[key];
    }
  } else if (json.publicUrl === elevenBackend) {
    json.publicUrl = url.origin;
  }
  for (const name of ['content-length', 'content-encoding', 'etag', 'last-modified']) response.headers.delete(name);
  return Response.json(json, { status: response.status, headers: response.headers });
}

export async function handle(request, env, send = fetch) {
  const url = new URL(request.url);
  if (url.hostname !== soccer && url.hostname !== eleven) return new Response(null, { status: 404 });
  if (url.protocol === 'http:') {
    url.protocol = 'https:';
    return Response.redirect(url.href, 308);
  }
  const isSocket = request.headers.get('Upgrade')?.toLowerCase() === 'websocket';
  const path = backendPath(url.hostname, url, isSocket);
  if (path !== null) return backendResponse(request, url, path, isSocket, send);
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const player = url.hostname === eleven && existingBrowserPlayer(url.pathname);
  if (player) {
    return new Response(null, { status: 307, headers: {
      location: elevenBackend + player + url.search, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer'
    } });
  }
  const file = new URL(url.origin);
  file.pathname = publicAsset(url.hostname, url.pathname);
  return env.ASSETS.fetch(new Request(file, request));
}

export default { fetch: (request, env) => handle(request, env) };
