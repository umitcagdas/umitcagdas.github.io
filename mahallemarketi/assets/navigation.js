(() => {
  const links = [...document.querySelectorAll('a[data-language]')];
  const allowed = ['en', 'tr'];
  const current = document.documentElement.lang;
  const page = new URL(location.href);
  const queryLanguage = page.searchParams.get('lang')?.toLowerCase();
  const explicit = allowed.includes(queryLanguage) ? queryLanguage : null;
  const key = 'marketSim.siteLanguage';
  let saved;
  try {
    saved = localStorage.getItem(key);
  } catch {}
  function remember(language) {
    try {
      localStorage.setItem(key, language);
    } catch {}
  }

  function languageUrl(link) {
    const target = new URL(link.href);
    target.search = page.search;
    target.hash = page.hash;
    return target;
  }

  const isLanding = document.body.classList.contains('landing');
  const legacy = ['umitcagdas.github.io', 'umitcagdas.com', 'www.umitcagdas.com'].includes(page.hostname);
  if (legacy) return;

  // Only the default landing page negotiates a language. A direct legal link
  // or /tr/ stays in its own language unless the visitor switches explicitly.
  const browserLanguage = (navigator.languages?.length ? navigator.languages : [navigator.language || ''])
    .map(language => language.toLowerCase().split('-')[0])
    .find(language => allowed.includes(language));
  const preferred = explicit || (current === 'en' && (allowed.includes(saved) ? saved : browserLanguage));
  if (isLanding && preferred && preferred !== current) {
    const target = links.find(link => link.dataset.language === preferred);
    if (target) {
      location.replace(languageUrl(target).href);
      return;
    }
  }

  for (const link of links) {
    const target = languageUrl(link);
    // Include the language choice when linking to the default page so a new
    // tab or a browser with disabled local storage can still open English.
    const language = link.dataset.language;
    if (page.searchParams.has('lang') && queryLanguage !== language) {
      // Update only the language field. Keep other fields and their original encoding.
      target.search = page.search.slice(1).split('&').map(part =>
        new URLSearchParams(part).has('lang') ? 'lang=' + language : part
      ).join('&');
    } else if (isLanding && language === 'en' && !page.searchParams.has('lang')) {
      target.search = (target.search ? target.search + '&' : '?') + 'lang=en';
    }
    link.href = target.href;
    link.addEventListener('click', () => remember(link.dataset.language));
  }
  if (isLanding && explicit === current) remember(current);
})();
