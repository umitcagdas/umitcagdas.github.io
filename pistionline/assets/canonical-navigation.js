(() => {
  "use strict";

  const location = window.location;
  const portfolioHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
  if (!portfolioHosts.includes(location.hostname) || !location.pathname.startsWith("/pistionline/")) return;

  const target = new URL(document.querySelector('link[rel="canonical"]').href);
  if (target.origin !== "https://pisti.umitcagdas.com") return;

  // The existing manual ad landing records its store clicks on the portfolio host.
  if (location.hostname === "umitcagdas.com" && target.pathname === "/indir/") {
    const params = new URLSearchParams(location.search);
    if (params.get("manual") === "1" && params.get("gad_campaignid") === "24498275745") return;
  }

  target.search = location.search;
  target.hash = location.hash;
  window.pistiNavigatingToCanonical = true;
  location.replace(target.href);
})();
