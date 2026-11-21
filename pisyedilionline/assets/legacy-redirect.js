(function () {
  const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
  const { hostname, pathname, search, hash } = window.location;
  const prefix = "/pisyedilionline";
  if (!legacyHosts.includes(hostname) || (pathname !== prefix && !pathname.startsWith(prefix + "/"))) {
    return;
  }

  const target = new URL("https://pisyedili.umitcagdas.com");
  target.pathname = pathname.slice(prefix.length).replace(/\/index\.html$/, "/") || "/";
  target.search = search;
  target.hash = hash;
  window.location.replace(target.href);
})();
