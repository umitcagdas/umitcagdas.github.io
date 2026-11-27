(() => {
  const { hostname, pathname, search, hash } = window.location;
  const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
  if (!legacyHosts.includes(hostname)) return;
  if (pathname !== "/11-metre" && !pathname.startsWith("/11-metre/")) return;

  const target = new URL(document.querySelector('link[rel="canonical"]').href);
  if (target.origin !== "https://11metre.umitcagdas.com") return;
  target.search = search;
  target.hash = hash;
  window.location.replace(target.href);
})();
