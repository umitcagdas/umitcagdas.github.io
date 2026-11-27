(() => {
  const canonical = document.querySelector('link[rel="canonical"]');
  const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];

  function navigate(target, replace) {
    const url = new URL(target, location.href);
    url.search = location.search;
    url.hash = location.hash;
    if (replace) location.replace(url.href);
    else location.assign(url.href);
  }

  if (legacyHosts.includes(location.hostname) && /^\/remotiq(?:\/|$)/i.test(location.pathname)) {
    navigate(canonical.href, true);
    return;
  }

  const picker = document.querySelector("[data-language-picker]");
  picker?.addEventListener("change", () => {
    const option = picker.selectedOptions[0];
    localStorage.setItem("remotiq.siteLocale", option.lang);
    navigate(option.value, false);
  });

  if (document.body.dataset.siteLocale !== "tr" || localStorage.getItem("remotiq.siteLocale") ||
      sessionStorage.getItem("remotiq.languageChecked")) return;

  sessionStorage.setItem("remotiq.languageChecked", "1");
  const supported = ["en", "tr", "de", "es", "fr", "pt-BR", "it", "ja", "ko", "zh-Hans", "id"];
  const language = (navigator.languages?.[0] || navigator.language || "tr").toLowerCase();
  const preferred = supported.find((code) => code.toLowerCase().split("-")[0] === language.split("-")[0]);
  if (preferred && preferred !== "tr") {
    const target = document.querySelector(`link[rel="alternate"][hreflang="${preferred}"]`);
    if (target) navigate(target.href, true);
  }
})();
