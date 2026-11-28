(() => {
  const current = new URL(location.href);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return;
  const target = new URL(canonical.href);
  const legacyHosts = ['umitcagdas.github.io', 'umitcagdas.com', 'www.umitcagdas.com'];
  if (legacyHosts.includes(current.hostname) && /^\/piknik-zamani(?:\/|$)/.test(current.pathname)) {
    target.search = current.search;
    target.hash = current.hash;
    location.replace(target.href);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const home = target.pathname === '/' || target.pathname === '/en/';
    const lang = document.documentElement.lang;
    const links = [...document.querySelectorAll('[data-language]')];
    const requested = current.searchParams.get('lang');
    const valid = ['tr', 'en'];
    let preference;
    try { preference = localStorage.getItem('piknik.siteLanguage'); } catch {}
    // A direct English URL and each legal document keep their own language.
    const preferred = valid.includes(requested) ? requested : (home && target.pathname === '/' ? preference : null);
    if (home && valid.includes(preferred) && preferred !== lang) {
      const choice = links.find(link => link.dataset.language === preferred);
      if (choice) {
        const next = new URL(choice.href);
        next.search = current.search;
        next.hash = current.hash;
        location.replace(next.href);
        return;
      }
    }
    if (home && requested === lang) { try { localStorage.setItem('piknik.siteLanguage',lang); } catch {} }
    for (const link of links) {
      const language = link.dataset.language;
      const next = new URL(link.href);
      next.search = current.search;
      next.hash = current.hash;
      if (current.searchParams.has('lang') && requested !== language) {
        next.search = current.search.slice(1).split('&').map(part =>
          new URLSearchParams(part).has('lang') ? 'lang=' + language : part).join('&');
      }
      link.href = next.href;
      link.addEventListener('click', () => { try { localStorage.setItem('piknik.siteLanguage',language); } catch {} });
    }
  });
})();
