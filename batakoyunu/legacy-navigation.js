(() => {
  const legacyHosts = ['umitcagdas.github.io', 'umitcagdas.com', 'www.umitcagdas.com'];
  if (!legacyHosts.includes(location.hostname) || !/^\/batakoyunu(?:\/|$)/.test(location.pathname)) return;

  const destination = new URL(document.querySelector('link[rel="canonical"]').href);
  destination.search = location.search;
  destination.hash = location.hash;
  location.replace(destination.href);
})();
